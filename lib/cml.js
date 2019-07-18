/*
** CML compile steps, CML -> AST -> IR -> javascript
** 1. Input CML code
** 2. CML code is parsed and an AST is created
** 3. On AST.compile an Intermediate Representation is created (JSON)
** 4. IRObject is then compiled into javascript
*/

const moduleDir = __dirname;
const path = require('path');
const version = require(path.join(__dirname, "../package.json")).version;
const cmlbase = require("./cml-base.js");

// exports
var cml = {
    version: version,
    runtimeFile: moduleDir + "/runtime/cml-runtime.js",
    cmlToIr: cmlbase.cmlToIr,
    irToCml: cmlbase.irToCml,
    irToJs: cmlbase.irToJs,
    cmlToAst: cmlbase.cmlToAst,
    astToJs: cmlbase.astToJs,
    cmlToJs: cmlbase.cmlToJs,
    buildProject: cmlbase.buildProject
};

module.exports = cml;
