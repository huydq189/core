const fs = require('fs-extra');

try {
    // create module
    fs.removeSync('./module/');
    fs.copySync('./dist/', './module');
    fs.copySync('./package.json', './module/package.json');
} catch (err) {
    console.log(err);
}
