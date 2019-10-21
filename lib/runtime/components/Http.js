module.exports.register = function (cml, modules) {
    const http = modules.http;
    cml.addComponent({
        class: "HttpGet",
        instance: function (p, m, el) {
            return p.__function__ || function () {
                return httpSendP(p);
            };
        },
        defaultProperty: "url",
        create: function (p, m) {
            return function () {
                return httpSendP(p);
            };
        }
    });

    cml.addComponent({
        class: "HttpPost",
        instance: function (p, m, el) {
            return p.__function__ || function () {
                return httpSendP(p);
            };
        },
        defaultProperty: "url",
        create: function (p, m) {
            return function () {
                return httpSendP(p);
            };
        }
    });

    var httpSendP = function (p) {
        var options = {
            url: cml.extract(p, "url"),
            data: cml.extract(p, "data"),
            preloader: cml.extract(p, "preloader"),
            type: cml.extract(p, "type") || "TEXT",
            problem: p.problem || function (e, s) {},
            ok: p.ok || function (res) {},
            class: p.__class__
        };
        return httpSend(options);
    };

    var httpSend = function (options) {
        var op = options;
        var send = httpMethods[op.class];
        if (!send) {
            throw "No http method found named: " + op.class;
        }
        send(op.url, op.data)
            .then(function (res) {
                var converter = typeConverters[op.type] || function (res) {
                    return res;
                };
                op.ok(converter(res));
            })
            .catch(function (e) {
                var converter = typeConverters[op.type.toUpperCase()] || typeConverters["TEXT"];
                op.problem(converter(e.data), e.statusCode);
            });
    };
    var httpMethods = {
        "HttpGet": http.get,
        "HttpPost": http.post
    };
    var typeConverters = {
        "JSON": function (res) {
            return JSON.stringify(res);
        },
        "TEXT": function (res) {
            return res;
        }
    };
};
