/*
** ch.js
**
** Character matching functions
*/

var id = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-*/=><!0123456789_.#";
var special = "(){}:,[]";
var newlines = ["\n"];
var spaces = [" ", "\t"];
var regexp = ["\\"];
var comments = "//";

var ch = {
    isSpecial: function (char) {
        return special.indexOf(char) > -1;
    },
    isIdentifier: function (char) {
        return id.indexOf(char) > -1;
    },
    isNewline: function (char) {
        return newlines.indexOf(char) > -1;
    },
    isSpace: function (char) {
        return /\s/.test(char);
    },
    isQuote: function (char) {
        return "\"" === char;
    },
    isQuoteSingle: function (char) {
        return "\'" === char;
    },
    isRegExp: function (char) {
        return regexp.indexOf(char) > -1;
    },
    isObject: function (char) {
        return char === "{";
    },
    isObjectEnd: function (char) {
        return char === "}";
    },
    isArray: function (char) {
        return char === "[";
    },
    isArrayEnd: function (char) {
        return char === "]";
    },
    isComment: function (char1, char2) {
        return char1 == "/" && char2 == "/";
    },
    isBlockComment: function (char1, char2) {
        return char1 == "/" && char2 == "*";
    },
    isBlockCommentEnd: function (char1, char2) {
        return char1 == "*" && char2 == "/";
    }
};
module.exports.ch = ch;
