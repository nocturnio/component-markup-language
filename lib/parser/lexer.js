/*
** lexer.js
**
** The lexer traverses the code char by char
** Creates tokens based on the lexicon
*/

const ch = require("./ch.js").ch;
const tk = require("./tk.js").tk;

// variables
var _charCount = 0;
var _newLineCount = 0;

// actions
var lexer = function (str) {
    // reset
    _newLineCount = 0;
    _charCount = 0;

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
    var action = lexAction(i, str);
    var nextI = action(i, maxI, str, tokens);
    return nextI;
};

var lexAction = function (i, str) {
    var char = str[i];
    var char2 = str[i + 1];
    if (ch.isArray(char)) {
        return lexArray;
    } else if (ch.isComment(char, char2)) {
        return lexComment;
    } else if (ch.isBlockComment(char, char2)) {
        return lexBlockComment;
    } else if (ch.isSpecial(char)) {
        return lexSpecial;
    } else if (ch.isIdentifier(char)) {
        return lexIdentifier;
    } else if (ch.isQuote(char)) {
        return lexString;
    } else if (ch.isQuoteSingle(char)) {
        return lexStringSingle;
    } else if (ch.isRegExp(char)) {
        return lexRegExp;
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

var lexRegExp = function (i, maxI, str, tokens) {
    var charCountStart = _charCount;
    var escapeChar = "\\";
    var regexp = escapeChar + escapeChar;
    var increment = function () {
        i++;
        incrementCharCounter();
    }
    var haveMore = function () {
        var char = str[i];
        var isRegExp = ch.isRegExp(char);
        if (maxI === i) return false;
        else return !isRegExp;
    };
    var collect = function () {
        var char = str[i];
        if (char === escapeChar) {
            increment();
            var nextChar = str[i];
            if (nextChar === quoteChar) {
                regexp = regexp + escapeChar + escapeChar + escapeChar + nextChar;
            } else if (nextChar === escapeChar) {
                regexp = regexp + escapeChar + escapeChar;
            } else {
                regexp = regexp + escapeChar + escapeChar + nextChar;
            }
        } else {
            regexp = regexp + char;
        }
        increment();
    };
    increment();
    while (haveMore()) {
        collect();
    }
    regexp = regexp + escapeChar + escapeChar;
    tokens.push(tk.string(regexp, charCountStart));
    return i + 1;
};

var lexStringBase = function (i, maxI, str, tokens, quoteChar, quoted, isQuote) {
    var escapeChar = "\\";
    var charCountStart = _charCount;
    var increment = function () {
        i++;
        incrementCharCounter();
    }
    var haveMore = function () {
        var char = str[i];
        if (maxI === i) return false;
        else return !isQuote(char);
    };
    var collect = function () {
        var char = str[i];
        if (char === escapeChar) {
            increment();
            var nextChar = str[i];
            if (nextChar === quoteChar) {
                quoted += escapeChar + escapeChar + escapeChar + nextChar;
            } else if (nextChar === escapeChar) {
                quoted += escapeChar + escapeChar + escapeChar + escapeChar;
            } else {
                quoted += escapeChar + escapeChar + nextChar;
            }
        } else if (char === "\"") {
            quoted += "\\\\\\\"";
        } else {
            quoted += char;
        }
        increment();
    };
    increment();
    while (haveMore()) {
        collect();
    }
    quoted += escapeChar + "\"";
    tokens.push(tk.string(quoted, charCountStart));
    return i + 1;
};

var lexString = function (i, maxI, str, tokens) {
    var quoteChar = "\"";
    var quoted = "\\\"";
    return lexStringBase(i, maxI, str, tokens, quoteChar, quoted, ch.isQuote);
};

var lexStringSingle = function (i, maxI, str, tokens) {
    var quoteChar = "'";
    var quoted = "\\\"";
    return lexStringBase(i, maxI, str, tokens, quoteChar, quoted, ch.isQuoteSingle);
};

var lexSpecial = function (i, maxI, str, tokens) {
    var char = str[i];
    var charCountStart = _charCount;
    tokens.push(tk.special(char, charCountStart));
    return i + 1;
};
var lexArray = function (i, maxI, str, tokens) {
    return lexEnclosed(i, maxI, str, tokens, ch.isArray, ch.isArrayEnd, tk.array);
};
var lexEnclosed = function (i, maxI, str, tokens, isOpen, isClose, tkCreate) {
    var charCountStart = _charCount;
    var value = "";
    var bracketCount = 1;
    var increment = function () {
        i++;
        incrementCharCounter();
    };
    var haveMore = function () {
        var char = str[i];
        return i < maxI && (bracketCount > 0);
    };
    var collect = function () {
        var char = str[i];
        if (ch.isNewline(char)) {
            incrementLineCounter();
        }
        if (isOpen(char)) {
            bracketCount++;
            value += serializeChar(char);
            increment();
        } else if (isClose(char)) {
            bracketCount--;
            value += serializeChar(char);
            increment();
        } else if (ch.isQuote(char)) {
            var nextI = lexString(i, maxI, str, tokens);
            var quotedString = tokens.pop();
            i = nextI;
            value += quotedString.value;
        } else if (ch.isQuoteSingle(char)) {
            var nextI = lexStringSingle(i, maxI, str, tokens);
            var quotedString = tokens.pop();
            i = nextI;
            value += quotedString.value;
        } else {
            value = value + serializeChar(char);
            increment();
        }
    };
    value += str[i];
    increment();
    while(haveMore()) {
        collect();
    }
    tokens.push(tkCreate(value, charCountStart));
    return i;
};

var lexNewline = function (i, maxI, str, tokens) {
    var charCountStart = _charCount;
    var count = 0;
    var haveMore = function () {
        var char = str[i];
        if (ch.isNewline(char)) {
            count++;
        }
        return i !== maxI && (ch.isNewline(char) || ch.isSpace(char));
    };
    var skip = function () {
        i++;
        incrementCharCounter();
    };
    while(haveMore()) {
        skip();
    }
    while (count > 0) {
        incrementLineCounter();
        count--;
    }
    tokens.push(tk.terminator(";", charCountStart, _newLineCount));
    return i;
};

var lexSpace = function (i, maxI, str, tokens) {
    var charCountStart = _charCount;
    tokens.push(tk.space(" ", charCountStart));
    var haveMore = function () {
        var char = str[i];
        return i !== maxI && ch.isSpace(char);
    };
    var skip = function () {
        i++;
        incrementCharCounter();
    };
    while(haveMore()) {
        skip();
    }
    return i;
};

var lexSymbol = function (i, maxI, str, tokens) {
    var charCountStart = _charCount;
    var char = str[i];
    tokens.push(tk.symbol(char, charCountStart));
    return i + 1;
};

var lexIdentifier = function (i, maxI, str, tokens) {
    return lexCollect(i, maxI, str, tokens, tk.symbol, ch.isIdentifier);
};

var lexComment = function (i, maxI, str, tokens) {
    var charCountStart = _charCount;
    var lastToken = tokens[tokens.length - 1];
    var isNewLine = lastToken && (tk.isTerminator(lastToken) || tk.isBlockComment(lastToken));
    var nextI = lexCollect(i + 2, maxI, str, tokens, function (value) {
        return tk.comment(value, charCountStart, false, isNewLine);
    }, function (c) {
        return !ch.isNewline(c);
    });
    return lexNewline(nextI, maxI, str, []);
};

var lexBlockComment = function (i, maxI, str, tokens) {
    var charCountStart = _charCount;
    var nextI = lexCollect(i + 2, maxI, str, tokens, function (value) {
        return tk.comment(value, charCountStart, true);
    }, function (c1, c2) {
        return !ch.isBlockCommentEnd(c1, c2);
    });
    return nextI + 2;
};

var lexCollect = function (i, maxI, str, tokens, tkCreate, chMatch, chTransform) {
    chTransform = chTransform || function (char) { return char; };
    var charCountStart = _charCount;
    var value = "";
    var increment = function () {
        i++;
        incrementCharCounter();
    };
    var haveMore = function () {
        var char = str[i];
        return i !== maxI && chMatch(char, str[i+1]);
    };
    var collect = function () {
        var char = str[i];
        if (ch.isNewline(char)) {
            incrementLineCounter();
        }
        value = value + chTransform(char);
        increment();
    };
    while(haveMore()) {
        collect();
    }
    tokens.push(tkCreate(value, charCountStart));
    return i;
};

// utility
var serializeChar = function(char) {
    /*
    if (char === "\"") {
        return "\\\"";
    } else if (char === "\'") {
        return "\\\'";
    } else */

    if (char === "\n") {
        return "\\n";
    } else {
        return char;
    }
};

var incrementCharCounter = function () {
    _charCount++;
};

var incrementLineCounter = function () {
    _newLineCount++;
    _charCount = 0;
};

// exports
module.exports.lexer = lexer;
