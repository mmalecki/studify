var path = require('path');
var http = require('http');
var studify = require('../');

var server = http.createServer(function (req, res) {
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('Hello, stud!\n');
});

studify(server, {
  cert: path.join(__dirname, 'server.pem'),
  port: 8433,
  log: function () { console.log.apply(console, arguments); }
});
server.listen();
