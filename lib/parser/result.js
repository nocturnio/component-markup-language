/*
** result.js
**
** Success or Failure objects
*/
var resultType = function (type) {
    var _match = function (result) {
        return result.type === type;
    };
    var _map = function (func) {
        return function (result) {
            if (_match(result)) {
                return _create(func(result.value));
            } else {
                return result;
            }
        };
    };
    var _bind = function (func) {
        return function (result) {
            if (_match(result)) {
                return func(result.value);
            } else {
                return result;
            }
        };
    };
    var _create = function (value) {
        return {
            value: value,
            type: type
        };
    };
    return {
        create: _create,
        map: _map,
        bind: _bind,
        match: _match
    };
};
module.exports.success = resultType("SUCCESS");
module.exports.failure = resultType("FAILURE");
