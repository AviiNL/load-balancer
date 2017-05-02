module.exports = {
    'getIndex': (req, res) => {

        let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        console.log(ip);

        return {
            'yay': 'w00t',
            'func' : (data) => {
                return `${data} <a>from</a> function! ${data}`;
            }
        };
    }
};
