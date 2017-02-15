'use strict';

var log4js      = require('log4js');
var path        = require('path');
var conflib     = require('configuration-lib');
var cluster     = require('cluster');
var mid         = require('./mid.js');

var config      = undefined;
var dir         = process.cwd() + '/logs'; // dir 在 init_log() 中被修改
var log_in_file = undefined;

var default_cate   = 'ALL';
var max_file_size  = 20 * 1024 * 1024;
var max_file_count = 10;


conflib.wait_init(init_log);
module.exports = log_pack(default_cate);


function init_log() {
  config = conflib.load().logger;

  if (config) {
    if (config.log_size)
      max_file_size = config.log_size;
    if (config.reserve_count)
      max_file_count = config.reserve_count;
    if (config.env)
      console.warn('The config `/env` is Deprecated!');
  }


  log4js.setGlobalLogLevel(config.logLevel);

  try {
    if (config.log_dir) {
      if (path.isAbsolute) {
        if (path.isAbsolute( config.log_dir )) {
          dir = config.log_dir;
        } else {
          dir = process.cwd() + '/' + config.log_dir;
        }
      } else {
        if (config.log_dir[0] == '/') {
          dir = config.log_dir;
        } else {
          dir = process.cwd() + '/' + config.log_dir;
        }
      }
    }
  } catch(err) {
    dir = process.cwd() + '/logs';
  }

  try {
    dir = path.normalize(dir);
    var stats = require('fs').statSync(dir);
    log_in_file = stats.isDirectory();
  } catch(e) {
    if (e.code == 'ENOENT' && config.create_dir) {
      try {
        conflib.mkdir(dir);
        log_in_file = true;
      } catch(e2) {
        console.log('logger-lib: 尝试创建目录失败');
      }
    }
  }

  if (!log_in_file) {
    console.log("logger-lib: 未找到目录", dir, ", 日志不写到文件.");
  } else {
    log4js.loadAppender('file');
  }
}


function log_pack(_c1) {
  var loggerInstance = createLogInstance(_c1);

  var ret = function(_c2) {
    return log_pack(_c2);
  };

  var bind_func = ['trace', 'debug', 'info', 'warn',
                   'error', 'fatal', 'setLevel'];

  bind_func.forEach(bind);

	ret.logname = loggerInstance.logname;
  ret.log = ret.info;

  ret.showConsole = function() {
    log4js.addAppender(log4js.appenders.console(), _c1);
  };

  ret.setDefault = function() {
    module.exports = ret;
    return ret;
  };

  ret.open_kfk = function() {
    var kfkapp = require('./kfk-app.js');
    log4js.addAppender(kfkapp.createKafukaAppender(_c1), _c1);
  };

  ret.set_kfk_lib = function(_kfk_lib) {
    var kfkapp = require('./kfk-app.js');
    kfkapp.set_kfk_lib(_kfk_lib);
  };

  ret.mid = mid;

  function bind(name) {
    ret[name] = function() {
      loggerInstance[name].apply(loggerInstance, arguments);
    };
  }

  return ret;
}


function createLogInstance(category) {
  var parentName = module.parent.parent.filename;
  var typename = category || path.basename(parentName);

  if (cluster.isWorker) {
    typename += '[' + process.pid + ']';
  }

  if (!log4js.hasLogger(typename)) {
    conflib.wait_init(function() {
      if (log_in_file) {
        var filename = null;

        if (category) {
          filename = path.join( dir, category + '.log' );
        } else {
          filename = path.join( dir,
                     path.basename(path.dirname(parentName)) + '^'
                   + path.basename(parentName) + ".log" );
        }

        log4js.addAppender(
          log4js.appenders.file(filename
              , null, max_file_size, max_file_count),
          typename);
      }
    });
  }

  //
  // getLogger() 返回的对象仍然会被 addAppender() 设置的属性改变
  //
  var loggerInstance = log4js.getLogger(typename);
	loggerInstance.logname = typename;
  return loggerInstance;
}
