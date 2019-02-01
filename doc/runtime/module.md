# Module Instance

A module instance is a loaded module. It will have all properties and methods defined on it.

**Example**
``` javascript
Module foo {
    x: 100
    y: 10
    calc() {
        return x + y;
    }
}
```

``` javascript

var foo = cml.getFirst("foo");

foo.x; // => 100
foo.y; // => 10
foo.calc(); // => 110

```
