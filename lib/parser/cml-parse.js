/*
** cml-parse.js
**
** This Module parses CML and returns an AST. The AST.compile() returns an IR object.
** Primary module of parser.
**
** Parse Steps:
** CML code -> lexer -> tokens -> parse -> AST -> compile -> IR
**
** lexer takes in cml code string and outputs token array
** parse takes in a token array and outputs an AST object
** compile takes in an AST and outputs an IR object
*/

const lexer = require("./lexer.js").lexer;
const parse = require("./parser.js").parse;
const success = require("./result.js").success;
const failure = require("./result.js").failure;

var cmlparse = function (code, failureHandler) {
    failureHandler = failureHandler || function (result) { console.log(result.value.msg); };
    var result = parse(tokenize(code));
    if (failure.match(result)) {
        failureHandler(result);
    }
    return result;
};

var tokenize = function (code) {
    return lexer(code.trim());
};

module.exports.cmlparse = cmlparse;
