const dev = false;

const webby = require('webby.js');

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
