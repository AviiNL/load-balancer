module.exports = {
    'getIndex': (req, res) => {

        let ip = req.headers['x-forwarded-for'];

        console.log('I\'ve handled the request!');

        // @todo[feature]: add support to return es6 promises
        return new Promise((resolve, reject) => {

            db.get('test', (err, data) => {
                if(err) {
                    return reject(err);
                }

                resolve({
                    'data': data,
                    'yay': 'w00t',
                    'func' : (data) => {
                        return `${data} <a>from</a> function! ${data}`;
                    },
                    'ip': ip
                });
            });


        });


        // return {
        //     'yay': 'w00t',
        //     'func' : (data) => {
        //         return `${data} <a>from</a> function! ${data}`;
        //     },
        //     'ip': ip
        // };
    }
};
