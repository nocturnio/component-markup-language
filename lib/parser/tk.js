/*
** TOKENS
**
**
*/

(function () {
    var events = ["Event"];
    var texts = ["Text"];
    var operators = "+-*/=><";
    var tk = {
        symbol: function (value) {
            return {
                type: "SYMBOL",
                value: value
            };
        },
        terminator: function (value) {
            return {
                type: "TERMINATE",
                value: value
            };
        },
        special: function (value) {
            return {
                type: "SPECIAL",
                value: value
            };
        },
        string: function (value) {
            return {
                type: "STRING",
                value: value
            };
        },
        space: function (value) {
            return {
                type: "SPACE",
                value: value
            };
        },
        isSpace: function (obj) {
            return obj.type === "SPACE";
        },
        isTerminator: function (obj) {
            return obj.type === "TERMINATE";
        },
        isString: function (obj) {
            return obj.type === "STRING";
        },
        isSymbol: function (obj) {
            return obj.type === "SYMBOL";
        },
        isComma: function (obj) {
            return obj.type === "SPECIAL" &&
                obj.value === ",";
        },
        isList: function (obj) {
            return obj.type === "SPECIAL" &&
                obj.value === "[";
        },
        isListEnd: function (obj) {
            return obj.type === "SPECIAL" &&
                obj.value === "]";
        },
        isBlock: function (obj) {
            return obj.type === "SPECIAL" &&
                obj.value === "{";
        },
        isBlockEnd: function (obj) {
            return obj.type === "SPECIAL" &&
                obj.value === "}";
        },
        isArgs: function (obj) {
            return obj.type === "SPECIAL" &&
                obj.value === "(";
        },
        isArgsEnd: function (obj) {
            return obj.type === "SPECIAL" &&
                obj.value === ")";
        },
        isArgsSep: function (obj) {
            return obj.type === "SPECIAL" &&
                obj.value === ",";
        },
        isKeyPair: function (obj) {
            return obj.type === "SPECIAL" &&
                obj.value === ":";
        },
        isBinaryOperator: function (obj) {
            return obj.type === "SYMBOL" &&
                operators.indexOf(obj.value) > -1;
        },
        isEvent: function (obj) {
            return obj.type === "SYMBOL" &&
                events.indexOf(obj.value) > -1;
        },
        isText: function (obj) {
            return obj.type === "SYMBOL" &&
                texts.indexOf(obj.value) > -1;
        }
    };
    if (typeof(exports) === "undefined") {
        exports = {};
    }
    exports.tk = tk;
})();
