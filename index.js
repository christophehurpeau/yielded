var isIterator = function(value) {
    return typeof value === 'object' && typeof value.next === 'function';
};

/**
 * Execute the generator function or the normal function, but without caring about the result.
 * @param {Function} fn
 */
var y = module.exports = exports = function y(value) {
    if (isIterator(value)) {
        y.resolve(value);
    }
};

y.run = function(fn) {
    return y(fn());
};

y.resolve = function(value) {
    var y = new Yieldable();
    y.resolve(value);
};

y.promise = function(value) {
    if (!isIterator(value)) {
        return Promise.resolve(value);
    }
    return y.promiseResolve(value);
};

y.promiseResolve = function(value) {
    return new Promise(function(resolve, reject) {
        try {
            var y = new Yieldable();
            y.done = resolve;
            y.throwCallback = reject;
            y.resolve(value);
        } catch(err) {
            reject(err);
        }
    });
};

y.wrap = function(fn) {
    return function() {
        return module.exports.promise(fn.call(this, arguments));
    };
};


function Yieldable() {
    this.nextBinded = this.next.bind(this);
    this.throwBinded = this.throw.bind(this);
}

Yieldable.prototype.resolve = function(generator) {
    this.generator = generator;
    this.next();
};

Yieldable.prototype.next = function(value) {
    var next;
    try {
        next = this.generator.next(value);
    } catch (err) {
        if (this.throwCallback) {
            this.throwCallback(err);
        } else {
            throw err;
        }
        return;
    }
    value = next.value;

    if (next.done) {
        return this.done(value);
    }

    if (value === undefined) {
        return;
    }
    if (value instanceof Promise) {
        this.handlePromise(value, this.nextBinded);
        return;
    }
    if (isIterator(value)) {
        this.handlePromise(y.promiseResolve(value), this.nextBinded);
        return;
    }
    if (value instanceof Array) {
        this.handleParallel(value, this.nextBinded);
        return;
    }
    //return value !== undefined ? this.next(value) : value;
    setImmediate(this.next.bind(this, value));
};

Yieldable.prototype.done = function(value) {
    return value;
};

Yieldable.prototype.handleParallel = function(array, then) {
    var results = new Array(array.length);
    var pending = 0;

    var doneItem = function() {
        if (--pending === 0) {
            then(results);
        }
    };
    array.forEach(function(item, index) {
        if (item instanceof Promise) {
            pending++;
            this.handlePromise(item, function(result) {
                results[index] = result;
                doneItem();
            });
        } else if (isIterator(item)) {
            pending++;
            this.handlePromise(y.promiseResolve(item), function(result) {
                results[index] = result;
                doneItem();
            });
        } else {
            results[index] = item;
        }
    }.bind(this));
};

Yieldable.prototype.handlePromise = function(promise, handler) {
    promise
        .then(handler)
        .catch(this.throwBinded);
};

Yieldable.prototype.throw = function(err) {
    try {
        this.generator.throw(err);
    } catch (e) {
        if (this.throwCallback) {
            this.throwCallback(e);
        } else {
            throw e;
        }
    }
};

