/*
** cml-build.js
**
** Contains functions for building a project into an html file and javascript file.
** This is the final step to creating our files.
**
*/

// Project Properties
// name - name of the project
// start - main module, first to be loaded
// version - timestamp for cache busting
// path - path to project
// runtimePath - path to runtime file
// displayName - name to be displayed to the user
// loadingOn - flag, if true loading page will be showed before app is loaded
// loadingImg - url to image file to show on loading page
// embedScript - flag, if true project script will be embeded to html page
// plugins - dictionary of plugins, format is { pluginName: pluginValue }
//     pluginName - name of plugin
//     pluginValue.order - dependency order ranking, lower means loaded earlier
//     pluginValue.name - name of plugin
//     pluginValue.type - file type, javascript or css
//     pluginValue.url - url path to plugin file

var cmlbuild = function(project, templateHTML, appJs) {
    project.version = Date.now();
    appJs += `;$(document).ready(function(){window.cmlruntime.cml.new("${project.start}");});`;
    templateHTML = templateHTML.replace("{{name}}", project.name)
            .replace("{{displayName}}", project.displayName || "")
            .replace("{{plugins}}", buildPlugins(project))
            .replace("{{runtime}}", project.runtimePath)
            .replace("{{appLoadingOn}}", project.loadingOn ? "": "display-none")
            .replace("{{appLogoImg}}", project.loadingImg || "")
            .replace("{{script}}", buildScript(project, appJs))
            .replace(/{{version}}/g, project.version); // g for replace all
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
        var scriptTag = `<script type="text/javascript" src="{{path}}/js/{{name}}.js?v={{version}}"></script>`;
        return scriptTag.replace("{{name}}", project.name)
                        .replace("{{version}}", project.version)
                        .replace("{{path}}", project.path || "");
    }
};

// utility
var stringReplace = (str, sub1, sub2) => {
    return str.split(sub1).join(sub2);
};
// exports
module.exports.cmlbuild = cmlbuild;
