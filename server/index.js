const dgram     = require('dgram');
const server    = dgram.createSocket({type: "udp4", reuseAddr: true});
const httpProxy = require('http-proxy');

const PORT       = 6589;
const MCAST_ADDR = "224.0.1.142";

let workers = {};

server.bind({address: MCAST_ADDR, port: PORT, exclusive: false},  () => {
    console.log('Listening on ' + MCAST_ADDR + ':' + PORT);
    server.setBroadcast(true);
    server.setMulticastTTL(128);
    server.addMembership(MCAST_ADDR);
});

server.on('error', (err) => {
    console.error(err);
});

server.on('message', (message, rinfo)  => {
    message = message.toString('ascii');

    let tag    = rinfo.address + ':' + rinfo.port;
    let header = message.split(' ')[0] || '';
    let data   = message.split(' ')[1] || '';

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
                    rinfo:  rinfo,
                };
            }
            server.send(new Buffer('ACK'), 0, 3, rinfo.port, rinfo.address);
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

        server.send(new Buffer(data), 0, data.length, worker.split(':')[1], worker.split(':')[0]);
    }
    setTimeout(ping, 5000);
};

ping();

const http  = require('http');
const proxy = httpProxy.createProxyServer({});

const logic = (req, res) => {
    // find a worker

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

    let ip = req.connection.remoteAddress.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?:\/\d{2})?/gm);

    req.headers['x-forwarded-for'] = ip[0];

    proxy.proxyRequest(req, res, {
        target: `http://${worker.host}:${worker.port}`,
        host:   worker.host,
        port:   worker.port
    });

    worker.served = Date.now();
};

const httpServer = http.createServer(logic).listen(8080);
