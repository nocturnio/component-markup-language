
# Component Markup language

CML is a markup language for creating Single Page Applications.

We believe that frontend development can be made more descriptive and less complicated.

As a superset of JavaScript, CML leverages the existing web ecosystem in an elegant declarative language.

Build powerful web applications with the most accessible framework to date.


## How to use

There are a few ways to use CML right away.

* __[nocturn.io IDE](https://nocturn.io)__
* __[noct CLI](https://www.npmjs.com/package/noct)__

You can also create your own CLI or IDE if needed.
This __[repo](https://github.com/nocturnio/component-markup-language)__ has all you need to compile CML code as a JavaScript library.
It works in browser or on the command line with node.


## Syntax

CML is designed around a simple JSON-like syntax.
As a superset of javascript, CML allows you to write any valid javascript code.

**Example**
``` javascript
Card loginCard(api) {
    class: "login-card"
    TextField usernameField {
        value: api.defaultUsername
        label: "Username"
    }
    PasswordField passwordField {
        value: ""
        label: "Password"
    }
    Button loginButton {
        label: "Sign In"
        click(e) {
            api.signin({
                username: self.usernameField.value,
                password: self.passwordField.value
            });
        }
    }
}
```

**Syntax Form**
```
Module moduleName(parameters, ...) {
    property: <javascript value>
    method(parameters, ...) {
        <javascript code>
        ...
    }
    Component componentName {
        property: <javascript value>
        method(parameters, ...) {
            <javascript code>
            ...
        }
    }
    ...
}
```

## Runtime

The runtime has to be included to any page using compiled CML code.
The runtime is process based. Meaning each module can be spawned with **cml.new**.
The one exception is the main module which is specified in the app.json file, this will be launched on app load.

__[CML Runtime API](https://github.com/nocturnio/component-markup-language/blob/master/doc/runtime/api.md)__.

**Example**
``` javascript
Module main {
    load() {
        cml.new("textCard", 0);
    }
}
Card textCard(text) {
    Text {
        value: text
    }
}
```

**Create Runtime File**

Requires __[Browserify](browserify.org)__ and __[Babel](https://babeljs.io)__

```
browserify lib/runtime/cml-runtime.js -o <file-name>.js
babel <file-name>.js -o <file-name>.js
```

### Data Refresh

Properties in CML can be refreshed using **cml.refresh**.
When refreshing we update the its value and also its HTML representation.
To make a property refresh we simply define it as a function whose return will be the new value.

The method **cml.refresh** will only re-render properties whose value is different.
In this example, once textCard is clicked the value will stay as "cleared" and not modify the underlying HTML anymore.

**Example**
``` javascript
Module main {
    load() {
        var model = {
            count: 0
        };
        cml.new("textCard", model);
        cml.new("counterCard", model);
    }
}
Card textCard(model) {
    Text {
        value() {
            return model.count;
        }
    }
}
Card counterCard(model) {
    Button {
        label: "Minus 1"
        click(e) {
            model.count--;
            cml.refresh();
        }
    }
    Button {
        label: "Plus 1"
        click(e) {
            model.count++;
            cml.refresh();
        }
    }
}
```

## Inter-op with javascript

CML is designed to be customizable.
It can inter-op with the existing JavaScript ecosystem.
There are a couple ways to use external JavaScript in CML.

### Just use it
CML is a superset of javascript. Which means JavaScript can written inside of CML natively.

### Adding Extensions
Creating custom Components or Modules for CML is easy using the __[Extension API](https://github.com/nocturnio/component-markup-language/blob/master/doc/extension/api.md)__.

The benefit of making an extension is that we can hide away the implementation details.
Meaning the user of the Module/Component can use a simple interface, without having to learn how it is made.

**Add a component to CML**
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

**Using the component in CML**
``` javascript
Card notificationCard {
    Notification {
        label: "hello"
    }
}
```

**Example of using CML with React**

__[Here is an example of using a React component in CML.](https://medium.com/@nocturn4390/making-custom-components-for-cml-15f671b00531)__

## Counter Example

Let's redo the counter example by making a custom Counter component.

**Counter Component**
``` javascript
cml.addComponent({
    class: "Counter",
    create: function (p, m) {
        var countText = cml.createComponent({
            value: function () {
                return cml.extract(p, "model").count;
            }
        }, m, "Text");
        var minusButton = cml.createComponent({
            label: cml.extract(p, "minusLabel"),
            click: function (e) {
                cml.extract(p, "model").count--;
                cml.runtime.refresh();
            }
        }, m, "Button");
        var plusButton = cml.createComponent({
            label: cml.extract(p, "plusLabel"),
            click: function (e) {
                cml.extract(p, "model").count++;
                cml.runtime.refresh();
            }
        }, m, "Button");
        var el = document.createElement("DIV");
        el.appendChild(countText);
        el.appendChild(minusButton);
        el.appendChild(plusButton);
        return el;
    }
});
```

**Using our Counter Component**
``` javascript
Module main {
    load() {
        var model = {
            count: 0
        };
        cml.new("counterCard", model);
    }
}
Card counterCard(model) {
    Counter {
        model: model
        minusLabel: "Minus 1"
        plusLabel: "Plus 1"        
    }
}
```

## Compiling the Compiler

If you want to build your the CML compiler to include to your own projects, here are the steps.

**Step 1**: Install in package directory.
```
npm install component-markup-language
```

**Step 2**: Choose between the browser version or node version of CML compiler.

**Step 3 (Optional)**: If browser version, create a browser compatible js file.

Requires __[Browserify](browserify.org)__ and __[Babel](https://babeljs.io)__

```
browserify lib/cml-browser.js -o <file-name>.js
babel <file-name>.js -o <file-name>.js
```

**Step 4**: Read the __[CML Compiler API](https://github.com/nocturnio/component-markup-language/blob/master/doc/compiler/api.md)__.
