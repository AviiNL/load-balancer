module.exports = (webport) => {

    process.stdin.resume();

    const dgram = require('dgram');

    const PORT       = 6589;
    const MCAST_ADDR = "224.0.1.142";

    if (!webport) {
        webport = Math.floor(Math.random() * 100) + 6589;
    }

    const socket = dgram.createSocket({type: "udp4"});

    let lastPing = new Date();

    let pong = () => {
        let data = "PONG " + webport;
        socket.send(new Buffer(data), 0, data.length, PORT, MCAST_ADDR);
    };

    socket.on('message', (message, rinfo) => {
        message    = message.toString();
        let header = message.toString().substr(0, message.indexOf(' '));
        let data   = message.toString().substr(message.indexOf(' ') + 1);
        switch (header) {
            case 'PING':
                lastPing = Date.now();
                pong();
                break;
            case 'ACK':
                lastPing = Date.now();
                break;
            default:
                console.log(message, rinfo);
                break;
        }
    });

    pong();

    setInterval(() => {

        let passed = Math.floor((new Date() - lastPing) / 1000);

        if (passed > 5) {
            console.log(`No message received for ${passed} seconds`);

            pong();
        }

    }, 1000);

    const shutdown = () => {
        let data = "BYE " + webport;
        socket.send(new Buffer(data), 0, data.length, PORT, MCAST_ADDR, () => {
            process.exit(0);
        });
    };

    //do something when app is closing
    process.on('exit', shutdown);

    //catches ctrl+c event
    process.on('SIGINT', shutdown);

    return {
        'port': webport
    };
};