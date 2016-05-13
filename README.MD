# 日志

> 这个项目不再包含 kfk-lib, 需要自行引入并通过  
> logger.set_kfk_lib(require('kfk-lib')) 来引入库


# install

`npm install logger-lib --save`


# Usage

### 引入库:

`var logger  = require('../index.js')`

> 默认日期输出到 ALL 中


### 打印消息:

```
logger.error('log error:', new Error('test error'));
logger.info('log info.');
logger.warn('log warn.');
logger.debug('debug');
logger.fatal('fatal');
logger.trace(new Error('trace'));
```

### 创建一个命名日志, 写入到单独的文件中:

`var newlogger = logger(LogName)`


### 同时输出到 kfk 的平台日志系统中:

```js
logger.set_kfk_lib(require('kfk-lib'))
logger.open_kfk()
```

> 必须设置 kfk 库才能启用 open_kfk()  
> 需要配置文件中有 kfk 的设置


### Http 服务, 远程查看日志

> 组件会自动定位日志目录, 必须首先访问列表服务, 才能打开日志内容

```js
// 平台主机:端口, 可选的参数, 如果没有配置, 则没有样式表
var zr = 'zr-i.com';
// 创建 express 中间件
var mid = logger.mid.log(zr);
// 访问 /log 路径则会返回日志列表
express.use('/log', mid);
```