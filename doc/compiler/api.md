# CML Compiler API

The compiler API contains methods for compiling CML code.

## .cmlToJs

``` javascript
cml.cmlToJs(codeStr, [moduleName="[no name specified]"])_;
```

`cmlToJs` compiles a CML code string to a javascript code string.

**Arguments**

codeStr _(string)_: a string value in CML format
[moduleName="[no name specified]"] _(string)_: name of module

[moduleName="[no name specified]"] _(string)_: name of module


**Returns**

_(string)_: a string value in javascript format
[moduleName="[no name specified]"] _(string)_: name of module

[moduleName="[no name specified]"] _(string)_: name of module

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
cml.cmlToAst(codeStr, [moduleName="[no name specified]"]);
```

The method `cmlToAst` creates an AST from a CML code string.

**Arguments**

codeStr _(string)_: a string value in CML format
[moduleName="[no name specified]"] _(string)_: name of module

[moduleName="[no name specified]"] _(string)_: name of module

**Returns**

*(__[AST](https://github.com/nocturnio/component-markup-language/blob/master/doc/compiler/AST.md)__)*: an abstract syntax tree

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
cml.astToJs(ast, [moduleName="[no name specified]"]);
```

The method `astToJs` converts javascript code from an AST.

**Arguments**

ast *(__[AST](https://github.com/nocturnio/component-markup-language/blob/master/doc/compiler/AST.md)__)*: Abstract Syntax Tree object

**Returns**

_(string)_: a string value in javascript format
[moduleName="[no name specified]"] _(string)_: name of module

[moduleName="[no name specified]"] _(string)_: name of module

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

## .buildProject

``` javascript
cml.buildProject(project);
```

The method `buildProject` compiles an html page and a javascript file for running a CML project.

**Arguments**

project *(__[Project](https://github.com/nocturnio/component-markup-language/blob/master/doc/compiler/Project.md)__)*: Project object

**Returns**

*(__[ProjectResult](https://github.com/nocturnio/component-markup-language/blob/master/doc/compiler/ProjectResult.md)__)*: compiled result

**Example**

``` javascript
const fs = require("fs");
const cml = require("component-markup-language");

files.forEach((cmlCode) => {
    var result = cml.buildProject(project, templateHTML);
    fs.writeFile("index.html", result.html);
    fs.writeFile("index.js", result.js);
});
```

## .version

``` javascript
cml.version
```

_(string)_: The semantic version number of CML.

**Example**

``` javascript
const cml = require("component-markup-language");

var version = cml.version; // ex. 1.4.78

```

## .runtimeFile

``` javascript
cml.runtimeFile
```

_(string)_: path to the runtime file. Needed to run compiled javascript.

**Example**

``` javascript
const fs = require("fs");
const cml = require("component-markup-language");

fs.readFile(cml.runtimeFile, function (data, err) {
    var jsCode = "" + data; // cast to string
    fs.writeFile("js/cml-runtime.js", jsCode);
});
```

``` html
<script type="text/javascript" src="js/cml-runtime.js"></script>
```
