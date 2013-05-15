
/**
 * Module Dependencies
 */

var util = require('util'),
    EventEmitter = require('events').EventEmitter;

/**
 * Parse a HTTP(1.1) Status-Line
 * @param  {String} statusString e.g 'HTTP/1.1 301 Moved Permanently'
 * @return {Object}              containing {String} httpVersion, {Number} statusCode & {String} statusPhrase
 */
function parseStatusLine (statusString) {
  var statusMatch = statusString.match(/^HTTP\/([0-9|\.]+) ([0-9]+) (.+)\r?$/);
  if(!statusMatch) throw new Error('Invalid HTTP(1.1) Status-Line');
  return {
    httpVersion: statusMatch[1],
    statusCode: parseInt(statusMatch[2], 10),
    statusPhrase: statusMatch[3]
  };
}

/**
 * Emits 'status', 'headers' then body 'data' events providing strings
 * @param  {Stream} socket e.g net.connect() after a valid HTTP request
 * @return {EventEmitter}
 */
var IncomingResponseSplitter = function(socket) {
  var self = this;

  var buffer = '';

  var statusLineFound = false;
  var headersFound = false;

  socket.on('data', function(data) {

    buffer += data.toString();

    if(!statusLineFound) {
      var endOfFirstLine = buffer.indexOf('\r\n');
      if(endOfFirstLine == -1) // very unlikely
        return false; // wait till next time
      statusLineFound = true;
      var statusLine = buffer.substring(0, endOfFirstLine);
      buffer = buffer.substring(endOfFirstLine);
      self.emit('status', statusLine);
    }

    if(statusLineFound && !headersFound) {
      var endOfHeaders = buffer.indexOf('\r\n\r\n');
      if(endOfHeaders == -1)
        return false;
      headersFound = true;
      var headers = buffer.substring(2, endOfHeaders); // 2 to remove /r/n from previous
      buffer = buffer.substring(endOfHeaders);
      self.emit('headers', headers);
    }

    if(statusLineFound && headersFound) {
      var bodyData = buffer;
      buffer = '';
      self.emit('data', bodyData);
    }

  });

};

util.inherits(IncomingResponseSplitter, EventEmitter);


/**
 * Incoming Response Message Parser
 * @param  {Stream} socket e.g an instance of net.connect() after a HTTP request sent
 * @return {EventEmitter}
 */
var IncomingResponse = function(socket) {
  var self = this;

  this.socket = socket;

  this.httpVersion = null;
  this.statusCode = null;
  this.statusPhrase = null;

  this.headers = {};

  var buffer = '';
  var endOfStatusLinePos = null;
  var endOfHeadersPos = null;

  this.splitter = new IncomingResponseSplitter(socket);

  this.splitter.on('status', function(statusLine) {
    var status;
    try {
      status = parseStatusLine(statusLine);
    } catch (e) {
      self.emit('error', e);
    }
    self.httpVersion = status.httpVersion;
    self.statusCode = status.statusCode;
    self.statusPhrase = status.statusPhrase;
    self.emit('status', status);
  });

  this.splitter.on('headers', function(headersString) {
    var headers = headersString.split('\r\n');
    for(var i in headers) {
      self.headers[headers[i].split(': ')[0].toLowerCase()] = headers[i].substring(headers[i].split(': ')[0].length + 2);
    }
    self.emit('headers', self.headers);
  });

  this.splitter.on('data', function(data) {
    self.emit('data', data);
  });

};
util.inherits(IncomingResponse, EventEmitter);

/**
 * Exports
 */

module.exports = IncomingResponse;
module.exports.Splitter = IncomingResponseSplitter;
module.exports.parseStatusLine = parseStatusLine;