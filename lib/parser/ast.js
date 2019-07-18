/*
** ast.js
**
** Abstract Syntax Tree objects
** AST.compile generates JSON that is a IR (Intermediate Representation)
** IR can be used to generate javascript
*/

const success = require("./result.js").success;

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
    tree.compile = function (options) {
        return this.lhs.compile(options) + this.value + this.rhs.compile(options);
    };
    return tree;
};

var _code = function (params) {
    if (!params) params = {};
    params.type = "CODE";
    params.value = "";
    var tree = _binary(params);
    tree.compile = function (options) {
        var lhs = this.lhs;
        var rhs = this.rhs;
        var lhsValue = lhs.compile(options);
        var rhsValue = rhs.compile(options);
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
    tree.compile = function (options) {
        return `\"${this.value}\"`;
    };
    return tree;
};

var _quotedString = function (params) {
    var tree = _base({ type: "STRING", value: params.value });
    tree.compile = function (options) {
        return `\\\"${this.value}\\\"`;
    };
    return tree;
};

var _class = function (params) {
    var tree = _base({ type: "CLASS", value: params.value });
    tree.name = params.name;
    tree.args = params.args;
    tree.block = params.block;
    tree.compile = function (options) {
        var blockValue = this.block.compile(options);
        var value = this.value.compile(options);
        var nameValue = this.name.compile(options);
        var haveInput = this.args.type === "UNDEFINED" ? "false" : "true";
        var argsValue = this.args.compile(options);
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
    tree.compile = function (options) {
        var value = this.value.compile(options);
        var nameValue = this.name.compile(options);
        var blockValue = this.block.compile(options);
        var argsValue = this.args.compile(options);
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
    tree.compile = function (options) {
        var value = this.value.compile(options);
        var nameValue = this.name.compile(options);
        var blockValue = this.block.compile(options);
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
    var compileClasses = function (options) {
        var propsValue = _classes.map(function (c) { return c.compile(options); })
            .filter(function (str) { return str !== ""; })
            .join(",");
        return `\"__props__\": [${propsValue}]`;
    };
    if (!params) params = {};
    params.type = "BLOCK";
    params.value = "NA";
    var tree = _base(params);
    tree.addClass = function (c) {
        _classes.push(c);
    };
    tree.addKeyPair = function (k) {
        _classes.push(k);
    };
    tree.addComment = function (c) {
        _classes.push(c);
    };
    tree.compile = function (options) {
        var cEmpty = _classes.length === 0;
        var rtn = "";
        if (!cEmpty) {
            rtn += compileClasses(options);
        }
        return rtn;
    };
    tree.classes = _classes;
    return tree;
};

var _keyPair = function (params) {
    if (!params) params = {};
    params.type = "KEY-PAIR";
    var tree = _base(params);
    tree.compile = function (options) {
        var keyValue = this.key.compile(options);
        var value = this.value.compile(options);
        var rtn = "";
        rtn += "{";
        rtn += `\"__class__\": \"__KeyPair__\",`;
        rtn += `\"__key__\": ${keyValue},`;
        rtn += `\"__value__\": \"${value}\"`;
        rtn += "}";
        return rtn;
    };
    return tree;
};

var _comment = function (params) {
    if (!params) params = {};
    params.type = "COMMENT";
    var tree = _base(params);
    tree.compile = function (options) {
        options = options || {};
        if (options.removeComments) {
            return "";
        }
        var rtn = "";
        var commentValue = JSON.stringify(this.value.compile(options));
        var before = params.before ? "true" : "false";
        var closed = params.block ? "true" : "false";
        rtn += "{";
        rtn += `\"__class__\": \"__Comment__\",`;
        rtn += `\"__comment__\": ${commentValue},`;
        rtn += `\"__before__\": ${before},`;
        rtn += `\"__closed__\": ${closed}`;
        rtn += "}";
        return rtn;
    };
    return tree;
};
var _array = function (params) {
    if (!params) params = {};
    params.type = "ARRAY";
    var tree = _base(params);
    tree.compile = function (options) {
        options = options || {};
        return this.value.split("\n").join("");
    };
    return tree;
};
var _arrayCode = function (params) {
    if (!params) params = {};
    params.type = "ARRAY-CODE";
    var tree = _base(params);
    tree.compile = function (options) {
        // component level 2
        // module level 1
        // base level 0
        options = options || {};
        var indentLevel = options.indentLevel || 0;
        var indentSize = options.indentSize || 4;
        var spaceValue = " ".repeat(indentSize);
        var indentValue = spaceValue.repeat(indentLevel);
        var newline = params.newline;
        var arrayValue = this.value.compile(options);
        var rtn = `${arrayValue}`;
        return rtn;
    };
    return tree;
};
var _closedCommentCode = function (params) {
    if (!params) params = {};
    params.type = "COMMENT-CLOSED-CODE";
    var tree = _base(params);
    tree.compile = function (options) {
        // component level 2
        // module level 1
        // base level 0
        options = options || {};
        if (options.removeComments) {
            return "";
        }
        var indentLevel = options.indentLevel || 0;
        var indentSize = options.indentSize || 4;
        var spaceValue = " ".repeat(indentSize);
        var indentValue = spaceValue.repeat(indentLevel);
        var newline = params.newline;
        var commentValue = this.value.compile(options);

        commentValue = commentValue.trim();
        commentValue = commentValue.split("\n");
        commentValue = commentValue.map(function (s) {
            if (s[0] === " ") {
                var firstNonWhiteSpaceIdx = 1;
                for (var i = 0; i < s.length; i++) {
                    if (s[i] !== " ") {
                        firstNonWhiteSpaceIdx = i;
                        break;
                    }
                }
                /*
                var indentIdx = (indentSize * indentLevel);
                if (firstNonWhiteSpaceIdx > indentIdx) {
                    return "{{IndentMarker}}" + s.slice(indentIdx);
                } else {
                    return "{{IndentMarker}}" + s.slice(firstNonWhiteSpaceIdx);
                }
                */
                return s.trim();
            } else {
                return s;
            }
        });
        commentValue = "\n" + commentValue.join("\n") + "\n";
        var serialized = JSON.stringify(commentValue); // serialize escape chars
        serialized = serialized.slice(1, serialized.length - 1);
        var rtn = `/*${serialized}*/`;
        return rtn;
    };
    return tree;
};
var _commentCode = function (params) {
    if (!params) params = {};
    params.type = "COMMENT-CODE";
    params.block = false;
    var tree = _base(params);
    tree.compile = function (options) {
        // component level 2
        // module level 1
        // base level 0
        options = options || {};
        if (options.removeComments) {
            return "";
        }
        var indentLevel = options.indentLevel || 0;
        var indentSize = options.indentSize || 4;
        var spaceValue = " ".repeat(indentSize);
        var indentValue = spaceValue.repeat(indentLevel);
        var closed = params.block;
        var newline = params.newline;
        var commentValue = this.value.compile(options);
        commentValue += "\n";
        var serialized = JSON.stringify(commentValue);
        serialized = serialized.slice(1, serialized.length - 1); // remove stringify outer quotes
        var rtn = `//${serialized}`;
        if (newline) {
            rtn = JSON.stringify("\n").split("\"").join("") + rtn;
        }
        return rtn;
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
    arrayCode: _arrayCode,
    string: _string,
    quotedString: _quotedString,
    text: _text,
    args: _args,
    block: _block,
    keyPair: _keyPair,
    comment: _comment,
    closedCommentCode: _closedCommentCode,
    commentCode: _commentCode,
    isAst: _isAst
};
module.exports.ast = ast;
