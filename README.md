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

Y(function* f() {
    try {
        var fileContents = yield fs.readFile('./myFile.json', f.resume);
        console.log(JSON.parse(fileContents));
    } catch (err) {
        console.error(err);
    }
})();
```

## Credits

This library is the result of my research of other libraries and taking the parts I like from them. Libraries I took inspiration from are:

 - <https://github.com/mikach/yielding>
 - <https://github.com/visionmedia/co>
 - <https://github.com/jmar777/suspend>
 - <https://github.com/spion/genny>
