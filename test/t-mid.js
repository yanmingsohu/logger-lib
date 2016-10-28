var logger = require('../index.js');

var mid = logger.mid.log('http://getbootstrap.com/dist/css/bootstrap.min.css');
var port = 88;


forMixer();
console.log('Log server on', port);



function forNative() {
  var http = require('http');
  var server = http.createServer(mid);
  server.listen(port);
}


function forMixer() {
  var mixer = require('mixer-lib');
  mixer.create_http_mix_server({ 
      whenLoad : whenLoad, 
      port     : port
  });

  function whenLoad(app_pool) {
    var p = app_pool.addApp(mid);
    p.add('/');
  }
}
