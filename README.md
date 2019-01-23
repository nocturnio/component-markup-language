# Component Markup language

CML is a markup language for creating Single Page Applications.
The primary goal of CML is to make frontend development more accessible.
CML takes the complexity of frontend development and creates an interface that any programmer would understand.

The secondary goal of CML is to consolidate UI libraries and help organize projects.
CML creates a clear barrier between library creation and library consumption.
In the library creation layer, web programmers can create components using tools they are familiar with.
In the library consumption layer, programmers can use components in a simplified interface without worrying about the implementation details.

## How to use

**Implementations**

* __[nocturn.io web editor](https://nocturn.io)__
* __[noct CLI](https://www.npmjs.com/package/noct)__

**As a NPM module**
```
npm install component-markup-language
```

**As a Browser Compatible File**

Requires __[Browserify](browserify.org)__ and __[Babel](https://babeljs.io)__
```
browserify lib/cml-browser.js -o <file-name>.js
babel <file-name>.js -o <file-name>.js
```

## Syntax

CML is designed around a simple JSON-like syntax.
Think of it as an organizer for your javascript.

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

**Example**
``` javascript
/*
** This Module will create 3 textCards with someText preloaded. (main module)
*/
Module appStart() {
    load() {
        ["hello", "world", "goodbye"].forEach(function (msg) {
            cml.new("textCard", msg);
        });
    }
}
/*
** This Module is a simple Card with text on it
*/
Card textCard(someText) {
    Text {
        value: someText
    }
}
```

Properties in CML can be refreshed using **cml.refresh**.
When refreshing we update the its value and also its HTML representation.
To make a property refresh we simply define it as a function whose return will be the new value.

The method **cml.refresh** will only re-render properties whose value is different.
In this example, once textCard is clicked the value will stay as "cleared" and not modify the underlying HTML anymore.

**Example using refresh**
``` javascript
/*
** This Module will create 3 textCards with someText preloaded. (main module)
*/
Module appStart() {
    load() {
        ["hello", "world", "goodbye"].forEach(function (msg) {
            cml.new("textCard", msg);
        });
    }
}
/*
** This Module is a simple Card with text on it.
** Now this Card will change its Text value to "cleared" when clicked.
*/
Card textCard(someText) {
    textValue: someText
    click() {
        self.textValue: "cleared"
        cml.refresh();
    }
    Text {
        value() {
            return self.textValue;
        }
    }
}
```

## Customization

CML is designed to be customizable.
It fits into the existing web ecosystem because the boundaries of CML use plain javascript objects.
For the programmer using the component in CML, it does not matter whether the component is made in React, Vue, or plain javascript.
The interface remains the same because CML creates an abstraction over the implementation details.

__[Nocturn UI](https://github.com/nocturnio/nocturn-ui)__ is an implementation of a CML.
With CML customization, you can add onto a library like Nocturn UI or create your own UI library from scratch.

**Add a component to CML**
``` javascript
/*
** Adds a component named Notification to CML
*/
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
/*
** Creates a Card with a Notification component
*/
Card notificationCard {
    Notification {
        label: "hello"
    }
}
```

**Example of using CML with React**

__[Click Here](https://medium.com/@nocturn4390/making-custom-components-for-cml-15f671b00531)__
