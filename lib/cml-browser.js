const cmlparse = require("./parser/cml-parse.js").cmlparse;
const cmlcompile = require("./compile/cml-compile.js").cmlcompile;

var cmlToAst = function (str) {
    return cmlparse(str).value;
};
var astToJs = function(ast) {
    return cmlcompile(JSON.parse(ast.compile()));
};
var cmlToJs = function (str) {
    var ast = cmlToAst(str);
    if (!ast.compile) {
        throw ast;
    } else {
        return astToJs(ast);
    }
};
// exports
var cml = {
    cmlToAst: cmlToAst,
    astToJs: astToJs,
    cmlToJs: cmlToJs
};

module.exports = cml;

cmlparser = cml;
