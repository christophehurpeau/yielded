module.exports = function() {
    return new Parallel();
};

function Parallel() {
    this.pending = 0;
    this.nextIndex = 0;
    this.results = [];
    this.promise = new Promise(function(resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
    }.bind(this));
}

Parallel.prototype.add = function(value) {
    if (value instanceof Promise) {
        var index = this.nextIndex++;
        value
            .then(function(result) {
                this.results[index] = result;
                if (--this.pending === 0) {
                    this.resolve(this.results);
                }
            }.bind(this))
            .catch(this.reject);
    } else {
        this.results[this.nextIndex++] = value;
    }
};

Parallel.prototype.resume = function() {
    var index = this.nextIndex++;
    this.pending++;
    return function(err, result) {
        if (err) {
            return this.reject(err);
        }
        this.results[index] = result;
        if (--this.pending === 0) {
            this.resolve(this.results);
        }
    }.bind(this);
};