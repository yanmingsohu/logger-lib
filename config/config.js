var config = {

  logger : {
    // ALL, TRACE, DEBUG, INFO, WARN, ERROR, FATAL, MARK, OFF
    logLevel : 'ALL',

    // 相对于项目目录的日志文件目录, 也可使用绝对目录
    log_dir  : 'logs',

    // 如果目录不存在, 则创建(迭代)
    create_dir : true,

    // 达到 log_size 后文件分块
    log_size : 20 * 1024 * 1024, // 20MB

    // 文件分块后, 最多保留几个分块文件
    reserve_count : 10,

    // 写 kfk 日志时需要的参数
    kfk_log: {
      // 与命名日志名称相同
      kfk_test: {
        kfk_group : 'log-server-proxy',
        orgid     : 'app_log',
        log_name  : 'BUSINESS',
        typecd    : 'DS.SYS.17.08',
        // 日志函数参数索引对应的数据库字段
        columns   : [ 'uuid', 'mark', 'createdt' ]
      }
    }
  },


  kfk_server: {
    zookeeper_server  : '192.168.7.12:2181', //'192.168.7.12:2181',
    connect_delay     : 10 * 1000,
    conn_timeout      : 30 * 1000,

    consumer_option   : {
      autoCommit      : true,
      fromBeginning   : false,
      fetchMaxWaitMs  : 1000,
      fetchMaxBytes   : 1024*1024
    }
  }
};

module.exports = config;
