var logger  = require('../index.js')('kfk_test');


logger.set_kfk_lib(require('kfk-lib'));
logger.open_kfk();

var a = 1;

setInterval(function() {
  logger.log(a++, a++, a++);
}, 10);