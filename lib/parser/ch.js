/*
** ch.js
**
** Character matching functions
*/

var id = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+-*/=><!0123456789_.#";
var special = "(){}:,[]";
var newlines = ["\n"];
var spaces = [" ", "\t"];
var quotes = ["\""];
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
        return quotes.indexOf(char) > -1;
    },
    isComment: function (chars) {
        return chars[0] == "/" && chars[1] == "/";
    },
    isBlockComment: function (chars) {
        return chars[0] == "/" && chars[1] == "*";
    },
    isBlockCommentEnd: function (char1, char2) {
        return char1 == "*" && char2 == "/";
    }
};
module.exports.ch = ch;
