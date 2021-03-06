# CML Extension API

The Extension API is contains methods extending CML with custom Modules and Components.
This interface is available in a JavaScript file that is included to the page with cml-runtime.js

On page load, the runtime will load extensions into the language before any modules or components in your .cml files are rendered.


![architecture](/doc/architecture.png)

## .addComponent
``` javascript
cml.addComponent(componentDefinition)
```

`cml.addComponent` lets you extend CML with your own custom component.

**Arguments**

componentDefinition *(__[ComponentDefinition](/doc/extension/ComponentDefinition.md)__)*: component definition

**Example**
``` javascript
cml.addComponent({
    class: "Notification",
    create: function (p, m) {
        var el = document.createElement("DIV");
        var label = cml.extract(p, "label");
        el.appendChild(document.createTextNode(label));
        return el;
    }
});
```

## .addModule
``` javascript
cml.addModule(moduleDefinition)
```

`cml.addModule` lets you extend CML with your own custom module.

**Arguments**

moduleDefinition *(__[ModuleDefinition](/doc/extension/ModuleDefinition.md)__)*: module definition

**Example**
``` javascript
cml.addModule({
    class: "NavBar",
    create: function (p, self, dom) {
        var el = document.createElement("DIV");
        return el;
    }
});
```

## .extract

``` javascript
cml.extract(p, key)
```

This method extracts a property value from the component properties.
If the value is a function it will be invoked and returned.

**Arguments**

p _(Object)_: all properties of component or module

key _(string)_: key to a specific property

**Returns**

_(\*)_: the extracted value at the key provided

**Example**

``` javascript
Button {
    color: "blue"
    label() {
        return "hello";
    }
}
```

``` javascript
cml.extract(p, "color");
// => "blue"

cml.extract(p, "label");
// => "hello"
```


## .getModule
``` javascript
cml.getModule(moduleName)
```

Get a module definition that has already been added.

**Arguments**

moduleName _(string)_: name of module definition

**Returns**

*(__[ModuleDefinition](/doc/extension/ModuleDefinition.md)__)*: module definition

## .getComponent

``` javascript
cml.getComponent(componentName, [moduleName="GLOBAL"])
```

Get a component definition that has already been added.

**Arguments**

componentName _(string)_: name of component definition

[moduleName="GLOBAL"] _(string)_: module scope of the component definition

**Returns**

*(__[ComponentDefinition](/doc/extension/ComponentDefinition.md)__)*: component definition

## .createComponent

``` javascript
cml.createComponent(p, m, componentName, [moduleName])
```

Load a component dynamically. Useful for creating child components.

**Arguments**

p _(Object)_: all properties of component or module

m *(__[Module](/doc/runtime/module.md)__)*: parent module

componentName _(string)_: component type to create

[moduleName] _(string)_: module scope of the component definition

**Returns**

_(\* | HTMLElement)_: output of `componentDefinition.create`

## .createMapItems

``` javascript
cml.createMapItems(p, m, el, componentName, [moduleName="GLOBAL"], [preloadedItems=null])
```

Loads a list of components dynamically. Will be generated from p.items and p.map. Created elements will be appended to el.

**Arguments**

p _(Object)_: all properties of component or module

m *(__[Module](/doc/runtime/module.md)__)*: parent module

el _(HTMLElement)_: component html element

componentName _(string)_: component type to create

[moduleName="GLOBAL"] _(string)_: module scope of the component definition

[preloadedItems=null] _(Array)_: preloaded items, if not provided items will be extracted from p.items

**Returns**

_(Array)_: array of items, extracted from p.items
