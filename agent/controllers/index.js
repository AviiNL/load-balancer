module.exports = {
    'getIndex': (req, res) => {

        return {
            'yay': 'w00t',
            'func' : (data) => {
                return `${data} <a>from</a> function! ${data}`;
            }
        };
    }
};
