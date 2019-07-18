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
    var _getPrior = function () {
        return _queue[_cursor - 1];
    };
    var _getFront = function () {
        return _queue[_cursor];
    };
    var _getSecond = function () {
        return _queue[_cursor + 1];
    };
    var _getRange = function (before, after) {
        var startIdx = _cursor - before;
        var endIdx = _cursor + after;
        if (endIdx >= _queue.length) endIdx = _queue.length - 1;
        if (startIdx < 0) startIdx = 0;
        var rtn = _queue.slice(startIdx, endIdx);
        return rtn;
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
        getPrior: _getPrior,
        getFront: _getFront,
        getSecond: _getSecond,
        dequeue: _dequeue,
        enqueue: _enqueue,
        toArray: _toArray,
        getRange: _getRange,
        _array: _queue
    };
};
module.exports.queue = queue;
