# ComponentDefinition

A ComponentDefinition is a template for creating a component type. After adding a ComponentDefinition to CML, the component type can be used in the CML Runtime.

## Options

`class` _(string)_: name of component definition

`context` _(string)_: scope where component is allowed. Is a module name. Default is "GLOBAL".

`container` _(string)_: name of container to store component in the virtual `dom` of the parent module.

`refresh` _(Object)_: table of properties that are refreshable.

`create` _(Function)_: method for creating the component HTMLElement. Return should be an HTMLElement or null. If null, the component will have no representation in the UI.

`instance` _(Function)_: method for binding an instance value. This is the value that is used in the runtime when the component is referenced.

`load` _(Function)_: method that is run on component load. Place initialization logic here.

`show` _(Function)_: method that is run on component show.

`hide` _(Function)_: method that is run on component hide.

`delete` _(Function)_: method that is run on component delete.

## Variables

`p` _(Object)_: component properties

`m` *(__[Module](/nocturnio/component-markup-language/blob/master/doc/runtime/module.md)__)*: This is the module that component was created in.

`el` _(HTMLElement | null)_: This is the HTMLElement created as the return of `.create`. If the component is UI-less than el should be null.

`instance` _(\*)_: This is the return of `.instance`. This is the value that will be referenced when you access the loaded component in runtime.

`value` _(\*)_: The value returned out of the refresh method.

## Template
``` javascript
{    
    class: "myComponent",
    context: "moduleName",
    container: "myContainer",
    refresh: {
        propertyName: function (p, m, el, instance, value) {
            // refresh logic
        }        
    },
    create: function (p, m) {
        // create component element
        var el = document.createElement("p");

        el.appendChild(document.createTextNode("Empty Component"));

        return el;
    },
    instance: function (p, m, el) {

    },
    load: function (p, m, el, instance) {

    },
    show: function (p, m, el, instance) {

    },
    hide: function (p, m, el, instance) {

    },
    delete: function (p, m, el, instance) {

    }
}
```

## Examples

**Example of instance usage**
``` javascript
{
    class: "Button",
    instance: function (p, m, el) {
        return el;
    }
}
```

``` javascript
Card foo {
    load() {
        // self.button is the instance
        self.button.click();
    }
    Button button {
        label() {
            return "hello";
        }
        click() {
            console.log("hello world");
        }
    }
}
```

**Example of refresh value**
``` javascript
Button {
    label() {
        return "hello";
    }
}
```

``` javascript
{    
    class: "Button",
    refresh: {
        label: function (p, m, el, instance, value) {
            // value == "hello"
        }        
    }
}
```
