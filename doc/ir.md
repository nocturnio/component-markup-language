#  (IR) Intermediate Representation

The IR is a serializable format for representing the code. It is the last format before compilation to javascript. All IR properties are in private format, \_\_propertyName__, to prevent user defined properties from shadowing them.

**Example in CML**
``` javascript
Card myCard(size, title) {
    size: size
    title: title    
    Button myButton {
        label: "click me",
        click(e) {
            alert("clicked!");
        }
    }
}

```

**Example in IR**
``` json
{
    "__name__": "myCard",
    "__class__": "Card",
    "__input__": ["size", "title"],
    "__props__": [{
        "__name__": "myButton",
        "__class__": "Button",
        "__props__": [{
            "__name__": "click",
            "__type__": "Event",
            "__haveInput__": true,
            "__input__": ["e"],
            "__action__": "alert(\"clicked!\");"
        }],
        "label": "\"click me\""
    }],
    "size": "size",
    "title": "title"
}
```
