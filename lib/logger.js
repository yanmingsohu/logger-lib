'use strict';

var log4js      = require('log4js');
var path        = require('path');
var conflib     = require('configuration-lib');
var cluster     = require('cluster');
var mid         = require('./mid.js');

var config      = conflib.load().logger;
var dir         = process.cwd() + '/logs';
var log_in_file = undefined;

var default_cate   = 'ALL';
var max_file_size  = config.log_size || 20 * 1024 * 1024;
var max_file_count = config.reserve_count || 99;


init_log();
module.exports = log_pack(default_cate);


function init_log() {
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
  } catch(e) {}

  if (!log_in_file) {
    console.log("logger-lib: 未找到目录", dir, ", 日志不写到文件.");
  } else {
    log4js.loadAppender('file');
  }

  if (config.env == 'development') {
    //log4js.addAppender(log4js.appenders.console());
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

    if (log_in_file) {
      var filename = null;

      if (category) {
        filename = path.join( dir, category + '.log' );
      } else {
        filename = path.join( dir,
                   path.basename(path.dirname(parentName)) + '^' 
                 + path.basename(parentName) + ".log" );
      }

      log4js.addAppender(log4js.appenders.file(filename
        , null, max_file_size, max_file_count), typename);

    } else {
      // 默认已经有了
      // log4js.addAppender(log4js.appenders.console(), typename);
    }
  }

  var loggerInstance = log4js.getLogger(typename);
  return loggerInstance;
}
