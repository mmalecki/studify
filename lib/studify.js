var http = require('http');
var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;

module.exports = function (server, options) {
  options = options || {};
  if (typeof options.port !== 'number' || typeof options.cert !== 'string') {
    throw new Error('`options.port` and `options.host` are required');
  }

  var ee = new EventEmitter();
  var log = options.log || function () {}
  var child;

  function onListening() {
    var args = [];
    var stud = options.stud || 'stud';
    var ssl = typeof options.ssl === 'boolean'
      ? options.ssl
      : server instanceof http.Server;
    var port = options.port;
    var workers = options.workers || 1;
    var host = options.host;

    ssl && args.push('--ssl');
    args.push('-n', workers.toString());
    args.push('--backend', '127.0.0.1,' + server.address().port);
    args.push('--frontend', (host || '') + ',' + port);
    options.writeIP && args.push('--write-ip');
    options.writeProxy && args.push('--write-proxy');
    options.proxyProxy && args.push('--proxy-proxy');
    args.push(options.cert);

    start(stud, args);
  }

  function start(stud, args) {
    child = spawn(stud, args);

    child.unref();

    child.once('error', function (err) {
      ee.emit('error', err);
    });

    child.stdout.on('data', function (chunk) {
      chunk.toString('utf8').split('\n').forEach(function (c) {
        c && log('info', c);
      });
    });

    child.stderr.on('data', function (chunk) {
      chunk.toString('utf8').split('\n').forEach(function (c) {
        c && log('warn', c);
      });
    });

    child.once('exit', function (code, signal) {
      log('warn', 'stud exited with ' + signal ? 'signal ' + signal : 'code ' + code);
      ee.emit('restart', code, signal);
      start();
    });
  }

  if (server.address() === null) {
    server.once('listening', onListening);
  }
};
