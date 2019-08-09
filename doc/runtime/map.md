# cml.map

Map is a unique function for converting data to UI.
This is useful for situations where we do not need to define a separate CML module.

Treat maps the same way you would treat a lambda when coding with functions.
Just like lambdas cml.map is used for short dynamic transformations that do not warrant their own definitions.

## Mapping Priority

cml.map works on a rules table. The rules table has an order of precedence.

For the data object,

``` javascript
var data = {
    a: {
        b: {
            c: {
                d: "hello"
            }
        }
    }
}
```

Say we want to map the property 'd'. There are a few different rules we can write.

``` javascript
var rules1 = {
    "a.b.c.d": "H3"
};

var rules2 = {
    "b.c.d": "H3"
};

var rules3 = {
    "d": "H3"
};
```

All three of these rules will output a module that maps the property data.a.b.c.d to a "H3".

What if we were to merge the rules into one table?

``` javascript
var rules = {
    "a.b.c.d": "H1",
    "b.c.d": "H2",
        "d": "H3"
};
```

With this merged table we also changed the values to "H1", "H2", "H3" so that we can differentiate between their outputs.
When we have multiple rules that collide in this way we need to know the order of precedence to see which rules will be applied.

In this case, the rule for "a.b.c.d" will be the one matched because the order of precedence matches exact paths first.

The rule priority of cml.map is,

1. exactPath - a.b.c.d
2. subpath - b.c.d
3. nameMatch - d

Let's take a look at a bigger example,

**Example**
``` javascript

// intentionally made data object convoluted to demonstrate mapping
var data = {
    a: {
        b: {
            c: {
                d: "Some title text"
            }
        }
    },
    b: {
        c: {
            d: "some more text"
        },
        d: "click this"
    },
    d: "no! click this!",
    x: {
        d: "https://cdn.com/somepicture.jpg"
    }
};

var rules = {
    "b.c.d": "H3.innerHTML",
    "x.d": "IMG.src",
    "d": "INPUT.value"
};

cml.map(data, rules, function (self) {
    return {
        a_b_c_d: {
            style: "background: red"
        },
        b_c_d: {
            style: "background: orange"
        },
        x_d: {
            width: 200
        },
        b_d: {
            type: "button"
        },
        d: {
            type: "button"
        }
    };
});

```

**Maps to**

* data.a.b.c.d => "H3" => module.a_b_c_d
* data.b.c.d => "H3" => module.b_c_d
* data.b.d => "INPUT" => module.b_d
* data.d => "INPUT" => module.d
* data.x.d => "IMG" => module.x_d

``` html
<div>
    <h3 class="a_b_c_d" style="background: red">
        Some title text
    </h3>
    <h3 class="b_c_d" style="background: red">
        some more text
    </h3>
    <input class="b_d" type="button" value="click this">
    <input class="d" type="button" value "no! click this!">
    <img class="x_d" src="https://cdn.com/somepicture.jpg" width="200">
</div>
```
