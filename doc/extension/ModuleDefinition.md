# ModuleDefinition

A ComponentDefinition is a template for creating a module type. After adding a ModuleDefinition to CML, the module type can be used in the CML Runtime.

## Options

`class` _(string)_: name of module definition

`refresh` _(Object)_: table of properties that are refreshable.

`create` _(Function)_: method for creating the module HTMLElement. Return should be an HTMLElement or null. If null, the module will have no representation in the UI.

`show` _(Function)_: method that is run on module show.

`hide` _(Function)_: method that is run on module hide.

`delete` _(Function)_: method that is run on module delete.

## Variables

`p` _(Object)_: module properties.

`self` *(__[Module](/doc/runtime/module.md)__)*: The current module.

`el` _(HTMLElement | null)_: This is the HTMLElement created as the return of `.create`. If the component is UI-less than el should be null.

`dom` _(Object)_: Virtual dom of child components. Keys are defined by `componentDefinition.container`.

`value` _(\*)_: The value returned out of the refresh method.

## Template

``` javascript
{    
    class: "myModule",
    refresh: {
        propertyName: function (p, self, el, value) {
            // refresh logic
        }
    },
    create: function (p, self, dom) {
        // create module element
        var el = document.createElement("DIV");

        // append child components
        dom.components.forEach(function (componentEl) {
            el.appendChild(componentEl);
        });

        // append el to a container
        document.getElementById("main").appendChild(el);

        return el;
    },
    show: function (p, self, el) {

    },
    hide: function (p, self, el) {

    },
    delete: function (p, self, el) {

    }
}
```
