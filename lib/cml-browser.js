const cmlparse = require("./parser/cml-parse.js").cmlparse;
const cmlcompile = require("./compile/cml-compile.js").cmlcompile;
const cmlbuild = require("./build/cml-build.js").cmlbuild;

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
var buildProject = function (project, templateHTML) {
    var appJs = project.files.map(function (c) {
        return cmlToJs(c.value, c.name);
    }).join(";");
    return cmlbuild(project, templateHTML, appJs);
};
// exports
var cml = {
    cmlToAst: cmlToAst,
    astToJs: astToJs,
    cmlToJs: cmlToJs,
    runtimeFile: "/runtime/cml-runtime.js",
    buildProject: buildProject
};

module.exports = cml;

cmlparser = cml;
