var config = require('configuration-lib');
var kfk    = null;


module.exports = {
  createKafukaAppender : createKafukaAppender,
  set_kfk_lib : set_kfk_lib,
};


function set_kfk_lib(_lib) {
  if (!_lib) throw new Error('parm not null');
  kfk = _lib;
}


function createKafukaAppender(category) {
  if (!kfk) {
    throw new Error('must call set_kfk_lib() set lib first');
  }

  var kfk_log_conf = config.load().logger.kfk_log;
  var conf = kfk_log_conf[category];

  if (!conf) {
    throw new Error("配置文件中没有命名日志 " 
        + category + " 对应的kfk配置, 不能写kfk日志");
  }

  var client    = kfk( { consumer_option: {groupId: conf.kfk_group} } );
  var orgid     = conf.orgid;
  var log_name  = conf.log_name;
  var typecd    = conf.typecd;
  var columns   = conf.columns;

  
  return function(loggingEvent) {
    var _log = { _typecd_ : typecd };

    for (var i=0; i<columns.length; ++i) {
      _log[ columns[i] ] = loggingEvent.data[i];
    }

    var data = {
      log_name  : log_name,
      log_level : loggingEvent.level.levelStr,
      log       : [ _log ]
    };

    client.send(orgid, JSON.stringify(data));
  };
}


/*

数据结构

--------------------------------------------------------------------------------
loggingEvent :

loggingEvent { startTime: Fri Apr 10 2015 10:20:44 GMT+0800 (中国标准时间),
categoryName: 'kfk',
data: [ 'hello', 'kfk', [ 1, 2, 3 ] ],
level: { level: 20000, levelStr: 'INFO' },
logger: { category: 'kfk', _events: { log: [Object] } } }

--------------------------------------------------------------------------------
kfk log :
{
  "log_time":"2015-02-13T08:18:53.472+0800",
  "log_level":"INFO",
  "log_name":"BUSINESS",
  "log_error_type":"NONE",
  "serverid":"temporary_server_id_000000000016",
  "log":[
    {"db_config":{
      "scheme":"app_log","name":"connuser",
      "url":"jdbc:mysql://192.168.7.11:33066/a297dfacd7a84eab9656675f61750078",
      "pass":"dalianzhirong321_A"
      },
      "typecd":"DS.SYS.17.06",
      "orgid":"app_log",
      "db_table":"sys_pl_log_request",
      "msg_type":"JSON",
      "columns":[
        "logid","log_time","log_level","log_error_type","requestid","serverid",
        "log","orgid","pid","sysid","user_key",
        "remote_ip","appid","moduleid","apiid","elapsed","user_referer",
        "user_agent","createdt"
        ],
      "strict":false,"sub_attr":"log"
    }
  ],
  "requestid":"",
  "log_topic":"log_srv_init",
  "log_dataset":""
} 

*/