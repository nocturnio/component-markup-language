const cmlparse = require("./parser/cml-parse.js").cmlparse;
const cmlcompile = require("./compile/cml-compile.js").cmlcompile;
const cmlbuild = require("./build/cml-build.js").cmlbuild;
const moduleDir = __dirname;
const version = require(moduleDir + "/package.json");

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
        return cmlToJs(c.value);
    }).join(";");
    return cmlbuild(version.split(".").join("-"), project, templateHTML, appJs);
};

// exports
var cml = {
    version: version,
    templateFile: moduleDir + "/template/index_template.html",
    runtimeFile: moduleDir + "/runtime/cml-runtime.js",
    cmlToAst: cmlToAst,
    astToJs: astToJs,
    cmlToJs: cmlToJs,
    buildProject: buildProject
};

module.exports = cml;
