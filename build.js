const fs = require('fs-extra');
try {
    // Remove current build
    fs.removeSync('./dist/');
} catch (err) {
    console.log(err);
}
