const Counter = require('../entity/counter');

module.exports = {
    'getIndex': (req, res) => {

        let ip = req.headers['x-forwarded-for'];

        console.log('I\'ve handled the request!');

        return new Promise((resolve, reject) => {

            Counter
                .findOne({'ip': ip})
                .then((data) =>{
                    if(!data) {
                        data = new Counter({
                            'ip': ip,
                            'count': 0
                        });
                    }

                    data.count++;
                    data.save();

                    resolve({
                        data: data,
                        'yay': 'w00t',
                        'func' : (data) => {
                            return `${data} <a>from</a> function! ${data}`;
                        },
                        'ip': ip,
                        'counter': data.count.toString()
                    });

                });

        });
    }
};
