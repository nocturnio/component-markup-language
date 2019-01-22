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

var parse = function (tokenArray) {
    var tokens = queue(tokenArray);
    return pipe(parseExpression(tokens))
        .end(success.bind(function (currentAst) {
            if (!tokens.isEmpty()) {
                var tokensValue = tokens.toArray().join(",");
                return failure.create(`Parse Error: tokens left dangling ${tokensValue}`);
            } else {
                return success.create(currentAst);
            }
        }));
};
var parseExpression = function (tokens) {
    return parseClass(tokens);
};
var parseSpace = function (tokens) {
    tokens.dequeue();
    return success.create(ast.unit());
};
var parseClass = function (tokens) {
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
            tokens.dequeue();
            return parseBlock_(currentAst);
        } else {
            var frontValue = tokens.getFront().value;
            return failure.create(`Parse Error: [Class] expected '{' token instead received ${frontValue}`);
        }
    };
    var parseArgs_ = function (currentAst) {
        if (tokens.match(tk.isArgs)) {
            tokens.dequeue();
            return parseArgs(tokens);
        } else if (tokens.match(tk.isBlock)) {
            return failure.create(currentAst);
        } else if (tokens.match(tk.isTerminator)) {
            tokens.dequeue();
            return parseArgs_(currentAst);
        } else {
            var frontValue = tokens.getFront().value;
            return failure.create(`Parse Error: [Class] expected ( or { instead received ${frontValue}`);
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
    if (!body) {
        body = ast.block();
    }
    var addKeyPair = function (k) {
        body.addKeyPair(k);
        return body;
    };
    var addClass = function (c) {
        body.addClass(c);
        return body;
    };
    if (tokens.isEmpty()) {
        return failure.create("Parse Error: [BLOCK] failed to end {");
    } else if (tokens.match(tk.isBlockEnd)) {
        tokens.dequeue();
        tokens.dequeue();
        return success.create(body);
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
    } else {
        return pipe(parseClass(tokens))
            .then(success.map(addClass))
            .end(success.bind(function (body) {
                return parseBlock(tokens, body);
            }));
    }
};

var parseEvent = function (tokens) {
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
            return failure.create("Parse Error: [Event] expected instance name");
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
            tokens.dequeue();
            return parseArgs_(currentAst);
        } else {
            var frontValue = tokens.getFront().value;
            return failure.create(`Parse Error: [Event] expected ( or { received ${frontValue}`);
        }
    };
    var parseBlock_ = function (currentAst) {
        if (tokens.match(tk.isBlock)) {
            tokens.dequeue();
            return pipe(parseCodePiece(tokens))
                .end(success.bind(function (currentAst) { return parseCode(tokens, currentAst); }));
        } else if (tokens.match(tk.isTerminator)) {
            tokens.dequeue();
            return parseBlock_(currentAst);
        } else {
            var frontValue = tokens.getFront().value;
            return failure.create(`Parse Error: [Event] expected { received ${frontValue}`);
        }
    };

    return pipe(parseName_())
        .then(success.map(setInstanceName))
        .then(success.bind(parseArgs_))
        .then(success.map(setArgs))
        .then(restoreIf(ast.isAst))
        .then(success.bind(parseBlock_))
        .end(success.map(setBlock))
};

var parseCode = function (tokens, lhs, blockCount) {
    if (typeof (blockCount) === "undefined") {
        blockCount = 0;
    }
    var parseCodePiece_ = function (blockCount) {
        return pipe(parseCodePiece(tokens))
            .then(success.map(function (currentAst) {
                return ast.code({ lhs: lhs, rhs: currentAst });
            }))
            .end(success.bind(function (currentAst) {
                return parseCode(tokens, currentAst, blockCount);
            }));
    };
    if (blockCount < 0) {
        return failure.create("Parse Error: [CODE] unexpected }");
    } else if (tokens.match(tk.isBlockEnd) && blockCount == 0) {
        tokens.dequeue();
        tokens.dequeue();
        return success.create(lhs);
    } else if (tokens.match(tk.isBlockEnd) && blockCount > 0) {
        return parseCodePiece_(blockCount - 1);
    } else if (tokens.match(tk.isBlock)) {
        return parseCodePiece_(blockCount + 1);
    } else {
        return parseCodePiece_(blockCount);
    }
};

var parseCodePiece = function (tokens) {
    if (tokens.isEmpty()) {
        return failure.create("Parse Error: [CODE] Unexpected end");
    } else if (tokens.match(tk.isTerminator)) {
        tokens.dequeue();
        return success.create(ast.unit());
    } else {
        var topValue = tokens.getFront().value;
        tokens.dequeue();
        return success.create(ast.identifier({value: topValue}));
    }
};

var parseKeyPair = function (tokens) {
    var currentAst = ast.keyPair({key: "", value: ""});
    var setKey = function (k) {
        currentAst.key = k;
        return currentAst;
    };
    var setValue = function (v) {
        currentAst.value = v;
        return currentAst;
    };
    var parseEnd = function () {
        if (tokens.match(tk.isTerminator)) {
            tokens.dequeue();
            return success.create(currentAst);
        } else if (isKeyPairStart(tokens)) {
            return success.create(currentAst);
        } else {
            var frontValue = tokens.getFront().value;
            return failure.create(`Parse Error: [KEY-PAIR] expected newline got ${frontValue}`);
        }
    };

    return pipe(parseString(tokens))
        .then(success.map(setKey))
        .then(success.bind(function (x) {
            if (tokens.match(tk.isKeyPair)) {
                tokens.dequeue();
                return success.create(currentAst);
            } else {
                var frontValue = tokens.getFront().value;
                return failure.create(`Parse Error: [KEY-PAIR] expected : got ${frontValue}`);
            }
        }))
        .then(success.bind(function (x) { return parseToTerm(tokens); }))
        .end(success.map(setValue));
};

var parseToTerm = function (tokens, lhs) {
    if (typeof (lhs) === "undefined") {
        lhs = ast.unit();
    }
    return pipe(parseIdentifier(tokens))
        .end(success.bind(function (currentAst) {
            if (tokens.match(tk.isTerminator)) {
                tokens.dequeue();
                if (currentAst.value === ",") {
                    return failure.create("Parse Error: [To Term] Expected newline got ','");
                } else {
                    var code = ast.code({ lhs: lhs, rhs: currentAst });
                    return success.create(code);
                }
            } else {
                var code = ast.code({ lhs: lhs, rhs: currentAst });
                return parseToTerm(tokens, code);
            }
        }));
};

var parseArgs = function (tokens, lhs) {
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
    var value = tokens.getFront().value;
    tokens.dequeue();
    return success.create(ast.identifier({ value: value }));
};

var parseString = function (tokens) {
    var token = tokens.getFront();
    if (tk.isSymbol(token)) {
        tokens.dequeue();
        return success.create(ast.string({ value: token.value }));
    } else {
        var frontValue = token.value;
        return failure.create(`Parse Error: [SYMBOL] expected a symbol instead received ${frontValue}`);
    }
};

var parseQuotedString = function (tokens) {
    var value = tokens.getFront().value;
    tokens.dequeue();
    return success.create(ast.quotedString({value: value}));
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

module.exports.parse = parse;
