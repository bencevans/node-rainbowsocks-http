
var http = require('http');
var getAgent = require('socks-proxy-agent');

module.exports = function getProtocol (socksPort, socksHost) {
  var proto = {};

  options = 'socks://' + (socksHost || 'localhost') + ':' + (socksPort || 8080);

  Object.keys(http).forEach(function (k) {
    proto[k] = http[k];
  });

  proto.Agent = getAgent;
  proto.globalAgent = new proto.Agent(options);

  return proto;
};

