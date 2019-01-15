const cmlparse = require("./parser/cml-parse.js").cmlparse;
const cmlcompile = require("./compile/cml-compile.js").cmlcompile;
const cmlbuild = require("./build/cml-build.js").cmlbuild;
const moduleDir = __dirname;
const path = require('path');
const version = require(path.join(__dirname, "../package.json")).version;

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
    /*
    project = {
        name: <string>,
        displayName: <string>,
        start: <string>,
        plugins: {
            <name>: {
                order: <number>,
                name: <string>,
                url: <string>,
                type: <string>
            },
            ...
        },
        server: <string>,
        modules: [
            {
                name: <string>,
                value: <string>
            },
            ...
        ]
    }
    */
    var appJs = project.files.map(function (c) {
        return cmlToJs(c.value);
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
