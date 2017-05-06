const Counter = new db.Schema({
    ip: String,
    count: Number
});

module.exports = db.model('Counter', Counter);
