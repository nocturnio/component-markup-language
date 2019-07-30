/*
** parser.js
**
** traverses tokens and creates AST objects based on grammer
**
*/
const queue = require("./queue.js").queue;
const success = require("./result.js").success;
const failure = require("./result.js").failure;
const ast = require("./ast.js").ast;
const tk = require("./tk.js").tk;

var _lineNumber = 1;
var _charNumber = 1;

var parseFailed = function (msg) {
    return failure.create({
        lineNumber: _lineNumber,
        charNumber: _charNumber,
        msg: msg
    });
};

var parse = function (tokenArray) {
    _lineNumber = 1;
    _charNumber = 1;

    var tokens = queue(tokenArray);
    while (true) {
        if (tokens.isEmpty()) {
            break;
        } else if (tokens.match(tk.isComment)) {
            tokens.dequeue();
        } else if (tokens.match(tk.isTerminator)) {
            parseTerminator(tokens);
        } else {
            break;
        }
    }
    return pipe(parseExpression(tokens))
        .end(success.bind(function (currentAst) {
            if (!tokens.isEmpty()) {
                return parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: tokens left dangling`);
            } else {
                return success.create(currentAst);
            }
        }));
};
var parseExpression = function (tokens) {
    setCharNumber(tokens);
    return parseClass(tokens);
};
var parseSpace = function (tokens) {
    setCharNumber(tokens);
    tokens.dequeue();
    return success.create(ast.unit());
};
var parseClass = function (tokens) {
    setCharNumber(tokens);
    var classAst = ast.class({
        value: ast.unit(),
        name: ast.string({ value: "" }),
        args: ast.undefined(),
        block: ast.unit()
    });
    var setInstanceName = function (n) { classAst.name = n; return classAst; };
    var setClassName = function (n) { classAst.value = n; return classAst; };
    var setArgs = function (a) { classAst.args = a; return classAst; };
    var setBlock = function (b) { classAst.block = b; return classAst; };

    var parseBlock_ = function (currentAst) {
        if (tokens.match(tk.isBlock)) {
            tokens.dequeue();
            tokens.dequeue();
            return parseBlock(tokens);
        } else if (tokens.match(tk.isTerminator)) {
            parseTerminator(tokens);
            return parseBlock_(currentAst);
        } else {
            var frontValue = tokens.getFront().value;
            return parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: [Class] expected '{' token instead received ${frontValue}`);
        }
    };
    var parseArgs_ = function (currentAst) {
        if (tokens.match(tk.isArgs)) {
            tokens.dequeue();
            return parseArgs(tokens);
        } else if (tokens.match(tk.isBlock)) {
            return failure.create(currentAst);
        } else if (tokens.match(tk.isTerminator)) {
            parseTerminator(tokens);
            return parseArgs_(currentAst);
        } else {
            var frontValue = tokens.getFront().value;
            return parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: [Class] expected ( or { instead received ${frontValue}`);
        }
    };

    return pipe(parseString(tokens))
        .then(success.map(setClassName))
        .then(success.bind(function (currentAst) {
            if (tokens.match(tk.isBlock)) {
                return failure.create(currentAst);
            } else {
                return parseString(tokens);
            }
        }))
        .then(success.map(setInstanceName))
        .then(success.bind(parseArgs_))
        .then(success.map(setArgs))
        .then(restoreIf(ast.isAst))
        .then(success.bind(parseBlock_))
        .end(success.map(setBlock));
};

var parseBlock = function (tokens, body) {
    setCharNumber(tokens);
    if (!body) {
        body = ast.block();
    }
    var addComment = function (c) {
        body.addComment(c);
        return body;
    };
    var addKeyPair = function (k) {
        body.addKeyPair(k);
        return body;
    };
    var addClass = function (c) {
        body.addClass(c);
        return body;
    };
    if (tokens.isEmpty()) {
        return parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: [BLOCK] failed to end {`);
    } else if (tokens.match(tk.isBlockEnd)) {
        tokens.dequeue();
        tokens.dequeue();
        return success.create(body);
    } else if (tokens.match(tk.isComment)) {
        return pipe(parseComment(tokens))
            .then(success.map(addComment))
            .end(success.bind(function (body) {
                return parseBlock(tokens, body);
            }));
    } else if (isKeyPairStart(tokens)) {
        return pipe(parseKeyPair(tokens))
            .then(success.map(addKeyPair))
            .end(success.bind(function (body) {
                return parseBlock(tokens, body);
            }));
    } else if (isEventStart(tokens)) {
        return pipe(parseEvent(tokens))
            .then(success.map(addClass))
            .end(success.bind(function (body) {
                return parseBlock(tokens, body);
            }));
    } else if (tokens.match(tk.isTerminator)) {
        parseTerminator(tokens);
        return parseBlock(tokens, body);
    } else {
        return pipe(parseClass(tokens))
            .then(success.map(addClass))
            .end(success.bind(function (body) {
                return parseBlock(tokens, body);
            }));
    }
};

var parseEvent = function (tokens) {
    setCharNumber(tokens);
    var currentAst = ast.event({
        value: ast.string({value: "Event"}),
        name: ast.unit(),
        args: ast.unit(),
        block: ast.unit()
    });
    var setInstanceName = function (n) {
        currentAst.name = n;
        return currentAst;
    };
    var setEventName = function (n) {
        currentAst.value = n;
        return currentAst;
    };
    var setArgs = function (a) {
        currentAst.args = a;
        return currentAst;
    };
    var setBlock = function (b) {
        currentAst.block = b;
        return currentAst;
    };
    var parseName_ = function () {
        if (tokens.match(tk.isBlock)) {
            return parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: [Event] expected instance name`);
        } else {
            return parseString(tokens);
        }
    };
    var parseArgs_ = function (currentAst) {
        if (tokens.match(tk.isArgs)) {
            tokens.dequeue();
            return parseArgs(tokens);
        } else if (tokens.match(tk.isBlock)) {
            return failure.create(currentAst);
        } else if (tokens.match(tk.isTerminator)) {
            parseTerminator(tokens);
            return parseArgs_(currentAst);
        } else {
            var frontValue = tokens.getFront().value;
            return parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: [Event] expected ( or { received ${frontValue}`);
        }
    };
    var parseBlock_ = function (currentAst) {
        if (tokens.match(tk.isBlock)) {
            tokens.dequeue();
            return pipe(parseCodePiece(tokens))
                .end(success.bind(function (currentAst) { return parseCode(tokens, currentAst); }));
        } else if (tokens.match(tk.isTerminator)) {
            parseTerminator(tokens);
            return parseBlock_(currentAst);
        } else {
            var frontValue = tokens.getFront().value;
            return parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: [Event] expected { received ${frontValue}`);
        }
    };

    return pipe(parseName_())
        .then(success.map(setInstanceName))
        .then(success.bind(parseArgs_))
        .then(success.map(setArgs))
        .then(restoreIf(ast.isAst))
        .then(success.bind(parseBlock_))
        .end(success.map(setBlock));
};

var parseCode = function (tokens, lhs, blockCount) {
    setCharNumber(tokens);
    if (typeof (blockCount) === "undefined") {
        blockCount = 0;
    }
    var rtn;
    while (true) {
        if (blockCount < 0) {
            rtn = parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: [CODE] unexpected }`);
            break;
        } else if (tokens.isEmpty()) {
            var arr = tokens.toArray();
            rtn = parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: Unexpected end`);
            break;
        } else if (tokens.match(tk.isBlockEnd) && blockCount == 0) {
            tokens.dequeue();
            tokens.dequeue();
            rtn = success.create(lhs);
            break;
        } else {
            if (tokens.match(tk.isBlockEnd) && blockCount > 0) {
                blockCount--;
            } else if (tokens.match(tk.isBlock)) {
                blockCount++;
            }
            rtn = pipe(parseCodePiece(tokens))
                    .then(success.map(function (currentAst) {
                        return ast.code({ lhs: lhs, rhs: currentAst });
                    }))
                    .end(success.bind(function (currentAst) {
                        lhs = currentAst;
                        return currentAst;
                    }));
        }
    }
    return rtn;
};
var parseCodePiece = function (tokens) {
    setCharNumber(tokens);
    if (tokens.isEmpty()) {
        return parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: [CODE] Unexpected end`);
    } else if (tokens.match(tk.isTerminator)) {
        parseTerminator(tokens);
        return success.create(ast.unit());
    } else if (tokens.match(tk.isArray)) {
        var front = tokens.getFront();
        tokens.dequeue();
        return success.create(ast.arrayCode({
            value: ast.identifier({value: front.value})
        }));
    } else if (tokens.match(tk.isComment)) {
        var front = tokens.getFront();
        tokens.dequeue();
        if (front.block) {
            return success.create(ast.closedCommentCode({
                value: ast.identifier({value: front.value})
            }));
        } else {
            return success.create(ast.commentCode({
                value: ast.identifier({value: front.value}),
                newline: front.newline
            }));
        }
    } else {
        var topValue = tokens.getFront().value;
        tokens.dequeue();
        return success.create(ast.identifier({value: topValue}));
    }
};

var parseKeyPair = function (tokens) {
    setCharNumber(tokens);
    var currentAst = ast.keyPair({ key: "", value: "" });
    var setKey = function (k) {
        currentAst.key = k;
        return currentAst;
    };
    var setValue = function (v) {
        currentAst.value = v;
        return currentAst;
    };
    return pipe(parseString(tokens))
        .then(success.map(setKey))
        .then(success.bind(function (x) {
            if (tokens.match(tk.isKeyPair)) {
                tokens.dequeue();
                return success.create(currentAst);
            } else {
                var frontValue = tokens.getFront().value;
                return parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: [KEY-PAIR] expected : got ${frontValue}`);
            }
        }))
        .then(success.bind(function (x) { return parseToTerm(tokens); }))
        .end(success.map(setValue));
};

var parseComment = function (tokens) {
    setCharNumber(tokens);
    var front = tokens.getFront();
    var prior = tokens.getPrior();
    tokens.dequeue();
    return success.create(ast.comment({
        value: ast.identifier({ value: front.value }),
        block: front.block,
        newline: tk.isTerminator(prior)
    }));
};

var parseToTerm = function (tokens, lhs) {
    setCharNumber(tokens);
    if (typeof (lhs) === "undefined") {
        lhs = ast.unit();
    }
    return pipe(parseIdentifier(tokens))
        .end(success.bind(function (currentAst) {
            if (tokens.match(tk.isTerminator)) {
                parseTerminator(tokens);
                if (currentAst.value === ",") {
                    // Should this be a special case?
                    return parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: [To Term] Expected newline got ','`);
                } else {
                    var code = ast.code({ lhs: lhs, rhs: currentAst });
                    return success.create(code);
                }
            } if (tokens.match(tk.isComment)) {
                var commentAst = parseComment(tokens).value;
                var code = ast.code({ lhs: lhs, rhs: currentAst, comment: commentAst });
                return success.create(code);
            } else {
                var code = ast.code({ lhs: lhs, rhs: currentAst });
                return parseToTerm(tokens, code);
            }
        }));
};

var parseArgs = function (tokens, lhs) {
    setCharNumber(tokens);

    if (tokens.match(tk.isArgsSep)) {
        tokens.dequeue();
        return parseArgs(tokens, lhs);
    } else if (tokens.match(tk.isArgsEnd)) {
        tokens.dequeue();
        return success.create(lhs || ast.unit());
    } else {
        return pipe(parseString(tokens))
            .then(success.map(function (currentAst) {
                return lhs ? ast.args({ lhs: lhs, rhs: currentAst }) : currentAst;
            }))
            .end(success.bind(function (currentAst) {
                return parseArgs(tokens, currentAst);
            }));
    }
};

var parseIdentifier = function (tokens) {
    setCharNumber(tokens);
    var value = tokens.getFront().value;
    tokens.dequeue();
    return success.create(ast.identifier({ value: value }));
};

var parseString = function (tokens) {
    setCharNumber(tokens);
    var token = tokens.getFront();
    if (tk.isSymbol(token)) {
        tokens.dequeue();
        return success.create(ast.string({ value: token.value }));
    } else {
        var frontValue = token.value;
        var charNumber = token.charNumber;
        return parseFailed(`(${_lineNumber}:${_charNumber}) Parse Error: [SYMBOL] expected a symbol instead received ${frontValue}`);
    }
};

var parseQuotedString = function (tokens) {
    setCharNumber(tokens);
    var value = tokens.getFront().value;
    tokens.dequeue();
    return success.create(ast.quotedString({value: value}));
};

var parseTerminator = function (tokens) {
    setCharNumber(tokens);
    var front = tokens.getFront();
    tokens.dequeue();
    _lineNumber = front.lineNumber;
};

// utility
var pipe = function (start) {
    return {
        then: function (next) {
            return pipe(next(start));
        },
        end: function (next) {
            return next(start);
        }
    };
};
var restoreIf = function (isCond) {
    return function (res) {
        if (failure.match(res)) {
            var value = res.value;
            return isCond(value) ? success.create(value) : failure.create(value);
        } else {
            return res;
        }
    };
};
var isKeyPairStart = function (tokens) {
    var top = tokens.getFront();
    var second = tokens.getSecond();
    return tk.isKeyPair(second) && tk.isSymbol(top);
};
var isBinaryStart = function (tokens) {
    var second = tokens.getSecond();
    return tk.isBinaryOperator(second);
};
var isEventStart = function (tokens) {
    var first = tokens.getFront();
    var second = tokens.getSecond();
    return tk.isSymbol(first) && tk.isArgs(second);
};
var isClassStart = function (tokens) {
    var top = tokens.getFront();
    var second = tokens.getSecond();
    return tk.isSymbol(second) && tk.isSymbol(top);
};
var setCharNumber = function (tokens) {
    var front = tokens.getFront();
    if (front) {
        _charNumber = front.charNumber;
    }
};

module.exports.parse = parse;
