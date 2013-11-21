# studify
Easily put your node server behind `stud` SSL terminator

## Installation

You need [`stud`](https://github.com/bumptech/stud) installed first. Then:

```sh
npm install studify
```

## Usage

The following starts an HTTP server on random port and `stud` "in front" of it
port 8433.

```js
var path = require('path');
var http = require('http');
var studify = require('studify');

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
```

## API

### `studify(server, options)`

  * `server` (`net.Server`) - server `stud` is supposed to forward traffic to
  * `options` (`Object`)
    * `options.port` (`number`) - required. Port to start `stud` on
    * `options.cert` (`string`) - required. Path to PEM file with the certificate
    * `options.stud` (`string`) - `stud` binary, default: `"stud"`
    * `options.ssl` (`boolean`) - whether to use SSLv3 or not, default: `true`
      if `server` is an instance of `http.Server`
    * `options.workers` (`number`) - number of `stud` workers, default: `1`

Returns an `EventEmitter`, which emits following events:

  * `restart(code, signal)` - `stud` crashed and had to be restarted
  * `error(err)` - `ChildProcess` emitted an `error` event
