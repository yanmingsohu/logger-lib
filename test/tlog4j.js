var log4js = require('log4js');
var a = log4js.getLogger('a');

a.info('not file');

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file(__dirname + '/tlog4j.log'), 'a');

a.info('in file');