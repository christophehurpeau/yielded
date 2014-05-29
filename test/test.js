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
    return Y.promise(gen)
        .then(function(result) {
            assert.isArray(result);
            assert.deepEqual(result, [1, 2, 3]);
        });
});


function asyncDouble(num, cb) {
    setTimeout(cb.bind(null, null, num * 2), 20);
}
function asyncError(cb) {
    setTimeout(cb.bind(null, new Error('oops')), 20);
}

test('resume', function() {
    var gen = function* (resume) {
        var result = yield asyncDouble(10, resume);
        return result;
    };
    return Y.promise(gen)
        .then(function(result) {
            expect(result, 20);
        });
});


test('resume error', function() {
    var gen = function* (resume) {
        var result;
        yield asyncError(resume);
        return result;
    };
    return Y.promise(gen)
        .catch(function(error) {
            expect(error.message, 'oops');
        });
});

test('Y.parallel', function() {
    var p = Y.parallel();
    p.add(1);
    p.add(new Promise(function(resolve, reject) {
        resolve(2);
    }));
    asyncDouble(20, p.resume());

    p.promise
        .then(function(results) {
            assert.deepEqual(results, [1, 2, 4]);
        });

    p = Y.parallel();
    p.add(1);
    p.add(new Promise(function(resolve, reject) {
        resolve(2);
    }));

    p.promise
        .then(function(results) {
            assert.deepEqual(results, [1, 2]);
        });
});