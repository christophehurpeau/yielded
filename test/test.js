var assert = require('proclaim');
var expect = assert.strictEqual;
var Y = require('../index');

test('Y function', function() {
    var gen = function* () {
        for (var i = 0; ++i < 100000;) {
            yield i;
        }
        return i;
    };

    assert.isFunction(Y(gen));
    var promise = Y.promise(gen);
    assert.isInstanceOf(promise, Promise);

    return promise
        .then(function(result) {
            expect(result, 100000);
        });
});

test('Error', function() {
    var gen = function* () {
        yield 1;
        throw new Error('This is a test error');
    };
    return Y.promise(gen)
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
    return Y.promise(gen)
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
    return Y.promise(gen)
        .catch(function(err) {
            expect(err.message, 'This is a test error');
        });
});


test('Parallel execution', function() {
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
    return Y.promise(gen)
        .then(function(result) {
            assert.isArray(result);
            assert.deepEqual(result, [1, 2, 3]);
        });
});
/**/