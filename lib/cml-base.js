const cmlparse = require("./parser/cml-parse.js").cmlparse;
const cmlcompile = require("./compile/cml-compile.js").cmlcompile;
const cmldecompile = require("./compile/cml-decompile.js").cmldecompile;
const cmlbuild = require("./build/cml-build.js").cmlbuild;

var cmlToAst = function (str, failureHandler) {
    return cmlparse(str, failureHandler).value;
};
var astToJs = function(ast, failureHandler, jsInspect) {
    jsInspect = jsInspect || function (js) { return null; };
    failureHandler = failureHandler || function (err) { throw err; };
    var json = ast.compile({
        removeComments: true
    });
    var js = cmlcompile(JSON.parse(json));
    var errorMsg = jsInspect(js);
    if (errorMsg) {
        failureHandler({
            msg: errorMsg
        });
    } else {
        return js;
    }
};
var cmlToJs = function (str, failureHandler, jsInspect) {
    jsInspect = jsInspect || function (js) { return null; };
    failureHandler = failureHandler || function (err) { throw err; };
    var ast = cmlToAst(str, failureHandler);
    if (!ast.compile) {
        failureHandler(ast);
    } else {
        return astToJs(ast, failureHandler, jsInspect);
    }
};
var buildProject = function (project, templateHTML, failureHandler, jsInspect) {
    jsInspect = jsInspect || function (js) { return null; };
    failureHandler = failureHandler || function (err) { throw err; };

    var appJs = project.files.filter(function (f) {
        return !f.type;
    }).map(function (f) {
        var failureHandler_ = function (err) {
            failureHandler({
                msg: err.msg,
                name: f.name,
                lineNumber: err.lineNumber
            });
            return err.msg;
        };
        var jsInspect_ = function (js) {
            var errMsg = jsInspect(js, f.name);
            return errMsg;
        };
        var js = cmlToJs(f.value, failureHandler_, jsInspect_);
        return js;
    }).join(";");

    var appCss = project.files.filter(function (f) {
        return f.type === "css";
    }).map(function (f) {
        return f.value;
    }).join("\n");

    var extraJs = project.files.filter(function (f) {
        return f.type === "js";
    }).map(function (f) {
        return f.value;
    }).join(";");

    extraJs = extraJs ? (";" + extraJs) : "";
    appCss = appCss || "";
    return cmlbuild(project, templateHTML, appJs + extraJs, appCss);
};

var irToJs = function (ir) {
    return cmlcompile(ir);
};

var irToCml = function (ir, options) {
    options = options || {};
    return cmldecompile(ir, options.indentLevel, options.indentSize, options.jsFormat, options.preIndentLevel);
};

var cmlToIr = function (cmlStr, options) {
    options = options || {};
    var ast = cmlToAst(cmlStr, options.onFail);
    if (!ast.compile) {
        throw options.onFail(ast) || ast;
    } else {
        var json = ast.compile(options);
        return JSON.parse(json);
    }
};


// exports
var cml = {
    cmlToIr: cmlToIr,
    irToCml: irToCml,
    irToJs: irToJs,
    cmlToAst: cmlToAst,
    astToJs: astToJs,
    cmlToJs: cmlToJs,
    runtimeFile: "/runtime/cml-runtime.js",
    buildProject: buildProject
};

module.exports = cml;

cmlparser = cml;
