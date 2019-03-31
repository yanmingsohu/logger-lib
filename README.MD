# 日志

这个项目不包含 kfk-lib, 需要自行安装并通过
logger.set_kfk_lib(require('kfk-lib')) 来加载库


# install

`npm install logger-lib --save`



# Usage

`var logger  = require('logger-lib')`


### 生成日志, 默认消息输出到 ALL 中

```
logger.error('log error:', new Error('test error'));
logger.info('log info.');
logger.warn('log warn.');
logger.debug('debug');
logger.fatal('fatal');
logger.trace(new Error('trace'));
logger.logname;
```

### 创建一个命名日志, 写入到单独的文件中:

`var newlogger = logger(LogName)`

命名日志允许迭代调用, 这与使用 logger 创建的命名日志完全一样:

`var newlogger2 = newlogger(LogName)`


### 同时输出到 kfk(kafka) 的平台日志系统中:

```js
logger.set_kfk_lib(require('kfk-lib'))
logger.open_kfk()
```

一旦 kfk 被打开, logger 会检查配置文件中 kfk_log 里所有的键名,  
这些键名对应的命名日志产生的新日志都会被发送到 kfk.


### Http 服务, 远程查看日志

组件会自动定位日志目录, 必须首先访问列表服务, 才能打开日志内容,  
bootstrap 用来美化结果, 该参数可以 null,   
访问 http://localhost:88 可以打开日志列表.  


#### 使用 http 组件启用服务

```js
var bootstrap = 'http://getbootstrap.com/dist/css/bootstrap.min.css';
var mid = logger.mid.log(bootstrap);
var http = require('http');
var server = http.createServer(mid);
server.listen(88);
```

#### 使用 mixer-lib 组件启用服务

```js
var mixer = require('mixer-lib');
mixer.create_http_mix_server({ 
    whenLoad : whenLoad, 
    port     : port
});
function whenLoad(app_pool) {
  var p = app_pool.addApp(mid);
  p.add('/');
}
```