var lib = require('../index.js');
var express = require('express');


var post = 80;
var app = express();

app.use('/log', lib.mid.log('zr-i.com'));

app.listen(post);

console.log('Log server on', post);