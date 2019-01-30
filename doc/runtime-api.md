| Name | Description |
| ----- | ------- |
| cml.extract(p, key) | |
| cml.addComponent(component) | |
| cml.addModule(module) | |
| cml.getModule(moduleName) | |
| cml.getComponent(componentName, moduleName) | |
| cml.createComponent(p, parentModule, componentName, moduleName) | |
| cml.createMapItems(p, parentModule, el, componentName, moduleName) | |

| cml.logTestResults() | |
| cml.addTest(componentTest) | |
| cml.addTestModule(moduleTest) | |
| cml.getTest(componentName, moduleName) | |
| cml.getTestModule(moduleName) | |
| cml.getTestResults() | |


``` javascript
cml.extract(p, key)
```

This method extracts a property value from the component properties.
If the value is a function it will be invoked and returned.

**Arguments**

p: all properties of the component or module

key: key to a specific property

**Returns**

(*): the extracted value at the key provided

**Example**

``` javascript
/* in CML
Button {
    color: "blue"
    label() {
        return "hello";
    }
}
*/

cml.extract(p, "color");
// => "blue"

// will extract value if it is a function or value
cml.extract(p, "label");
// => "hello"
```
