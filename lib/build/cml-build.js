// Project Properties
// name
// start
// server
// runtimePath
// displayName
// loadingOn
// loadingImg
// embedScript
// plugins

var cmlbuild = function(project, templateHTML, appJs) {
    project.version = Date.now();
    appJs += `;$(document).ready(function(){window.cmlruntime.cml.new("${project.start}");});`;
    templateHTML = templateHTML.replace("{{name}}", project.name || "")
            .replace("{{displayName}}", project.displayName || "")
            .replace("{{plugins}}", buildPlugins(project))
            .replace("{{runtime}}", project.runtimePath)
            .replace("{{appLoadingOn}}", project.loadingOn ? "": "display-none")
            .replace("{{appLogoImg}}", project.loadingImg || "")
            .replace("{{script}}", buildScript(project, appJs))
            .replace("{{version}}", project.version);
    return {
        html: templateHTML,
        js: appJs
    };
};
var buildPlugins = function (project) {
    var plugins = [];
    for(var k in project.plugins) {
        plugins.push(project.plugins[k]);
    }
    plugins.sort(function (a, b) {
        if (a.order < b.order) return -1;
        else if (a.order > b.order) return 1;
        else return 0;
    });
    var accum = "";
    plugins.forEach(function(p) {
        var type = p.type;
        var name = p.name;
        var url = p.url.replace("{{version}}", project.version);
        var spaces = "    ";

        if (type == "javascript") {
            accum += spaces + `<script type="text/javascript" src="${url}"></script>\n`;
        } else if (type == "css") {
            accum += spaces + `<link rel="stylesheet" href="${url}"></link>\n`;
        }
    });
    return accum;
};
var buildScript = function (project, appJs) {
    if (project.embedScript) {
        return "<script type=\"text/javascript\">" + appJs + "</script>";
    } else {
        var scriptTag = `<script type="text/javascript" src="{{server}}js/{{name}}.js?v={{version}}"></script>`;
        return scriptTag.replace("{{server}}", project.server)
                        .replace("{{name}}", project.name)
                        .replace("{{version}}", project.version);
    }
};

// utility
var stringReplace = (str, sub1, sub2) => {
    return str.split(sub1).join(sub2);
};
// exports
module.exports.cmlbuild = cmlbuild;
