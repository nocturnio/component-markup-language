/*
** CML compile steps, CML -> AST -> IR -> javascript
** 1. Input CML code
** 2. CML code is parsed and an AST is created
** 3. On AST.compile an Intermediate Representation is created (JSON)
** 4. IRObject is then compiled into javascript
*/

const cmlparse = require("./parser/cml-parse.js").cmlparse;
const cmlcompile = require("./compile/cml-compile.js").cmlcompile;
const cmlbuild = require("./build/cml-build.js").cmlbuild;
const moduleDir = __dirname;
const path = require('path');
const version = require(path.join(__dirname, "../package.json")).version;

var cmlToAst = function (str, name) {
    name = name || "[no name specified]";
    var result = cmlparse(str);
    var ast = result.value;
    if (ast.compile) {
        return ast;
    } else {
        throw ast;
    }
};
var astToJs = function(ast, name) {
    name = name || "[no name specified]";
    try {
        return cmlcompile(JSON.parse(ast.compile()));
    } catch (e) {
        throw "Module " + name + ": " + e;
    };
};
var cmlToJs = function (str, name) {
    name = name || "[no name specified]";
    return astToJs(cmlToAst(str, name), name);
};
var buildProject = function (project, templateHTML) {
    var appJs = project.files.map(function (c) {
        return cmlToJs(c.value, c.name);
    }).join(";");
    return cmlbuild(project, templateHTML, appJs);
};
// exports
var cml = {
    version: version,
    runtimeFile: moduleDir + "/runtime/cml-runtime.js",
    cmlToAst: cmlToAst,
    astToJs: astToJs,
    cmlToJs: cmlToJs,
    buildProject: buildProject
};

module.exports = cml;
