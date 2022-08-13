const mongoose = require('mongoose')
const { Schema } = mongoose;
const logSchema = new Schema({
    season: Number,
    username: String,
    coinBefore: Number,
    coinAfter: Number,
    coinUsed: String
});
module.exports = mongoose.model('logs', logSchema);