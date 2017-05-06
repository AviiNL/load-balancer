const dev = false;

const webby = require('../webby');
const mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.0.38/database');
mongoose.Promise = global.Promise;



let port = 8081;
if (!dev) {
    const worker = require('../worker')();
    port         = worker.port;
}

webby(port, {
    controller_path: __dirname + '/controller',
    template_path:   __dirname + '/theme',
    middleware_path: __dirname + '/middleware',
    static_path:     __dirname + '/static',
    cache:           false,
});

global.db = mongoose;
