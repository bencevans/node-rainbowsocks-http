
// var http = require('rainbowsocks-http')(socksPort [, socksHost || '127.0.0.1']);
var http = require('./')(8080);

var req = http.get('http://www.bbc.co.uk', function(res) {
  console.log('statusCode: ', res.statusCode);
  console.log('headers: ', res.headers);
  res.on('data', function(data) {
    console.log(data);
  });
});

req.on('error', function(err) {
  console.log('oh no: ', err);
});