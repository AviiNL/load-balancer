const dev = false;

const webby = require('../webby');
var redis = require('redis'),
    client = redis.createClient({host: '192.168.0.38'});

let port = 8081;
if (!dev) {
    const worker = require('../worker')();
    port         = worker.port;
}

webby(port, {
    controller_path: __dirname + '/controllers',
    template_path:   __dirname + '/theme',
    middleware_path: __dirname + '/middleware',
    static_path:     __dirname + '/static',
    cache:           false,
});

global.db = client;
