# Project

Project is the representation of a CML project. The object contains all the configurations of your project.

## Project Structure

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
    "includeManifest": true,
    "includeServiceWorker": true,
    "themeColor": "#f3f3f3",
    "icons": [
      {
        "src": "/cdn/img/logo_192.png",
        "type": "image/png",
        "sizes": "192x192"
      },
      {
        "src": "/cdn/img/logo_512.png",
        "type": "image/png",
        "sizes": "512x512"
      }
    ],
    "background_color": "#3367D6",
    "display": "standalone",
    "cacheList": [
        "/cdn/data.txt"
    ],
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
