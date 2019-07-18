/*
** tk.js
**
** Token matching functions
*/
var events = ["Event"];
var texts = ["Text"];
var operators = "+-*/=><";
var tk = {
    symbol: function (value, charNumber) {
        return {
            type: "SYMBOL",
            value: value,
            charNumber: charNumber
        };
    },
    comment: function (value, charNumber, block, newline) {
        return {
            type: "COMMENT",
            value: value,
            charNumber: charNumber,
            block: block,
            newline: newline
        };
    },
    array: function (value, charNumber) {
        return {
            type: "ARRAY",
            value: value,
            charNumber: charNumber
        };
    },
    object: function (value, charNumber) {
        return {
            type: "OBJECT",
            value: value,
            charNumber: charNumber
        };
    },
    terminator: function (value, charNumber, lineNumber) {
        return {
            type: "TERMINATE",
            value: value,
            charNumber: charNumber,
            lineNumber: lineNumber
        };
    },
    special: function (value, charNumber) {
        return {
            type: "SPECIAL",
            value: value,
            charNumber: charNumber
        };
    },
    string: function (value, charNumber) {
        return {
            type: "STRING",
            value: value,
            charNumber: charNumber
        };
    },
    space: function (value, charNumber) {
        return {
            type: "SPACE",
            value: value,
            charNumber: charNumber
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
    isArray: function (obj) {
        return obj.type === "ARRAY";
    },
    isComment: function (obj) {
        return obj.type === "COMMENT";
    },
    isBlockComment: function (obj) {
        return obj.type === "COMMENT" && obj.block === true;
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
module.exports.tk = tk;
