module.exports = {
    'getIndex': (req, res) => {

        let ip = req.headers['x-forwarded-for'];

        console.log('I\'ve handled the request!');

        return {
            'yay': 'w00t',
            'func' : (data) => {
                return `${data} <a>from</a> function! ${data}`;
            },
            'ip': ip
        };
    }
};
