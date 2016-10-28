var conflib = require('configuration-lib');
var url     = require('url');
var pathlib = require('path');
var fs      = require('fs');


module.exports = {
  log : create_mid
};


//
// 日志查看中间件 for dish/mixer/express/native
// bootstrap_url -- bootstrap css 文件所在的完整路径
//
function create_mid(bootstrap_url) {

  var dir = conflib.load().logger.log_dir;
  var filecache = {};

  if (!pathlib.isAbsolute( dir )) {
    dir = process.cwd() + '/' + dir;
  }

  return function log(res, rep, next) {
    var html    = [];
    var _       = function(x) { html.push(x); return _; };
    var urldat  = url.parse(res.url, true);
    var base    = res.base || '';
    var path    = urldat.pathname.substr(base.length) || '/';

    switch (path) {
      case '/':
      case '/list':
        list();
        break;

      case '/detail':
        detail();
        break;

      default:
        _end();
    }

    function _end() {
      if (next) {
        next();
      } else {
        rep.end();
      }
    }

    function list() {
      fs.readdir(dir, function(err, files) {
        filecache = files;
        tag('h1', '日志列表');
        _('<div class="well"><ul>');

        if (err) {
          _err(err);
        } else {
          for (var i=0; i<files.length; ++i) {
            _('<li>');
            tag('a', files[i], { href: base + '/detail?x=' + i});
            _('</li>');
          }
        }

        _('</ul></div>');
        over();
      });
    }


    function detail() {
      var a_attr = { href: base + '/list' };
      var i = urldat.query.x;

      ret_button();
      tag('a', null, {name:'top'});
      tag('h3', '日志', { style: 'margin-top: 80px' });

      if (filecache[i]) {
        tag('small', filecache[i]);

        fs.readFile( pathlib.join(dir, filecache[i]), {encoding : 'utf8'}, 
          function(err, data) {
            if (err) {
              _err(err);
            } else {
              tag('div', color(data), { 'class': 'well logger_cont' });
            }
            tag('a', null, {name:'bottom'});
            over();
          }
        );
      } else {
        _err('文件无效');
        over();
      }

      function ret_button() {
        _('<div class="collapse navbar-collapse navbar-inverse" \
          style="position:fixed; width:100%; top:0; left:0; display:block; \
          opacity: 0.7; ">');
        _('<ul class="nav navbar-nav pull-right">');
        _('<li class="active">'); tag('a', '返回到列表', a_attr); _('</li>');
        _('<li>'); tag('a', '上到顶', { href: '#top' }); _('</li>');
        _('<li>'); tag('a', '下到底', { href: '#bottom' }); _('</li>');
        _('</ul>');
        _('</div>');
      }
    }


    function _err(err) {
      var msg = err.message || err;
      tag('div', msg, { 'class': 'alert alert-danger fade in'});
    }


    function over() {
      rep.write('<html>');
      rep.write('<head>');

      if (bootstrap_url) {
        rep.write('<link rel="stylesheet" type="text/css" \
            media="screen" href="' + bootstrap_url + '">');
      } else {
        rep.write('                   \
          <style type="text/css">     \
            .navbar-inverse {         \
              text-align: right;      \
            }                         \
            .navbar-inverse li {      \
              list-style-type: none;  \
            }                         \
            .logger_cont * {          \
              font-size: 12px;        \
            }                         \
          </style>');
      }

      rep.write('<meta charset="utf-8">');
      rep.write('</head><body>');
      rep.write(html.join(''));
      rep.write('</body></html>');
      rep.end();
    }


    function tag(tname, txt, attrs) {
      _('<')(tname);
      if (attrs) {
        for (var n in attrs) {
          _(' ')(n)("='")(attrs[n])("'");
        }
      }
      _('>');
      if (typeof txt == 'function') {
        _(txt());
      } else {
        _(txt);
      }
      _('</')(tname)('>');
    }
  }


  //
  // 对日志进行颜色渲染
  //
  function color(txt) {
    var ret = [];
    var t = 1, c, co;
    var newline = '<div style="color: #333333">';

    ret.push(newline);

    for (var i=0, e=txt.length; i<e; ++i) {
      c = txt[i];

      if (c == '[') {
        switch (t) {
          case 1:
            co = '#37a525';
            break;
          case 2:
            co = '#256aa5';
            break;
          case 3:
            co = 'red';
            break;
        }

        ret.push('<b style="color: ' + co + ';">');
      }
      else if (c == "\n") {
        ret.push('</div>');
        ret.push(newline);
        t = 1;
        continue;
      }

      ret.push(c);

      if (c == ']') {
        ret.push('</b>');
        ++t;
      }
    }

    return ret.join('');
  }

}
