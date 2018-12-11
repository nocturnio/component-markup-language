/*
** AST
**
**
*/

const success = require("./result.js").success;

(function () {
    var keywords = [
        "break",
        "catch",
        "class",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "export",
        "extends",
        "finally",
        "for",
        "function",
        "if",
        "import",
        "instanceof",
        "new",
        "return",
        "super",
        "switch",
        "this",
        "throw",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",
        "yield"
    ];
    var keywordsOperator = ["in"];

    // ast
    var _base = function (params) {
        return {
            type: params.type,
            value: params.value,
            analyze: function (scope) {
                return success.create(scope);
            },
            compile: function () {
                return this.value;
            },
            debug: function () {
                return `${this.value} <${this.type}>`;
            },
            match: function (obj) {
                return obj.type === this.type;
            }
        };
    };

    var _unit = function () {
        return _base({ value: "", type: "UNIT" });
    };

    var _undefined = function () {
        return _base({ value: "", type: "UNDEFINED" });
    };

    var _binary = function (params) {
        var tree = _base({ type: "BINARY", value: params.value });
        tree.lhs = params.lhs;
        tree.rhs = params.rhs;
        tree.compile = function () {
            return this.lhs.compile() + this.value + this.rhs.compile();
        };
        return tree;
    };

    var _code = function (params) {
        if (!params) params = {};
        params.type = "CODE";
        params.value = "";
        var tree = _binary(params);
        tree.compile = function () {
            var lhs = this.lhs;
            var rhs = this.rhs;
            var lhsValue = lhs.compile();
            var rhsValue = rhs.compile();
            var rtn = "";
            rtn += lhsValue;
            rtn += (keywords.indexOf(lhsValue) > -1) ? " " : "";
            if (keywords.indexOf(rhsValue) > -1) {
                rtn += rhsValue + " ";
            } else if (keywordsOperator.indexOf(rhsValue) > -1) {
                rtn += " " + rhsValue + " ";
            } else {
                rtn += rhsValue;
            }
            return rtn;
        };
        return tree;
    };

    var _textCode = function (params) {
        if (!params) params = {};
        params.type = "CODE";
        params.value = " ";
        var tree = _binary(params);
        return tree;
    };

    var _identifier = function (params) {
        var tree = _base({ type: "IDENTIFIER", value: params.value });
        return tree;
    };

    var _string = function (params) {
        var tree = _base({ type: "STRING", value: params.value });
        tree.compile = function () {
            return `\"${this.value}\"`;
        };
        return tree;
    };

    var _quotedString = function (params) {
        var tree = _base({ type: "STRING", value: params.value });
        tree.compile = function () {
            return `\\\"${this.value}\\\"`;
        };
        return tree;
    };

    var _class = function (params) {
        var tree = _base({ type: "CLASS", value: params.value });
        tree.name = params.name;
        tree.args = params.args;
        tree.block = params.block;
        tree.compile = function () {
            var blockValue = this.block.compile();
            var value = this.value.compile();
            var nameValue = this.name.compile();
            var haveInput = this.args.type === "UNDEFINED" ? "false" : "true";
            var argsValue = this.args.compile();
            var rtn = "";
            rtn += "{";
            rtn += `\"__class__\": ${value},`;
            rtn += `\"__name__\": ${nameValue},`;
            rtn += `\"__haveInput__\": ${haveInput},`;
            rtn += `\"__input__\": [${argsValue}]`;
            rtn += blockValue === "" ? "" : ",";
            rtn += blockValue;
            rtn += "}";
            return rtn;
        };
        return tree;
    };

    var _event = function (params) {
        if (!params) params = {};
        params.type = "EVENT";
        var tree = _class(params);
        tree.compile = function () {
            var value = this.value.compile();
            var nameValue = this.name.compile();
            var blockValue = this.block.compile();
            var argsValue = this.args.compile();
            var rtn = "";
            rtn += "{";
            rtn += `\"__class__\": ${value},`;
            rtn += `\"__name__\": ${nameValue},`;
            rtn += `\"__action__\": \"${blockValue}\",`;
            rtn += `\"__input__\": [${argsValue}]`;
            rtn += "}";
            return rtn;
        };
        return tree;
    };

    var _text = function (params) {
        if (!params) params = {};
        params.type = "TEXT";
        var tree = _class(params);
        tree.compile = function () {
            var value = this.value.compile();
            var nameValue = this.name.compile();
            var blockValue = this.block.compile();
            var rtn = "";
            rtn += "{";
            rtn += `\"__class__\": ${value},`;
            rtn += `\"__name__\": ${nameValue},`;
            rtn += `\"__value__\": \"${blockValue}\"`;
            rtn += "}";
            return rtn;
        };
        return tree;
    };

    var _args = function (params) {
        if (!params) params = {};
        params.type = "ARGS";
        params.value = ",";
        var tree = _binary(params);
        return tree;
    };

    var _block = function (params) {
        var _classes = [];
        var _keyPairs = [];
        var compileClasses = function () {
            var propsValue =  _classes.map(function (c) { return c.compile(); }).join(",");
            return `\"__props__\": [${propsValue}]`;
        };
        var compileKeyPairs = function () {
            return _keyPairs.map(function (k) { return k.compile(); }).join(",");
        };
        if (!params) params = {};
        params.type = "BLOCK";
        params.value = "NA";
        var tree = _base(params);
        tree.addClass = function (c) {
            _classes.push(c);
        };
        tree.addKeyPair = function (k) {
            _keyPairs.push(k);
        };
        tree.compile = function () {
            var cEmpty = _classes.length === 0;
            var kEmpty = _keyPairs.length === 0;
            var rtn = "";
            if (!cEmpty) {
                rtn += compileClasses();
            }
            if (!cEmpty && !kEmpty) {
                rtn += ",";
            }
            if (!kEmpty) {
                rtn += compileKeyPairs();
            }
            return rtn;
        };
        return tree;
    };

    var _keyPair = function (params) {
        if (!params) params = {};
        params.type = "KEY-PAIR";
        var tree = _base(params);
        tree.compile = function () {
            var keyValue = this.key.compile();
            var value = this.value.compile();
            return `${keyValue}: \"${value}\"`;
        };
        return tree;
    };
    var _isAst = function (obj) {
        return typeof (obj.compile) !== "undefined";
    };

    var ast = {
        "class": _class,
        "event": _event,
        "undefined": _undefined,
        unit: _unit,
        binary: _binary,
        code: _code,
        textCode: _textCode,
        identifier: _identifier,
        string: _string,
        quotedString: _quotedString,
        text: _text,
        args: _args,
        block: _block,
        keyPair: _keyPair,
        isAst: _isAst
    };

    if (typeof(exports) === "undefined") {
        exports = {};
    }
    exports.ast = ast;
})();
