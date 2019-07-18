const cmlbase = require("./cml-base.js");

// exports
var cml = {
    cmlToIr: cmlbase.cmlToIr,
    irToCml: cmlbase.irToCml,
    irToJs: cmlbase.irToJs,
    cmlToAst: cmlbase.cmlToAst,
    astToJs: cmlbase.astToJs,
    cmlToJs: cmlbase.cmlToJs,
    runtimeFile: "/runtime/cml-runtime.js",
    buildProject: cmlbase.buildProject
};

module.exports = cml;

cmlparser = cml;
