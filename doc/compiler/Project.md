# Project

Project is the representation of a CML project. It is used to build a compiled application. The project's properties represent the pieces that will go into building.

**Example**

``` json
{
    "name": "my-project",
    "displayName": "My Project",
    "start": "main",
    "path": "/myproject",
    "runtimePath": "https://nocturn.io/runtime/cml-runtime.js",
    "loadingOn": true,
    "loadingImg": "/img/loading.gif",
    "embededScript": false,
    "files": [{
        "name": "main",
        "value": "Module main {\n    model: {}\n ..."
    }, {
        "name": "module1",
        "value": "Card counterCard {\n    size: 6\n ..."
    }],
    "plugins": {
        "my style": {
            "name": "my style",
            "type": "css",
            "order": 0,
            "url": "/css/mystyle.css"
        },
        "firebase": {
            "name": "firebase",
            "type": "javascript",
            "order": 1,
            "url": "https://www.gstatic.com/firebasejs/4.10.1/firebase.js"
        }
    }
}
```
