var makePromise = function () {
    return {
        _success: function() {

        },
        _error: function(e) {

        },
        then: function(next) {
            this._success = next;
            return this;
        },
        catch: function(next) {
            this._error = next;
            return this;
        }
    };
};
var httpReq = function (url, type, body) {
    var promise = makePromise();
    var success = function (res) { return next(res); };
    var request = makeRequest(url, type, function (res) {
        promise._success(res);
    }, function (res) {
        promise._error(res);
    });
    if (body) {
        request.send(JSON.stringify(body));
    } else {
        request.send();
    }
    return promise;
};
var makeRequest = function (url, type, success, fail) {
    var req = new XMLHttpRequest();
    req.open(type, url, true);
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status === 200) {
                success(req.responseText);
            } else {
                fail({
                    statusCode: req.status,
                    data: req.responseText
                });
            }
        }
    };
    if (type === "POST") {
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    }
    return req;
};

module.exports = {
    get: function (url, body) {
        return httpReq(url, "GET", body);
    },
    post: function (url, body) {
        return httpReq(url, "POST", body);
    }
};
