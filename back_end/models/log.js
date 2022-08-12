const mongoose = require('mongoose')
const { Schema } = mongoose;
const logSchema = new Schema({
    season: Number,
    userName: String,
    coinBefore: Number,
    coinAfter: Number,
    coinUsed: Number
});
module.exports = mongoose.model('logs', logSchema);