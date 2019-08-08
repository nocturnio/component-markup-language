# cml.map

**Example**
``` javascript
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
    "b.c.d": "H3",
    x: {
        d: "IMG"
    },
    d: "INPUT"
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
    }
});

```

**Maps to**
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

## Map Priority
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

Rule priority
1. exactPath - a.b.c.d
2. subpath - b.c.d
3. nameMatch - d

Name Mapping
1. exactPath - a_b_c_d
2. subpath - a_b_c_d
3. nameMatch - d
