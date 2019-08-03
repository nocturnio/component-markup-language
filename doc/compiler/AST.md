# (AST) Abstract Syntax Tree

The AST is an object created by the parser. CML code is parsed and an AST is generated. The AST allows us to traverse and manipulate the parsed code.

## .type

``` javascript
ast.type
```

(string): syntax type

**Example**

``` javascript
var type = ast.type;
```

**types**

UNIT
UNDEFINED
BINARY
KEY-PAIR
CODE
STRING
EVENT
TEXT
BLOCK

## .value

``` javascript
ast.value
```

(string): unprocessed string value of AST.

## .compile

``` javascript
ast.compile()
```

`ast.compile` generates an Intermediate Representation (__[IR](https://github.com/nocturnio/component-markup-language/blob/master/doc/compiler/IR.md)__), formatted in JSON

**Returns**

(string): IR object in JSON string, __[IR Doc](https://github.com/nocturnio/component-markup-language/blob/master/doc/compiler/IR.md)__

**Example**

``` javascript
var irCode = ast.compile();
var irObject = JSON.parse(irCode);

// see IR doc for properties
```
