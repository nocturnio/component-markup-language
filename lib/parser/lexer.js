/*
** LEXER
**
**
*/

const ch = require("./ch.js").ch;
const tk = require("./tk.js").tk;

(function () {

    // lexer
    var lexer = function (str) {
        var i = 0;
        var maxI = str.length;
        var tokens = [];
        while (i < maxI) {
            i = lex(i, maxI, str, tokens);
        }
        return tokens;
    };

    var lex = function (i, maxI, str, tokens) {
        var char = str[i];
        var action = lexAction(char);
        var nextI = action(i, maxI, str, tokens);
        return nextI;
    };

    var lexAction = function (char) {
        if (ch.isSpecial(char)) {
            return lexSpecial;
        } else if (ch.isIdentifier(char)) {
            return lexIdentifier;
        } else if (ch.isQuote(char)) {
            return lexString;
        } else if (ch.isNewline(char)) {
            return lexNewline;
        } else if (ch.isSpace(char)) {
            return lexContinue;
        } else {
            return lexSymbol;
        }
    };

    var lexContinue = function (i, maxI, str, tokens) {
        return i + 1;
    };

    var lexString = function (i, maxI, str, tokens) {
        var escapeChar = "\\";
        var quoteChar = "\"";
        var quoted = "\\\"";
        var increment = function () { i++; }
        var haveMore = function () {
            var char = str[i];
            var isQuote = ch.isQuote(char);
            if (maxI === i) return false;
            else return !isQuote;
        };
        var collect = function () {
            var char = str[i];
            if (char === escapeChar) {
                increment();
                var nextChar = str[i];
                if (nextChar === quoteChar) {
                    quoted = quoted + escapeChar + escapeChar + escapeChar + nextChar;
                } else if (nextChar === escapeChar) {
                    quoted = quoted + escapeChar + escapeChar + escapeChar + escapeChar;
                } else {
                    quoted = quoted + escapeChar + escapeChar + nextChar;
                }
            } else {
                quoted = quoted + char;
            }
            increment();
        };
        increment();
        while (haveMore()) {
            collect();
        }
        quoted = quoted + escapeChar + quoteChar;
        tokens.push(tk.string(quoted));
        return i + 1;
    };

    var lexSpecial = function (i, maxI, str, tokens) {
        var char = str[i];
        tokens.push(tk.special(char));
        return i + 1;
    };

    var lexNewline = function (i, maxI, str, tokens) {
        tokens.push(tk.terminator(";"));
        var haveMore = function () {
            var char = str[i];
            return i !== maxI && (ch.isNewline(char) || ch.isSpace(char));
        };
        var skip = function () {
            i++;
        };
        while(haveMore()) {
            skip();
        }
        return i;
    };

    var lexSpace = function (i, maxI, str, tokens) {
        tokens.push(tk.space(" "));
        var haveMore = function () {
            var char = str[i];
            return i !== maxI && ch.isSpace(char);
        };
        var skip = function () {
            i++;
        };
        while(haveMore()) {
            skip();
        }
        return i;
    };

    var lexSymbol = function (i, maxI, str, tokens) {
        var char = str[i];
        tokens.push(tk.symbol(char));
        return i + 1;
    };

    var lexIdentifier = function (i, maxI, str, tokens) {
        return lexCollect(i, maxI, str, tokens, tk.symbol, ch.isIdentifier);
    };

    var lexCollect = function (i, maxI, str, tokens, tkCreate, chMatch) {
        var value = "";
        var increment = function () { i++; };
        var haveMore = function () {
            var char = str[i];
            return i !== maxI && chMatch(char, str[i+1]);
        };
        var collect = function () {
            var char = str[i];
            value = value + char;
            increment();
        };
        while(haveMore()) {
            collect();
        }
        if (ch.isComment(value)) {
            var nextI = lexCollect(i, maxI, str, [], tkCreate, function (c) {
                return !ch.isNewline(c);
            });
            return lexNewline(nextI, maxI, str, []);
        } else if (ch.isBlockComment(value)) {
            var nextI = lexCollect(i, maxI, str, [], tkCreate, function (c1, c2) {
                return !ch.isBlockCommentEnd(c1, c2);
            });
            return lexNewline(nextI + 2, maxI, str, []);
        } else {
            tokens.push(tkCreate(value));
            return i;
        }
    };
    if (typeof(exports) === "undefined") {
        exports = {};
    }
    exports.lexer = lexer;
})();
