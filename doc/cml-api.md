# CML API

| Name | Description |
| ------ | ----------- |
| cml.say(message) | Display a toast with message on it |
| cml.error(message) | Display an error toast with message on it |
| cml.setLocation(url) | Set url location. If url does not match a Router, a page load will occur. |
| cml.show(pageName) | Show specified page. All other pages will be hidden. |
| cml.currentPage | Last page shown using cml.show |




## .new

``` javascript
cml.new(moduleName, [params])
```

`cml.new` creates a new instance of `moduleName`.
This also loads the module onto the UI.

**Arguments**

moduleName (string): name of module be instanced
[params] (...\*): parameters to apply to module constructor

**Returns**

(__[Module](https://github.com/nocturnio/component-markup-language/blob/master/doc/module.md)__): loaded module instance

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

[options = {}] (Object): options object
[options.loader] (string): loader animation class name

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
(Array): array of __[modules](https://github.com/nocturnio/component-markup-language/blob/master/doc/module.md)__ instances

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

moduleName (string): module type to filter

**Returns**

(Array): array of __[modules](https://github.com/nocturnio/component-markup-language/blob/master/doc/module.md)__ that match moduleName

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

moduleName (string): module type to filter

**Returns**

(__[Module](https://github.com/nocturnio/component-markup-language/blob/master/doc/module.md)__): first module that matches moduleName

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
