const dgram     = require('dgram');
const server    = dgram.createSocket({type: "udp4", reuseAddr: true});
const httpProxy = require('http-proxy');

const PORT       = 6589;
const MCAST_ADDR = "224.0.1.142";

let workers = {};

server.bind({address: MCAST_ADDR, port: PORT, exclusive: false}, function () {
    console.log('Listening on ' + MCAST_ADDR + ':' + PORT);
    server.setBroadcast(true);
    server.setMulticastTTL(128);
    server.addMembership(MCAST_ADDR);
});

server.on('message', function (message, rinfo) {
    message = message.toString('ascii');

    let tag    = rinfo.address + ':' + rinfo.port;
    let header = message.substr(0, message.indexOf(' '));
    let data   = message.substr(message.indexOf(' ') + 1);

    //console.log(message, rinfo);
    switch (header) {
        case 'PONG':
            if (workers.hasOwnProperty(tag)) {
                workers[tag].status = 1;
            } else {
                console.log(`Worker ${tag} registered`);
                workers[tag] = {
                    status: 1,
                    host:   rinfo.address,
                    port:   data,
                    served: Date.now(),
                    rinfo: rinfo,
                };
            }
            dgram.createSocket({type: "udp4"}).send(new Buffer('ACK'), 0, 3, rinfo.port, rinfo.address);
            break;
        case 'BYE':
            for (let i in workers) {
                if (!workers.hasOwnProperty(i)) {
                    continue;
                }

                if (workers[i].host === rinfo.address && workers[i].port === data) {
                    console.log(`Worker ${tag} removed`);
                    delete workers[i];
                }
            }
            break;
        default:
            console.log(message, rinfo);
            break;
    }
});

const ping = () => {
    for (let worker in workers) {
        if (!workers.hasOwnProperty(worker)) {
            continue;
        }

        let status = workers[worker];

        if (status.status === 0) {
            console.log(`Worker ${status.rinfo.address}:${status.rinfo.port} removed`);
            delete workers[worker];
            continue;
        }

        let data = "PING";

        workers[worker].status = 0;

        dgram.createSocket({type: "udp4"}).send(new Buffer(data), 0, data.length, worker.split(':')[1], worker.split(':')[0]);
    }
    setTimeout(ping, 5000);
};

ping();

const http  = require('http');
const proxy = httpProxy.createProxyServer({});

const logic = (req, res) => {
    // find a worker
    if (req.url === '/favicon.ico') {
        return res.end();
    }

    let worker;
    for (let i in workers) {
        if (!workers.hasOwnProperty(i)) {
            continue;
        }

        if (!worker) {
            worker = workers[i];
            continue;
        }

        if (workers[i].served < worker.served) {
            worker = workers[i];
        }
    }

    if (!worker) {
        console.log('Failed to find worker!');
        return res.end();
    }

    proxy.proxyRequest(req, res, {
        target: `http://${worker.host}:${worker.port}`,
        host:   worker.host,
        port:   worker.port
    });

    proxy.once('error', (err) => {

        for (let i in workers) {
            if (!workers.hasOwnProperty(i)) {
                continue;
            }

            // The worker returned an error, get rid of it!
            if (workers[i].address === err.address && workers[i].port === err.port) {
                delete workers[i];
                console.log("Reloading!");
                res.writeHead(200, {
                    'refresh': 0
                });
                res.end();

                return;// logic(req, res);
            }
        }
    });
    worker.served = Date.now();
};

const httpServer = http.createServer(logic).listen(8080);
