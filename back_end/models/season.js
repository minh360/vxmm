const mongoose = require('mongoose')
const { Schema } = mongoose;
const seasonSchema = new Schema({
    season: Number,
    timeBegin: Date,
    listJoin: Array,
    state: Number,
    coinWin: Number,
    nameWin: String
});
module.exports = mongoose.model('seasons', seasonSchema);