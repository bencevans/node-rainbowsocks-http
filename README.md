# rainbowsocks-http

**DEPRECIATED: There's a better method to how this module works. Instead use a http Agent provided in [TooTallNate/node-socks-proxy-agent](https://github.com/TooTallNate/node-socks-proxy-agent) which also makes use of [bencevans/node-rainbowsocks](https://github.com/bencevans/node-rainbowsocks).**

HTTP interface for tunneling though a SOCKS4a proxy

## Install

`npm install rainbowsocks-http`

## API

`var http = require('rainbowsocks-http')(socksPort [, socksHost || '127.0.0.1']);`

`http.request` is the only method available currently with very basic options support.

## Example

```javascript
// var http = require('rainbowsocks-http')(socksPort [, socksHost || '127.0.0.1']);
var http = require('rainbowsocks-http')(8080);

var req = http.request('http://github.com', function(res) {
  console.log('statusCode: ', res.statusCode);
  console.log('headers: ', res.headers);
  res.on('data', function(data) {
    console.log(data);
  });
});

req.on('error', function(err) {
  console.log('oh no: ', err);
});
```

## Licence

MIT
