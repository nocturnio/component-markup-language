# CML Runtime API

The Runtime API has methods for creating modules and managing state.

## .new

``` javascript
cml.new(moduleName, [params])
```

`cml.new` creates a new instance of `moduleName`.
This also loads the module onto the UI.

**Arguments**

moduleName _(string)_: name of module be instanced
[params] _(...\*)_: parameters to apply to module constructor

**Returns**

*(__[Module](https://github.com/nocturnio/component-markup-language/blob/master/doc/runtime/module.md)__)*: loaded module instance

**Example**

``` javascript
Module main {
    view: {}
    load() {
        var foo = cml.new("foo");
        var bar = cml.new("bar", "custom label");

        foo.button.click(); // logs "foo button clicked"
        bar.button.click(); // logs "custom label clicked"
    }
}
```

``` javascript
DIV foo {
    INPUT button {
        type: "button"
        value: "foo button"
        click(e) {
            console.log("foo button clicked");
        }
    }
}
```

``` javascript
DIV bar(label) {
    INPUT button {
        type: "button"
        value: label
        click(e) {
            console.log(label + " clicked");
        }
    }
}
```

## .init

``` javascript
cml.init([options = {}])
```

`cml.init` initializes the cml runtime.
This method also removes the app loader.

**Arguments**

[options = {}] _(Object)_: options object
[options.loader] _(string)_: loader animation class name

**Example**

``` javascript
Module main {
    data: {}
    load() {
        loadAppData();
    }
    HttpGet loadAppData() {
        url: "/mydata"
        type: "JSON"
        ok(res) {
            cml.init({
                loader: "fadeOut"
            });
        }
    }
}
```

## .modules

``` javascript
cml.modules()
```

Returns all loaded module instances.

**Returns**
_(Array)_: array of __[modules](https://github.com/nocturnio/component-markup-language/blob/master/doc/runtime/module.md)__ instances

**Example**

``` javascript
Module main {
    load() {        
        cml.new("foo");
        cml.new("bar");

        var modules = cml.modules();

        // => [{ __name__: foo ...}, { __name__: "bar" ... }]
    }
}
```

## .get

``` javascript
cml.get(moduleName)
```

Get all modules of `moduleName`

**Arguments**

moduleName _(string)_: module type to filter

**Returns**

_(Array)_: array of __[modules](https://github.com/nocturnio/component-markup-language/blob/master/doc/runtime/module.md)__ that match moduleName

**Example**

``` javascript
Module main {
    load() {        
        cml.new("foo");
        cml.new("foo");
        cml.new("bar");

        var modules = cml.get("foo");

        // => [{ __name__: foo ...}, { __name__: foo ...}]
    }
}
```

## .getFirst

``` javascript
cml.getFirst(moduleName)
```

Get first module matching `moduleName`

**Arguments**

moduleName _(string)_: module type to filter

**Returns**

*(__[Module](https://github.com/nocturnio/component-markup-language/blob/master/doc/runtime/module.md)__)*: first module that matches moduleName

**Example**

``` javascript
Module main {
    load() {        
        cml.new("foo");
        cml.new("foo");
        cml.new("bar");

        var module = cml.getFirst("foo");

        // => { __name__: foo ...}
    }
}
```

## .refresh

``` javascript
cml.refresh()
```

Runs refresh methods for all components.
Will only refresh if value is different.

**Example**

``` javascript
DIV foo(model) {
    INPUT textField {
        type: "text"
        value() {
            return model.counter;
        }
    }
}
DIV bar(model) {
    load() {
        model.counter = 0;
    }
    INPUT {
        type: "button"
        value: "-1"
        click() {
            model.counter -= 1;
            cml.refresh();
        }
    }
    INPUT {
        type: "button"
        value: "+1"
        click() {
            model.counter += 1;
            cml.refresh();
        }
    }
}
```

## .show

``` javascript
cml.show(pageName)
```

`.show` displays a page while hiding all other pages.

**Arguments**

pageName _(string)_: name of page to switch to

**Example**

``` javascript
DIV main {
    load() {
        cml.new("stuff");
        cml.new("stuff2");

    }
    INPUT {
        type: "button"
        value: "page 1"
        click(e) {
            cml.show("page-1");
        }
    }
    INPUT {
        type: "button"
        value: "page 2"
        click(e) {
            cml.show("page-2");
        }
    }
}

DIV stuff {
    container: "page-1"
    innerHTML: "This is on page 1"
}

DIV stuff2 {
    container: "page-2"
    innerHTML: "This is on page 2"
}
```

## .currentPage

`.currentPage` is the current page.  When `.show` is called the current page will change to page name specified.

_(string)_: name of the current page

## .setLocation

``` javascript
cml.setLocation(url)
```

`.setLocation` will change the current location without a page load. If there is no matching Router, then a page load will be made.

**Arguments**

url _(string)_: url to switch to

**Example**

``` javascript
DIV main {
    load() {
        cml.new("stuff");
        cml.new("stuff2");

    }
    INPUT {
        type: "button"
        value: "page 1"
        click(e) {
            cml.setLocation("/page/1");
        }
    }
    INPUT {
        type: "button"
        value: "page 2"
        click(e) {
            cml.setLocation("/page/1");
        }
    }
    Router {
        url: "/page/1"
        route(context) {
            cml.show("page1");
        }
    }
    Router {
        url: "/page/2"
        route(context) {
            cml.show("page2");
        }
    }
    Router {
        url: "*"
        route(context) {
            alert("No page found");
        }
    }
}

DIV stuff {
    container: "page-1"
    innerHTML: "This is on page 1"
}

DIV stuff2 {
    container: "page-2"
    innerHTML: "This is on page 2"
}
```
