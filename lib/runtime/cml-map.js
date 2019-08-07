module.exports.register = function (cml) {
    var cmlruntime = cml.cml;

    var _mapContainer = "DIV";

    cml.setDefaultMapModule = function (moduleName) {
        _mapContainer = moduleName;
    };

    // add map function to cml runtime
    cmlruntime.map = function (data, mapData, overwrite) {
        var fData = flattenObj(data);
        var moduleIR = {
            __class__: _mapContainer,
            __name__: _.uniqueId("module"),
            __haveInput__: false,
            __inputs__: [],
            __props__: []
        };
        Object.keys(fData).forEach(function (k) {
            var kPieces = k.split(".");
            var propName = kPieces[kPieces.length - 1];
            var dataValue = fData[k];
            var mapValue;
            if (mapData[k]) {
                mapValue = mapData[k];
            } else if (_.get(mapData, k)) {
                mapValue = _.get(mapData, k);
            } else if (mapData[propName]) {
                mapValue = mapData[propName];
            }
            if (mapValue) {
                moduleIR.__props__.push(mapToComponent(k, mapValue, dataValue));
            }
        });
        defineModule(moduleIR, overwrite);
        return cmlruntime.new(moduleIR.__name__);
    };

    var mapToComponent = function (k, mapValue, dataValue, owValue, postFix) {
        postFix = postFix || "";
        var pieces = k.split(".");
        var name = pieces[pieces.length - 1] + postFix;
        var componentIR = {
            __class__: mapValue,
            __name__: name,
            __haveInput__: false,
            __inputs__: [],
            __props__: []
        };
        var component = cml.getComponent(componentIR.__class__);
        var defaultProp = (component && component.defaultProperty) || "value";
        componentIR[defaultProp] = convertData(dataValue);
        return componentIR;
    };

    var defineModule = function (moduleIR, overwrite) {
        moduleIR.__props__.forEach(function (p) {
            if (!moduleIR[p.__name__]) {
                moduleIR[p.__name__] = p;
            } else {
                var newName = _.uniqueId(p.__name__);
                p.__name__ = newName;
                moduleIR[p.__name__] = p;
            }
        });
        var self = {};
        var owData = overwrite(self);
        _.merge(moduleIR, owData);
        cml.__loaders__[moduleIR.__name__] = function () {
            return cml.__load__(moduleIR, function (self, context) {
                _.merge(self, owData);
                Object.keys(moduleIR).forEach(function (k) {
                    if (!k.match(new RegExp("__.+__"))) {
                        if (_.isFunction(moduleIR[k])) {
                            context.load_event(k, moduleIR[k]);
                        } else if (moduleIR[k].__class__) {
                            context.load_card_element(moduleIR[k]);
                        }
                    }
                });
                moduleIR.__props__.forEach(function (p) {
                    moduleIR[p.__name__] = undefined;
                });
            }, self);
        };
    };

    // utility
    var flattenObj = function (obj, parent, res) {
        res = res || {};
        for (let key in obj) {
            let propName = parent ? parent + '.' + key : key;
            if (_.isArray(obj[key])) {
                res[propName] = obj[key];
            } else if (_.isObject(obj[key])) {
                flattenObj(obj[key], propName, res);
            } else {
                res[propName] = obj[key];
            }
        }
        return res;
    };

    var convertData = function (data) {
        return () => {
            return data;
        };
    };
};
