/*
** Decompile
**
** This module compiles IR to CML
*/

// IR Properties
// __name__ - name of object
// __input__ - array of parameter identifiers, if any
// __props__ - array of nested objects, if any
// __class__ - name of object class
// __haveInput__ - flag determining if there are any __input__
// __function__ - name of function, if IR is a function type
// __action__ - body of function (string), if IR is a function type

(function () {
    var moduleDecompile = function (m, indentLevel, indentSize, jsFormat, preIndentLevel) {
        indentLevel = indentLevel || 0;
        indentSize = indentSize || 4;
        preIndentLevel = preIndentLevel || 0;
        jsFormat = jsFormat || function (str) { return str; };
        var name = m.__name__ || "";
        var input = m.__input__ || [];
        var props = m.__props__ || [];
        var type = m.__class__;
        var haveInput = m.__haveInput__;
        var spaceValue = " ".repeat(indentSize);
        var indentValuePre = spaceValue.repeat(preIndentLevel);
        var indentValue = spaceValue.repeat(indentLevel);
        var indentValueInner = spaceValue.repeat(indentLevel + 1);
        var paramsValue = "";
        var idValue = "";

        if (type === "__KeyPair__") {
           return indentValue + m.__key__ + ": " + jsFormat(m.__value__, { inline: true });
       } else if (type === "__Comment__") {
           if (m.__closed__) {
               var formattedComment = m.__comment__;
               formattedComment = formattedComment.split("\n");
               formattedComment = formattedComment.map(function (str) { return str.trim(); });
               formattedComment = formattedComment.join("\n" + indentValue);
               return indentValue + "/*" + formattedComment + "*/";
           } else {
               return indentValue + "//" + m.__comment__;
           }
       } else {
            if (type) {
                if (type !== "Event") {
                    if (name === "") {
                        idValue = type;
                    } else {
                        idValue = type + " " + name;
                    }
                } else {
                    idValue = name;
                }
            }
            if (haveInput || input.length > 0) {
                paramsValue = "(" + input.join(", ") + ")";
            } else if (!haveInput && type === "Event") {
                paramsValue = "()";
            } else {
                paramsValue = "";
            }
            var rtn = "";
            var propsValue = "";
            if (type === "Event") {
                var jsCode = "";
                jsFormat(m.__action__).split("\n").forEach(function (line, index, arr) {
                    var indent = "";
                    var formattedLine = line;
                    if (index > 0) {
                        if (line.indexOf("{{IndentMarker}}") > -1) {
                            formattedLine = formattedLine.split("{{IndentMarker}}").join(indentValuePre);
                            indent = "\n" + indentValue;
                        } else {
                            indent = "\n" + indentValueInner;
                        }
                    }
                    jsCode += indent + formattedLine;
                });
                propsValue = indentValueInner + jsCode + "\n";
            } else {
                objForEachKey(m, function (k) {
                    if (!k.match(new RegExp("__.+__"))) {
                        propsValue += indentValueInner + `${k}: ` + jsFormat(m[k], { inline: true }) + "\n";
                    }
                });
                propsValue += props.reduce(function (accum, p) {
                    return accum + moduleDecompile(p, indentLevel + 1, indentSize, jsFormat, preIndentLevel) + "\n";
                }, "");
            }

            rtn += indentValue + `${idValue}${paramsValue} {\n${propsValue}` + indentValue + "}";
            return rtn;
        }
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

    exports.cmldecompile = moduleDecompile;
})();
