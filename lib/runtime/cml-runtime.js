/*
* CML Runtime
* MIT License (https://nocturn.io/LICENSE)
*/

var componentIdCount = 0;
var cmlEvents = {
    init: function() {
        return false;
    },
    show: function() {
        return false;
    },
    say: function(str) {
        return alert(str);
    },
    error: function(str) {
        return console.log(str);
    }
};
var system = {};
var loaders = {};
var moduleInstances = {};
var components = {
    "GLOBAL": {}
};
var modules = {};
var cml = {};
var testResults = [];
var moduleTests = {};
var componentTests = {};

var loadModule = function(data, loadProperties, self) {
    self = self || {};
    var loadComponentContext = function(p, c, t) {
        var container = p.container || c.container;
        var el = c.create(p, self);
        var instance = c.instance(p, self, el);
        if (el) {
            if (isUndefined(container)) {
                dom.components.push(el);
            } else if (dom[container]) {
                dom[container].push(el);
            } else {
                dom[container] = [el];
            }
        }
        componentInit(c, el, instance, p, self);
        return el;
    };
    var loadEvent = function(name, action_func) {
        var eventTypes = {
            "load": (function(func) {
                var original = self.__load__;
                self.__load__ = function () {
                    original();
                    return func();
                };
                self.load = func;
            }),
            "hidden": (function(func) {
                var show_or_hide = function() {
                    var el = self.__el__;
                    if (func()) {
                        self.__hide__();
                        elAppendClass(el, "display-none");
                    } else {
                        self.__show__();
                        elRemoveClass(el, "display-none");
                    }
                };
                self.__renders__.push(show_or_hide);
                self.hidden = func;
            }),
            "show": (function(func) {
                return accumFuncs(self, "__show__", func);
            }),
            "hide": (function(func) {
                return accumFuncs(self, "__hide__", func);
            }),
            "delete": (function(func) {
                return accumFuncs(self, "__delete__", func);
            }),
            "refresh": (function(func) {
                self.refresh = func;
                self.__renders__.push(func);

            })
        };
        var c = modules[data.__class__];
        var renderTable = c.refresh;
        objForEachKey(renderTable, (function(key) {
            var id = makeUUID();
            eventTypes[key] = function(func) {
                self.__renders__.push(function() {
                    var value = func();
                    var renderValues = self.__renderValues__;
                    var prev_value = renderValues[id];
                    var ignoreFuncs = function (a, b) {
                        if (isFunction(a)) {
                            return true;
                        }
                    };
                    if (!_.isEqualWith(value, prev_value, ignoreFuncs)){
                        renderValues[id] = _.cloneDeep(value);
                        self[key]
                        renderTable[key](data, self, self.__el__, value)
                    }
                });
            };
        }));
        var load = eventTypes[name];
        data[name] = action_func;
        if (load) {
            load(action_func);
        } else {
            self[name] = action_func;
        }
    };
    var loadComponent = function(p) {
        var defaultContext = components.GLOBAL;
        var context = components[data.__class__];
        var c = context[p.__class__] || defaultContext[p.__class__];
        if (c) {
            return loadComponentContext(p, c);
        } else {
            console.log("---Invalid Class---");
            console.log(p);
            console.log(components);
            console.log("");
            cml.error(p.__class__ + " is not a valid class name");
        }
    };
    var displayModule = function() {
        var load = function () {
            var l = self.__load__;
            var render = self.refresh;
            if (l) {
                l(self.__options__);
            }
            if (render) {
                render();
            }
            self.__renders__.forEach(function(r) {
                r();
            });
        };
        loadProperties(self, context);
        moduleInstances[cid] = self;

        if (modules[data.__class__]) {
            var m = modules[data.__class__];
            var el = m.create(data, self, dom);
            moduleInit(m, data, self, el);
            load();
        } else {
            cml.error(data.__class__ + " is not a valid Module");
        }
    };
    var name = data.__name__;
    var dom = {
        "components": [],
        "actions": [],
        "tabs": [],
        "left-tool-bar": [],
        "right-tool-bar": [],
        "reveal": []
    };
    var cid = makeCID(name);

    self.cid = cid;
    self.type = name;
    self.__load__ = function () {};
    self.__delete__ = function () {};
    self.__show__ = function () {};
    self.__hide__ = function () {};

    self.__renders__ = [];
    self.__renderValues__ = {};
    self.__dom__ = dom;

    objForEachKey(data, function(k) {
        return self[k] = data[k];
    });
    var context = {
        "load_card_element": loadComponent,
        "load_event": loadEvent
    };
    self.delete = function () {
        var classDelete = self.__classDelete__;
        var instanceDelete = self.__delete__;
        instanceDelete();
        classDelete();
    };
    self.__classDelete__ = function() {
        var el = self.__el__;
        if (el && el.parentNode) {
            elDelete(el);
        }
        delete moduleInstances[cid];
    };
    self.__display__ = displayModule;
    return self;
};
var addRenders = function(p, el, renderTable, self, instance, cacheTable) {
    cacheTable = cacheTable || {};
    objForEachKey(p, function (k) {
        addRender(p, k, el, renderTable, self, instance, cacheTable[k]);
    });
};
var addRender = function(p, key, el, renderTable, self, instance, skipCache) {
    var func = p[key];
    if (isFunction(func)) {
        var render = renderTable[key];
        if (!render) return;
        if (skipCache) {
            self.__renders__.push(function() {
                var value = func();
                render(p, self, el, instance, value);
            });
        } else {
            var id = makeUUID();
            self.__renders__.push(function() {
                var value = func();
                var renderValues = self.__renderValues__;
                var prevResult = renderValues[id];
                var ignoreFuncs = function (a, b) {
                    if (isFunction(a)) {
                        return true;
                    }
                };
                if (!_.isEqualWith(value, prevResult, ignoreFuncs)) {
                    renderValues[id] = _.cloneDeepWith(value);
                    render(p, self, el, instance, value);
                }
            });
        }
    }
};
var makeCID = function(name) {
    var cid = (name + componentIdCount);
    componentIdCount = componentIdCount + 1;
    return cid;
};
var extract = function(p, key) {
    var value = p[key];
    if (isFunction(value)) {
        return value();
    } else {
        return value;
    }
};

// internal library
var componentInit = function (c, el, instance, p, parent) {
    if (c.refresh) {
        addRenders(p, el, c.refresh, parent, instance, c.cache);
    }
    if (c.load) {
        accumFuncs(parent, "__load__", function() {
            var rtn = c.load(p, parent, el, instance);
            return rtn;
        });
    }
    if (c.show) {
        accumFuncs(parent, "__show__", function() {
            return c.show(p, parent, el, instance);
        });
    }
    if (c.hide) {
        accumFuncs(parent, "__hide__", function() {
            return c.hide(p, parent, el, instance);
        });
    }
    if (c.delete) {
        accumFuncs(parent, "__delete__", function() {
            return c.delete(p, parent, el, instance);
        });
    }
    if (p.__name__) {
        parent[p.__name__] = instance;
        if (parent.__name__ && el) {
            elAppendClass(el, parent.__name__ + "-" + p.__name__);
            elAppendClass(el, p.__name__);
        }
    }
    return el;
};
var moduleInit = function (m, data, self, el) {
    if (m.delete) {
        accumFuncs(self, "__delete__", function() {
            return m.delete(data, self, el);
        });
    }
    if (m.show) {
        accumFuncs(self, "__show__", function() {
            return m.show(data, self, el);
        });
    }
    if (m.hide) {
        accumFuncs(self, "__hide__", function() {
            return m.hide(data, self, el);
        });
    }
    self.__el__ = el;
    if (self.__name__ && el) {
        elAppendClass(el, self.__name__);
    }
    return el;
};
var cmlInit = function(options) {
    options = isUndefined(options) ? {} : options;
    loaderOff(options.loader);
    return cmlEvents.init();
};
var showPage = function(el, name, animation) {
    cml.currentPage = name;
    var pages = document.getElementsByClassName("page");
    for (var i = 0; i < pages.length; i++) {
        var p = pages[i];
        if (animation) {
            elRemoveClass(p, animation);
        }
        elAppendClass(p, "display-none");
    }
    if (animation) {
        elAppendClass(el, animation);
    }
    elRemoveClass(el, "display-none");
    if (animation) {
        setTimeout(function() {
            elRemoveClass(el, animation);
        }, 500);
    }
};
var loaderOff = function(animation) {
    var el = document.getElementById("loader");
    if (animation) {
        elAppendClass(el, animation);
    }
    setTimeout(function() {
        elRemoveClass(el, animation);
        elAppendClass(el, "display-none");
    }, 500);
};
var getModules = function() {
    return Object.values(moduleInstances);
};
var modulesByType = function(type) {
    return getModules().filter(function(c) {
        return c.type === type;
    });
};
var firstModuleByType = function(type) {
    return modulesByType(type)[0];
};
var moduleNew = function(name) {
    var argsIndexStart = 1;
    var args = Array.prototype.slice.call(arguments, argsIndexStart);
    var found = loaders[name];
    if (found) {
        var m = found.apply(this, args);
        m.__display__();
        return m;
    } else {
        cml.error("Module Name: " + name + " does not exist");
    }
};
var moduleRenderAll = function() {
    objForEach(moduleInstances, function (c) {
        var pageShown = c.container && c.container === cml.currentPage;
        var noPage = !c.container;
        var isHidden = c.isHidden && c.isHidden();
        if (!isHidden) {
            c.__renders__.forEach(function(r) {
                r();
            });
        }
    });
};
var accumFuncs = function(self, key, func) {
    var accum = self[key];
    self[key] = function () {
        accum();
        return func();
    };
};

// DEPENDENCIES
// guid
var makeUUID = function() {
    var template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    return template.replace(/[xy]/g, function(c) {
        var r = ((((Math["random"])()) * 16) | 0);
        var v = ((c === "x") ? r : ((r & 0x3) | 0x8));
        return ((v["toString"])(16));
    });
};

// utility
var isFunction = function(v) {
    return typeof (v) === "function";
};

var isUndefined = function(v) {
    return typeof (v) === "undefined";
};

var objForEachKey = function(h, f) {
    for (var x in h) {
        f(x);
    }
};
var objForEach = function(h, f) {
    for (var x in h) {
        f(h[x]);
    }
};

// el
var elAppend = function(el, child) {
    el.appendChild(child)
};

var elDelete = function(el) {
    return el.parentNode.removeChild(el);
};
var elAppendClass = function(el, className) {
    if (className) {
        var names = className.split(" ");
        names.forEach(function(n) {
            if (n) {
                el.classList.add(n);
            }
        });
    }
};
var elRemoveClass = function(el, className) {
    if (className) {
        var names = className.split(" ");
        names.forEach(function(n) {
            if (n) {
                el.classList.remove(n);
            }
        });
    }
};

// CML API
cml.new = moduleNew;
cml.get = modulesByType;
cml.getFirst = firstModuleByType;
cml.modules = getModules;
cml.say = function (msg) {
    return cmlEvents.say(msg);
};
cml.error = function (msg) {
    return cmlEvents.error(msg);
};
cml.refresh = moduleRenderAll;
cml.init = cmlInit;
cml.getLocation = function() {
    var pageSwapAnchor = document.getElementById("page-swap");
    return pageSwapAnchor.href;
};
cml.setLocation = function(url) {
    url = url || "/";
    cml.prevLocation = window.location.pathname;
    cml.currentLocation = url;
    var pageSwapAnchor = document.getElementById("page-swap");
    return setTimeout(function() {
        pageSwapAnchor.href = url;
        return pageSwapAnchor.click();
    }, 0);
};
cml.prevLocation = "";
cml.currentPage = "";
cml.show = function(name, animation) {
    if (cml.currentPage !== name) {
        var el = document.getElementById(name);
        if (el) {
            showPage(el, name, animation);
        } else {
            var newPage = document.createElement("DIV");
            newPage.id = name;
            newPage.className = "page animated display-none";
            elAppend(document.getElementById("main-content"), newPage);
            return showPage(newPage, name, animation);
        }
    }
    cmlEvents.show();
    moduleRenderAll();
};
cml.loaderOff = loaderOff;

// CML CONFIG
system.__load__ = loadModule;
system.__loaders__ = loaders;
system.__modules__ = modules;
system.cml = cml;
system.extract = extract;
system.addEvents = function(obj) {
    return _.merge(cmlEvents, obj);
}
system.addModule = function(m) {
    modules[m.class] = m;
    components[m.class] = {};
};
system.addComponent = function (c) {
    c.instance = c.instance || function (p, self, el) { return el; };
    var key = c.context || "GLOBAL";
    var context = components[key];
    components[key][c.class] = c;
};
system.addTestModule = function (t) {
    // get module and original events
    var m = modules[t.class];
    var ogCreate = m.create;
    var ogDelete = m.delete || function () {};
    var ogShow = m.show || function () {};
    var ogHide = m.hide || function () {};

    // store test
    moduleTests[t.class] = t;

    // override module events to include test
    m.create = function (p, self, dom) {
        var el = ogCreate(p, self, dom);
        testResults.push({
            p: p,
            pass: t.create(p, self, dom, el),
            test: "create"
        });
        return el;
    };
    m.delete = function (p, self, el) {
        var rtn = ogDelete(p, self, el);
        testResults.push({
            p: p,
            pass: t.delete(p, self, el),
            test: "delete"
        });
        return rtn;
    };
    m.show = function (p, self, el) {
        var rtn = ogShow(p, self, el);
        testResults.push({
            p: p,
            pass: t.show(p, self, el),
            test: "show"
        });
        return rtn;
    };
    m.hide = function (p, self, el) {
        var rtn = ogHide(p, self, el);
        testResults.push({
            p: p,
            pass: t.hide(p, self, el),
            test: "hide"
        });
        return rtn;
    };
    var rTable = m.refresh || {};
    objForEachKey(rTable, function (k) {
        var ogRefresh = rTable[k];
        rTable[k] = function (p, self, el, value) {
            ogRefresh(p, self, el, value);
            testResults.push({
                p: p,
                pass: t.refresh[k](p, self, el, value),
                test: "refresh[" + k + "]"
            });
        };
    });
};
system.addTest = function (t) {
    // get component and original events
    var c = components[(t.context || "GLOBAL")][t.class];
    var ogCreate = c.create;
    var ogInstance = c.instance;
    var ogDelete = c.delete || function () {};
    var ogLoad = c.load || function () {};
    var ogShow = c.show || function () {};
    var ogHide = c.hide || function () {};

    // store test
    if (isUndefined(componentTests[t.context || "GLOBAL"])) {
        componentTests[t.context || "GLOBAL"] = {};
    }
    componentTests[t.context || "GLOBAL"][t.class] = t;

    // override component events to include test
    c.create = function (p, self) {
        var el = ogCreate(p, self);
        testResults.push({
            p: p,
            pass: t.create(p, self, el),
            test: "create"
        });
        return el;

    };
    c.instance = function (p, self, el) {
        var instance = ogInstance(p, self, el);
        testResults.push({
            p: p,
            pass: t.instance(p, self, el, instance),
            test: "instance"
        });
        return instance;
    };
    c.show = function (p, self, el, instance) {
        var rtn = ogShow(p, self, el, instance);
        testResults.push({
            p: p,
            pass: t.show && t.show(p, self, el, instance),
            test: "show"
        });
        return rtn;
    };
    c.hide = function (p, self, el, instance) {
        var rtn = ogHide(p, self, el, instance);
        testResults.push({
            p: p,
            pass: t.hide && t.hide(p, self, el, instance),
            test: "hide"
        });
        return rtn;
    };
    c.delete = function (p, self, el, instance) {
        var rtn = ogDelete(p, self, el, instance);
        testResults.push({
            p: p,
            pass: t.delete && t.delete(p, self, el, instance),
            test: "delete"
        });
        return rtn;
    };
    c.load = function (p, self, el, instance) {
        var rtn = ogLoad(p, self, el, instance);
        testResults.push({
            p: p,
            pass: t.load && t.load(p, self, el, instance),
            test: "load"
        });
        return rtn;
    };
    var rTable = c.refresh || {};
    objForEachKey(rTable, function (k) {
        var ogRefresh = rTable[k];
        rTable[k] = function (p, self, el, instance, value) {
            ogRefresh(p, self, el, instance, value);
            testResults.push({
                p: p,
                pass: t.refresh[k](p, self, el, instance, value),
                test: "refresh[" + k + "]"
            });
        };
    });
};
system.getModule = function (name) {
    return modules[name];
};
system.getComponent = function (name, context) {
    return components[(context || "GLOBAL")][name];
};
system.getTestModule = function (name) {
    return moduleTests[name];
};
system.getTest = function (name, context) {
    return componentTests[context || "GLOBAL"][name];
};
system.getTestResults = function () {
    return testResults;
};
system.createComponent = function(p, parent, className, contextName) {
    var c = system.getComponent(p.__class__ || className, contextName);
    if (c) {
        var el = c.create(p, parent);
        var instance = c.instance(p, parent, el);
        componentInit(c, el, instance, p, parent);
        return el;
    } else {
        throw "No Class Definition " + JSON.stringify(p);
    }
};
system.createMapItems = function (p, parent, el, className, contextName, itemsValue) {
    var items = itemsValue || system.extract(p, "items") || [];
    var props = p.__props__ || [];
    var map = p.map || function (i) { return i; };
    props.forEach(function (i) {
        elAppend(el, system.createComponent(i, parent));
    });
    items.forEach(function (i) {
        var itemP = map(i);
        itemP.__parent__ = p;
        var rowEl = system.createComponent(itemP, parent, className, contextName);
        elAppend(el, rowEl);
    });
    return items;
};
system.logTestResults = function () {
    testResults.forEach(function (t) {
        if (t.pass === false) {
            var desc;
            if (t.p.__name__) {
                desc = t.p.__name__ + "<" + t.p.__class__ + ">";
            } else {
                desc = t.p.__class__;
            }
            console.log("Failed. " + t.test + " for " + desc);
        }
    });
};

system.modifyComponent = function (c2) {
    var name = c2.class;
    var context = c2.context;
    var c1 = system.getComponent(name, context);
    system.addComponent({
        class: c1.class,
        context: c1.context,
        container: c2.container || c1.container,
        refresh: _.merge(c1.refresh, c2.refresh),
        create: c2.create || c1.create,
        load: c2.load || c1.load,
        delete: c2.delete || c1.delete,
        instance: c2.instance || c1.instance,
        show: c2.show || c1.show,
        hide: c2.hide || c1.hide
    });
};
system.modifyModule = function (m2) {
    var name = m2.class;
    var m1 = system.getModule(name);
    system.addModule({
        class: m1.class,
        refresh: _.merge(m1.refresh, m2.refresh),
        create: m2.create || m1.create,
        delete: m2.delete || m1.delete,
        show: m2.show || m1.show,
        hide: m2.hide || m1.hide
    });
};

// EXPORT
window.cmlruntime = system;
window.cardsystem = system;
window.cml = system;
module.exports = system;

// register default modules and components
require("./modules/Module.js").register(system);
require("./modules/html-library.js").register(system);
require("./components/Router.js").register(system);
require("./cml-map.js").register(system);
