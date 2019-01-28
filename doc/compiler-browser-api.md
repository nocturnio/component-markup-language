# CML Compiler API (browser)

## .cmlToJs

``` javascript
cml.cmlToJs(codeStr);
```

`cmlToJs` compiles a CML code string to a javascript code string.

**Arguments**

codeStr (string): a string value in CML format

**Returns**

(string): a string value in javascript format

**Example**

``` javascript
const fs = require("fs");
const cml = require("component-markup-language");

fs.readFile("cml/exampleFile.cml", function (data, err) {
    var cmlCode = "" + data; // cast to string
    var jsCode = cml.cmlToJs(cmlCode);
    fs.writeFile("js/exampleFile.js", jsCode);
});
```
## .cmlToAst
``` javascript
cml.cmlToAst(codeStr);
```

The method `cmlToAst` creates an AST from a CML code string.

**Arguments**

codeStr (string): a string value in CML format

**Returns**

(__[AST](https://github.com/nocturnio/component-markup-language/blob/master/doc/ast.md)__): an abstract syntax tree

**Example**

``` javascript
const fs = require("fs");
const cml = require("component-markup-language");

fs.readFile("/cml/exampleFile.cml", function (data, err) {
    var cmlCode = "" + data; // cast to string
    var ast = cml.cmlToAst(cmlCode);

    // see AST doc for information on AST methods
});
```

## .astToJs

``` javascript
cml.astToJs(ast);
```

The method `astToJs` converts javascript code from an AST.

**Arguments**

ast (__[AST](https://github.com/nocturnio/component-markup-language/blob/master/doc/ast.md)__): Abstract Syntax Tree object

**Returns**

(string): a string value in javascript format

**Example**

``` javascript
const fs = require("fs");
const cml = require("component-markup-language");

fs.readFile("cml/exampleFile.cml", function (data, err) {
    var cmlCode = "" + data; // cast to string
    var ast = cml.cmlToAst(cmlCode);
    var jsCode = cml.astToJs(jsCode);
    fs.writeFile("js/exampleFile.js", jsCode);
});
```
