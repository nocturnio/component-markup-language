
# Component Markup language

CML is a markup language for creating Single Page Applications.
The primary goal of CML is to make frontend development more accessible without making sacrifices to customization and precision.
CML takes the complexity out of frontend development and creates an interface that any programmer would understand.

The secondary goal of CML is to consolidate UI libraries and help organize projects.
CML creates a clear barrier between library creation and library consumption.
In the library creation layer, web programmers can create components using tools they are familiar with.
In the library consumption layer, programmers can use components in a simplified interface without worrying about the implementation details.

## How to use

### Compilers

* __[nocturn.io web editor](https://nocturn.io)__
* __[noct CLI](https://www.npmjs.com/package/noct)__


### As a NPM package

**Step 1**: Install in package directory.
```
npm install component-markup-language
```

**Step 2**: Choose between the frontend or backend CML compiler.

**Step 3 (Optional)**: If frontend, create a browser compatible js file.

Requires __[Browserify](browserify.org)__ and __[Babel](https://babeljs.io)__

```
browserify lib/cml-browser.js -o <file-name>.js
babel <file-name>.js -o <file-name>.js
```

**Step 4**: Read the __[CML Compiler API](https://github.com/nocturnio/component-markup-language/blob/master/doc/compiler/api.md)__.


## Syntax

CML is designed around a simple JSON-like syntax. As a superset of javascript, CML allows one to write any valid javascript code within a Module.

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

The runtime is process based. Meaning each module can be spawned with **cml.new**.
The one exception is the main module which is specified in the app.json file.

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

**Compile Runtime File**

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
It can inter-op with the existing javascript ecosystem using the __[CML Extension API](https://github.com/nocturnio/component-markup-language/blob/master/doc/extension/api.md)__.

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

__[Click Here](https://medium.com/@nocturn4390/making-custom-components-for-cml-15f671b00531)__

## Example

We can redo our counter example with a custom component.

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
