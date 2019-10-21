module.exports.register = function (cml, modules) {
    const http = modules.http;
    var cmlruntime = cml.cml;

    var _mapContainer = "DIV";

    cml.setDefaultMapModule = function (moduleName) {
        _mapContainer = moduleName;
    };

    cmlruntime.map = function (query, mapData, overwrite) {
        return baseMap(query, mapData, overwrite);
    };

    var baseMap = function (data, mapData, overwrite) {
        var fData = flattenObj(data);
        var moduleIR = {
            __class__: _mapContainer,
            __name__: _.uniqueId("module"),
            __haveInput__: false,
            __inputs__: [],
            __props__: []
        };
        overwrite = overwrite || function (self) { return {}; };
        Object.keys(fData).forEach(function (k) {
            var kPieces = k.split(".");
            var propName = kPieces[kPieces.length - 1];
            var dataValue = fData[k];
            /* Rule priority
                data { a: { b: { c: { d: 100 } } } }
                exactPath - a.b.c.d: "Type"
                subpath - b.c.d: "Type"
                propname - d: "Type"
            */
            /* Name priority
                data { a: { b: { c: { d: 100 } } } }
                exactPath - a_b_c_d
                subpath - a_b_c_d
                propname - d
            */
            var mapValue;
            var name;

            var exactPath = mapData[k] || _.get(mapData, k);

            if (exactPath) {
                mapValue = exactPath;
                name = k.split(".").join("_");
            } else {
                var mKey = findSubPath(k, mapData);
                var subPath = mKey && mapData[mKey];
                var nameMatch = mapData[propName];
                if (subPath) {
                    mapValue = subPath;
                    name = k.split(".").join("_");
                } else if (nameMatch) {
                    mapValue = nameMatch;
                    name = propName;
                }
            }

            if (mapValue) {
                moduleIR.__props__.push(mapToComponent(name, mapValue, dataValue));
            }
        });
        defineModule(moduleIR, overwrite);
        return cmlruntime.new(moduleIR.__name__);
    };

    var mapToComponent = function (name, mapValue, dataValue) {
        var className;
        var defaultProp;
        var mapValuePieces = mapValue.split(".");
        if (mapValuePieces.length > 1) {
            className = mapValuePieces[0];
            defaultProp = mapValuePieces.slice(1).join(".");
        } else {
            className = mapValue;
            defaultProp = cml.getComponent(className).defaultProperty || "value";
        }
        var componentIR = {
            __class__: className,
            __name__: name,
            __haveInput__: false,
            __inputs__: [],
            __props__: []
        };
        var component = cml.getComponent(componentIR.__class__);
        _.set(componentIR, defaultProp, convertData(dataValue));
        return componentIR;
    };

    var defineModule = function (moduleIR, overwrite) {
        moduleIR.__props__.forEach(function (p) {
            moduleIR[p.__name__] = p;
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
    var findSubPath = function (k, mapData) {
        return Object.keys(flattenObj(mapData)).find(function (mK) {
            var pieces = k.split(mK);
            return pieces[pieces.length - 1] === "";
        });
    };

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
