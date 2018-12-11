var cmlbuild = function(cmlVersion, project, templateHTML, templateJs) {
    var version = Date.now();
    var name = project.name || "";
    var start = project.start;
    var minify = project.minify;
    var server = project.server ? project.server + "/" : "/";
    templateJs += `;$(document).ready(function(){window.cmlruntime.cml.new("${start}");});`;
    var runtimeUrl = project.includeRuntime ? "{{server}}js/cml-runtime.js": "https://nocturn.io/runtime/cml-runtime_{{cmlVersion}}.js";
    runtimeUrl = runtimeUrl.replace("{{cmlVersion}}", cmlVersion)
            .replace("{{server}}", server);
    var libraryTag = project.includeRuntime ? `<script type="text/javascript" src="{{server}}js/nocturn-ui.js?v={{version}}"></script>` : "";
    libraryTag = libraryTag.replace("{{server}}", server);
    templateHTML = templateHTML.replace("{{server}}", project.server || "")
            .replace("{{name}}", project.name || "")
            .replace("{{displayName}}", project.displayName || "")
            .replace("{{plugins}}", buildPlugins(project))
            .replace("{{runtime}}", runtimeUrl)
            .replace("{{library}}", libraryTag)
            .replace("{{appLoadingOn}}", project.loadingOn ? "": "display-none")
            .replace("{{appLogoImg}}", project.loadingImg || "");
    var scriptTag = `<script type="text/javascript" src="{{server}}js/{{name}}.js?v={{version}}"></script>`;
    scriptTag = scriptTag.replace("{{server}}", server)
                        .replace("{{name}}", name)
                        .replace("{{version}}", version);
    templateHTML = templateHTML.replace("{{script}}", scriptTag);

    // version replaced in this way because plugins can add more {{versions}}
    templateHTML = stringReplace(templateHTML, "{{version}}", version);
    return {
        html: templateHTML,
        js: templateJs
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
        var url = p.url;
        var spaces = "    ";
        if (type == "javascript") {
            accum += spaces + `<script type="text/javascript" src="${url}"></script>\n`;
        } else if (type == "css") {
            accum += spaces + `<link rel="stylesheet" href="${url}"></link>\n`;
        }
    });
    return accum;
};

// utility
var stringReplace = (str, sub1, sub2) => {
    return str.split(sub1).join(sub2);
};

// exports
module.exports.cmlbuild = cmlbuild;
