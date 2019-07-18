module.exports.register = function (cml) {
    // default modules
    var htmlEvents = [
        "onafterprint",
        "onbeforeprint",
        "onbeforeunload",
        "onerror",
        "onhashchange",
        "onload",
        "onoffline",
        "ononline",
        "onpageshow",
        "onresize",
        "onunload",
        "onblur",
        "onchange",
        "oncontextmenu",
        "onfocus",
        "oninput",
        "oninvalid",
        "onreset",
        "onsearch",
        "onselect",
        "onsubmit",
        "onkeydown",
        "onkeypress",
        "onkeyup",
        "onclick",
        "ondblclick",
        "onmousedown",
        "onmousemove",
        "onmouseout",
        "onmouseover",
        "onmouseup",
        "onwheel",
        "onwheel",
        "ondrag",
        "ondragend",
        "ondragenter",
        "ondragleave",
        "ondragover",
        "ondragstart",
        "ondrop",
        "onscroll",
        "oncopy",
        "oncut",
        "onpaste",
        "ontoggle"
    ];

    var htmlAttributes = ["accept","accept-charset","accesskey","action","align","allow","alt","async","autocapitalize","autocomplete","autofocus","autoplay","bgcolor","border","buffered","challenge","charset","checked","cite","className","code","codebase","color","cols","colspan","content","contenteditable","contextmenu","controls","coords","crossorigin","csp ","data","datetime","decoding","default","defer","dir","dirname","disabled","download","draggable","dropzone","enctype","htmlFor","form","formaction","headers","height","hidden","high","href","hreflang","icon","id","importance ","integrity","ismap","itemprop","keytype","kind","label","lang","language","lazyload ","list","loop","low","manifest","max","maxlength","minlength","media","method","min","multiple","muted","name","novalidate","open","optimum","pattern","ping","placeholder","poster","preload","radiogroup","readonly","referrerpolicy","rel","required","reversed","rows","rowspan","sandbox","scope","scoped","selected","shape","size","sizes","slot","span","spellcheck","src","srcdoc","srclang","srcset","start","step","style","summary","tabindex","target","title","translate","type","usemap","value","width","wrap"];

    var htmlModules = [
        "DIV",
        "FORM",
        "P",
        "SELECT",
        "UL",
        "OL"
    ];

    var htmlComponents = [
        "A",
        "BR",
        "CODE",
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
        "IMG",
        "INPUT",
        "LI",
        "TEXTAREA",
        "PRE",
        "OPTION",
        "IFRAME"
    ];
    /*
    "AREA",
    "TABLE",
    "ADDRESS",
    "APPLET",
    "BASE",
    "BASEFONT",
    "BIG",
    "BLOCKQUOTE",
    "BODY",
    "B",
    "CAPTION",
    "CENTER",
    "CITE",
    "DD",
    "DFN",
    "DIR",
    "DL",
    "DT",
    "EM",
    "FONT",
    "HEAD",
    "HR",
    "HTML",
    "ISINDEX",
    "I",
    "KBD",
    "LINK",
    "MAP",
    "MENU",
    "META",
    "PARAM",
    "SAMP",
    "SCRIPT",
    "SMALL",
    "STRIKE",
    "STRONG",
    "STYLE",
    "SUB",
    "SUP",
    "TD",
    "TH",
    "TR",
    "TITLE",
    "TT",
    "U",
    "VAR"
    */

    var eventAttributes = htmlEvents.map(function (name) { return name.slice(2); });
    var eventsAttributesLookup = {};
    eventAttributes.forEach(function (name) { eventsAttributesLookup[name] = true; });

    var objForEachKey = function(h, f) {
        for (var x in h) {
            f(x);
        }
    };

    htmlModules.forEach(function (htmlElement) {
        var m = {
            refresh: {}
        };
        htmlAttributes.forEach(function (attr) {
            m.refresh[attr] = function (p, self, el, value) {
                el[attr] = value;
            };
        });
        m.create = function (p, self, dom) {
            var attributes = [];
            objForEachKey(p, function (k) { attributes.push(k) });
            var el = document.createElement(htmlElement.toUpperCase());
            attributes.forEach(function (attr) {
                if (eventsAttributesLookup[attr]) {
                    el["on" + attr] = p[attr];
                } else {
                    el[attr] = cml.extract(p, attr);
                }
            });
            dom.components.forEach(function (c) {
                el.appendChild(c);
            });
            document.getElementsByTagName("main")[0].appendChild(el);
            return el;
        };
        m.class = htmlElement;
        cml.addModule(m);
    });

    htmlComponents.forEach(function (htmlElement) {
        var c = {
            refresh: {}
        };
        htmlAttributes.forEach(function (attr) {
            c.refresh[attr] = function (p, m, el, instance, value) {
                el[attr] = value;
            };
        });
        c.instance = function (p, m, el) {
            return el;
        };
        c.create = function (p, m) {
            var attributes = [];
            objForEachKey(p, function (k) { attributes.push(k) });
            var el = document.createElement(htmlElement);
            attributes.forEach(function (attr) {
                if (eventsAttributesLookup[attr]) {
                    el["on" + attr] = p[attr];
                } else {
                    el[attr] = cml.extract(p, attr);
                }
            });
            return el;
        };
        c.class = htmlElement;
        cml.addComponent(c);
    });
};
