module.exports = {
    'getIndex': {
        template: 'index',
        method: (req, res) => {


            return new Promise((resolve, reject) => {
                resolve({'yay': 'promise!'});
            });

        }
    }
};
