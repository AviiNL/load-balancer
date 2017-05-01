const webby = require('webby.js');
const worker = require('../worker')();

webby(worker.port, {
    controller_path: __dirname + '/controllers',
    template_path: __dirname + '/theme',
});

