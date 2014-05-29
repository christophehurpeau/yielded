yielded
=======

Another generator runner

## Installation

```
npm install --save yielded
```

## How to use

```
var Y = require('yielded');
var fs = require('fs');

Y(function* (resume) {
    try {
        var fileContents = yield fs.readFile('./myFile.json', resume);
        console.log(JSON.parse(fileContents));
    } catch (err) {
        console.error(err);
    }
})();
```

### Parallel executions

#### With arrays

You can use arrays with values and promises:

```
Y(function* () {
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

#### With Y.parallel

With Y.parallel, you can use node style callbacks

```
Y(function* (resume) {
    var files = yield fs.readdir('test', resume);

    var p = Y.parallel();
    files.forEach(function(fileName) {
        fs.readFile('test/' + fileName, p.resume()); // resume here is a callback factory
    });

    var filesContent = yield p.promise;

    console.log(filesContent);
});
```

parallel also support values and promises :

```
var p = Y.parallel();
p.add(1);
p.add(new Promise(function(resolve, reject) {
    resolve(2);
}));

var results = yield p.promise;
console.log(results);
// [1, 2]
```

## Credits

This library is an attempt to understand generators and yields, the result of my research of other libraries and taking the parts I like from them. Libraries I took inspiration from are:

 - <https://github.com/mikach/yielding>
 - <https://github.com/visionmedia/co>
 - <https://github.com/jmar777/suspend>
 - <https://github.com/spion/genny>
