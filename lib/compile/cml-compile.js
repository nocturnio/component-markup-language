(function () {
    var moduleCompile = function (m) {
        var name = m.__name__ || "";
        var input = m.__input__ || [];
        var props = m.__props__ || [];

        var propsCode = props.reduce(function (accum, p) {
            return accum + propRead(p) + ";";
        }, "");

        var loadPropsCode = `function(self, context){var cml=cs.cml;${propsCode}}`;

        m.__name__ = strLiteral(name);
        m.__class__ = strLiteral(m.__class__);
        delete m.__input__;
        delete m.__props__;

        var inputStr = input.join(",");
        var mSerialized = serialize(m);
        return `(function(cs){cs.__loaders__.${name}=function(${inputStr}){` +
            `return cs.__load__(${mSerialized}, ${loadPropsCode});}`+
            `})(window.cmlruntime);`;
    };

    var makeEvent = function (prop) {
        if (!haveKey(prop, "__name__")) {
            return compileError("__name__" + " missing from " + prop.__class__);
        }
        var name = prop.__name__;
        var input = prop.__input__.join(",");
        var action = ref(prop, "__action__");
        var nameLiteral = strLiteral(name);
        return `context.load_event(${nameLiteral}, function(${input}){${action}})`;
    };

    var makeElement = function (prop) {
        var propInput = prop.__input__;
        if (prop.__haveInput__) {
            var inputStr = propInput.join(",");
            delete prop.__input__;
            var name = prop.__name__;
            prop.__function__ = name;
            var pSerialized = serialize(prop, true);
            var nameLiteral = prop.__name__; // serialize strLiterals name
            return `var ${name}=function(${inputStr}){` +
                `context.load_card_element(${pSerialized})};` +
                `context.load_event(${nameLiteral}, ${name})`;
        } else {
            var pSerialized = serialize(prop, true);
            return `context.load_card_element(${pSerialized})`;
        }
    };

    var propRead = function (prop) {
        var className = prop.__class__;
        var make = customMake(className);
        if (make) {
            return make(prop);
        } else {
            return makeElement(prop);
        }
    };

    var serialize = function (obj, isFirstPass) {
        var pairs = [];
        if (isFirstPass) {
            obj.__class__ = strLiteral(obj.__class__);
            obj.__name__ = strLiteral(obj.__name__);
            bindInternalProps(obj);
        }
        objForEachKey(obj, function (key) {
            var value = obj[key];
            if (isArray(value)) {
                var valuesSerialized = value.map(function (v) {
                    return serialize(v, true);
                }).join(",");
                var values = `[${valuesSerialized}]`;
                pairs.push(key + ":" + values);
            } else {
                pairs.push(key + ":" + value);
            }
        });
        return "{" + pairs.join(",") + "}";
    };

    var bindInternalProps = function (prop) {
        var internalProps = prop.__props__ || [];
        var items = [];
        internalProps.forEach(function (p) {
            var name = p.__name__;
            var className = p.__class__;
            if (name && className === "Event") {
                var input = p.__input__ || [];
                var inputStr = input.join(",");
                var action = p.__action__;
                prop[name] = `function(${inputStr}){${action}}`;
            } else {
                items.push(p);
            }
        });
        prop.__props__ = items;
    };

    var customMake = function (key) {
        var table = {
            "Event": makeEvent
        };
        return table[key];
    };

    // utility
    var isUndefined = function (obj) {
        return typeof (obj) === "undefined";
    };
    var isString = function (obj) {
        return typeof (obj) === "string";
    };
    var isArray = function (obj) {
        return obj instanceof Array;
    };
    var objForEachKey = function (obj, func) {
        for (var k in obj) {
            func(k);
        }
    };
    var haveKey = function (obj, key) {
        if (isUndefined(obj[key])) {
            var props = obj.__props__ || [];
            var found = props.find(function (p) {
                return key === p.__name__;
            });
            return found ? true : false;
        } else {
            return true;
        }
    };
    var ref = function (prop, key, def) {
        return prop[key] || def || "";
    };
    var strLiteral = function (str) {
        return "\"" + str + "\"";
    };
    var compileError = function (str) {
        throw "Compile Error: " + str;
    };

    if (typeof (exports) === "undefined") {
        exports = {};
    }

    exports.cmlcompile = moduleCompile;
})();
