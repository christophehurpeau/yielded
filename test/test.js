/* global test */
var assert = require('proclaim');
var expect = assert.strictEqual;
var y = require('../index');

test('y function', function() {
    var gen = function* () {
        for (var i = 0; ++i < 100000;) {
            yield i;
        }
        return i;
    };

    y(gen());

    var promise = y.promise(gen());
    assert.isInstanceOf(promise, Promise);

    return promise
        .then(function(result) {
            expect(result, 100000);
        });
});

test('y function also handles generator without yield', function() {
    var fn = function* () {
        return 10000;
    };

    y(fn());

    var promise = y.promise(fn());
    assert.isInstanceOf(promise, Promise);

    return promise
        .then(function(result) {
            expect(result, 10000);
        });
});
test('y function also handles normal functions', function() {
    var fn = function () {
        return 10000;
    };

    y(fn());

    var promise = y.promise(fn());
    assert.isInstanceOf(promise, Promise);

    return promise
        .then(function(result) {
            expect(result, 10000);
        });
});

test('Error', function() {
    var gen = function* () {
        yield 1;
        throw new Error('This is a test error');
    };
    return y.promise(gen())
        .catch(function(err) {
            expect(err.message, 'This is a test error');
        });
});

test('Promises', function() {
    var gen = function* () {
        var result = yield new Promise(function(resolve, reject) {
            resolve(2);
        });
        return result;
    };
    return y.promise(gen())
        .then(function(result) {
            expect(result, 2);
        });
});


test('Error in promise', function() {
    var gen = function* () {
        var result = yield new Promise(function(resolve, reject) {
            reject(new Error('This is a test error'));
        });
        return result;
    };
    return y.promise(gen())
        .catch(function(err) {
            expect(err.message, 'This is a test error');
        });
});


test('Parallel execution with array', function() {
    var gen = function* () {
        var result = yield [
            new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve(1);
                }, 200);
            }),
            new Promise(function(resolve, reject) {
                resolve(2);
            }),
            3
        ];
        return result;
    };
    return y.promise(gen())
        .then(function(result) {
            assert.isArray(result);
            assert.deepEqual(result, [1, 2, 3]);
        });
});


var asyncDouble = function *(num) {
    return yield Promise.resolve(num * 2);
};
var asyncError = function *() {
    return yield Promise.reject(new Error('oops'));
};

test('yield iterator', function() {
    var gen = function* () {
        var result = yield asyncDouble(10);
        return result;
    };
    return y.promise(gen())
        .then(function(result) {
            expect(result, 20);
        });
});

test('yield iterator with error', function() {
    var gen = function* () {
        var result;
        yield asyncError();
        return result;
    };
    return y.promise(gen())
        .catch(function(error) {
            expect(error.message, 'oops');
        });
});
