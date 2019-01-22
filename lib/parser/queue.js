/*
** queue.js
**
** Simple FIFO queue
**
*/
var queue = function (array) {
    var _queue = [];
    var _cursor = 0;
    var _isEmpty = function () {
        return typeof (_queue[_cursor]) === "undefined";
    };
    var _match = function (func) {
        return func(_getFront());
    };
    var _getFront = function () {
        return _queue[_cursor];
    };
    var _getSecond = function () {
        return _queue[_cursor + 1];
    };
    var _dequeue = function () {
        _cursor++;
    };
    var _enqueue = function (item) {
        _queue.push(item);
    };
    var _toArray = function () {
        var rtn = [];
        while (!_isEmpty()) {
            rtn.push(_getFront());
            _dequeue();
        }
        return rtn;
    };
    array.forEach(function (el) { _enqueue(el); });
    return {
        isEmpty: _isEmpty,
        match: _match,
        getFront: _getFront,
        getSecond: _getSecond,
        dequeue: _dequeue,
        enqueue: _enqueue,
        toArray: _toArray
    };
};
module.exports.queue = queue;
