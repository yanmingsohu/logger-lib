var cluster = require('cluster');
var logger  = require('../index.js');
var numCPUs = require('os').cpus().length;


if (cluster.isMaster) {
	//numCPUs = 0;

	// setDefault() 把命名日志设置为默认
	logger = logger('Master').setDefault();
	logger.log('启动集群 ' + numCPUs);

  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    logger.log('worker ' + worker.process.pid + ' died');
  });

  require('./a.js');
} else {
	worker();
}


function worker() {
	// 默认总是在 ALL 中输出日志
	// 允许 require('./logger')()()('some')();

	// 默认为 'ALL'
	var log1 = logger;
	test(log1);

	// 创建基于当前模块的输出日志
	var log2 = log1();
	test(log2);

	// 创建命名日志
	var log3 = log2('other-file');
	test(log3);

	setTimeout(function() {
		process.exit(0);
	}, 1000);
}


function test(logger) {
	//logger.showConsole();
	logger.error('log error IS WORK !!!!!!!!:', new Error('IS WORK !!!!!!!!'));
	logger.info('log info IS WORK !!!!!!!!');
	logger.warn('log warn IS WORK !!!!!!!!');
	logger.debug('debug IS WORK !!!!!!!!');
	logger.fatal('fatal IS WORK !!!!!!!!');
	logger.trace(new Error('trace IS WORK !!!!!!!!'));
}