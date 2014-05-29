module.exports = function Y(fn) {
    var y = new Yieldable();
    fn.resume = y.resume.bind(y);
    return y.resolve(fn());
};

module.exports.promise = function(fn) {
    return new Promise(function(resolve, reject) {
        try {
            var y = new Yieldable();
            y.done = resolve;
            y.throwCallback = reject;
            fn.resume = y.resume.bind(y);
            y.resolve(fn())();
        } catch(err) {
            reject(err);
        }
    });
};

function Yieldable() {
    this.nextBinded = this.next.bind(this);
    this.throwBinded = this.throw.bind(this);
};

Yieldable.prototype.resolve = function(generator) {
    this.generator = generator;
    return this.nextBinded;
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
    //console.log(next.done, value, next.value);
    value = next.value;

    if (next.done) {
        return this.done(value);
    }

    if (value instanceof Promise) {
        this.handlePromise(value, this.nextBinded)
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

Yieldable.prototype.resume = function(err, value) {
    if (err) {
        return this.generator.throw(err);
    }
    this.next(value);
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