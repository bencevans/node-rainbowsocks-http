
/**
 * Module Dependencies
 */

var url = require('url'),
    RainbowSocks = require('rainbowsocks'),
    IncomingResponse = require('./incoming_response'),
    EventEmitter = require('events').EventEmitter,
    util = require('util');

/**
 * Provides a similar NodeJS http interface making use of a SOCKS4a proxy
 * @param {Number} socksPort Port the SOCKS4a Proxy is listening
 * @param {String} socksHost Host the SOCKS4a Proxy is listening || '127.0.0.1'
 */
var RainbowHTTP = function(socksPort, socksHost) {

  var Request = function(options, callback) {
    var self = this;

    // options parsing and defaults
    if(typeof options == 'string') options = url.parse(options);
    options.method = (options.method || 'GET').toUpperCase();

    var socksClient = new RainbowSocks(socksPort, socksHost);
    socksClient.on('connect', function() {
      socksClient.connect(options.hostname, options.port || 80, function(err, socket) {
        if(err) return self.emit('error', err);
        socket.write(options.method + ' ' + options.path + ' HTTP/1.1\nHost: ' + options.host + '\n\n');
        var res = new IncomingResponse(socket);
        res.on('headers', function() {
          callback(res);
        });
      });
    });
  };
  util.inherits(Request, EventEmitter);

  var request = function(options, callback) {
    return new Request(options, callback);
  };

  return {request:request};
};

/**
 * Exports
 */

module.exports = RainbowHTTP;
module.exports.IncomingResponse = IncomingResponse;
