yielded
=======

Another generator runner

yielded doesn't help you with callback generator, it uses promises. To convert a function with a callback to a promise, you can use [springbokjs-utils](https://www.npmjs.org/package/springbokjs-utils) [promiseCallback](http://christophehurpeau.github.io/springbokjs-utils/docs/module-utils.html#promiseCallback).

## Installation

```
npm install --save yielded
```

## How to use

```js
var Y = require('yielded');
var fs = require('springbokjs-utils/fs');

Y.run(function* () {
    try {
        var fileContents = yield fs.readFile('./myFile.json');
        console.log(JSON.parse(fileContents));
    } catch (err) {
        console.error(err);
    }
});
```

### Parallel executions

#### With arrays

You can use arrays with values and promises:

```js
Y.run(function* () {
    var result = yield [
        1,
        2,
        new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(3);
            });
        }),
        new Promise(function(resolve, reject) {
            resolve(4);
        }),
    ];
    console.log(result);
    // [1, 2, 3, 4]
});
```

### Iterator inside


```js
var Y = require('yielded');
var fs = require('springbokjs-utils/fs');

var readFileContents = function* () {
    try {
        var fileContents = yield fs.readFile('./myFile.json');
        console.log(JSON.parse(fileContents));
    } catch (err) {
        console.error(err);
    }
};

Y.run(function* () {
    var result = yield readFileContents();
    console.log(result);
});
```

## Credits

This library is an attempt to understand generators and yields, the result of my research of other libraries and taking the parts I like from them. Libraries I took inspiration from are:

 - <https://github.com/mikach/yielding>
 - <https://github.com/visionmedia/co>
 - <https://github.com/jmar777/suspend>
 - <https://github.com/spion/genny>
