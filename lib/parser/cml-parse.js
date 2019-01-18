/*
**
** This Module parses CML and returns an AST. The AST.compile() returns an IR object.
**
*/

const lexer = require("./lexer.js").lexer;
const parse = require("./parser.js").parse;
const success = require("./result.js").success;
const failure = require("./result.js").failure;

(function() {
    var cmlparse = function (code) {
        var result = parse(tokenize(code));
        if (failure.match(result)) {
            throw result.value;
        }
        return result;
    };

    var tokenize = function (code) {
        return lexer(code.trim());
    };

    if (typeof (exports) === "undefined") {
        exports = {};
    }

    exports.cmlparse = cmlparse;
})();
