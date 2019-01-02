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
    var cmlVersion;
    if (project.cmlVersion) {
        cmlVersion = project.cmlVersion;
    } else {
        cmlVersion = version.split(".").join("-");
    }
    if (versionLessThanOrEqual(cmlVersion, "1-4-78")) {
        project.plugins["nocturn-chart-component"] = {
            name: "nocturn-chart-component",
            url: "https://nocturn.io/plugins/Chart.js?v={{version}}",
            order: -1,
            type: "javascript"
        };
    } else {
        project.plugins["nocturn-ui"] = {
            name: "nocturn-ui",
            url: "https://nocturn.io/plugins/nocturn-ui.js?v={{version}}",
            order: -2,
            type: "javascript"
        };
        project.plugins["nocturn-chart-component"] = {
            name: "nocturn-chart-component",
            url: "https://nocturn.io/plugins/Chart.js?v={{version}}",
            order: -1,
            type: "javascript"
        };
    }
    return cmlbuild(cmlVersion, project, templateHTML, appJs);
};

var versionLessThanOrEqual = (v1, v2) => {
    return compareVersionNumbers(v1, v2) >= 0;
};
var compareVersionNumbers = (a, b) => {
    var piecesA = a.split("-");
    var piecesB = b.split("-");

    var majorA = Number(piecesA[0]);
    var majorB = Number(piecesB[0]);

    var minorA = Number(piecesA[1]);
    var minorB = Number(piecesB[1]);

    var buildA = Number(piecesA[2]);
    var buildB = Number(piecesB[2]);

    // compare major version
    if (majorA > majorB) {
        return -1;
    } else if (majorA < majorB) {
        return 1;
    } else {
        // compare minor version
        if (minorA > minorB) {
            return -1;
        } else if (minorA < minorB) {
            return 1;
        } else {
            // compare build version
            if (buildA > buildB) {
                return -1;
            } else if (buildA < buildB) {
                return 1;
            } else {
                return 0;
            }
        }
    }
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
