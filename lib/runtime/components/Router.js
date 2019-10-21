// dependencies page.js
module.exports.register = function (cml, modules) {
    var page = modules.page;
    cml.addComponent({
        class: "Router",
        instance: function (p, self, el) {
            return {};
        },
        create: function (p, self) {
            var url = cml.extract(p, "url");
            page(url, function (context) {
                var scrollTop = cml.extract(p, "scrollTop");
                if (scrollTop) {
                    window.scrollTo(0, 0);
                }
                p.route(context);
            });
            return null;
        }
    });
};
