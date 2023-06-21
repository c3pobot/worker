'use strict'
process.on('unhandledRejection', (error) => {
  console.log(error)
});
const fs = require('fs')
global.baseDir = __dirname;
require.extensions['.css'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};
require('./src')
