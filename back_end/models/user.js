const mongoose = require('mongoose')
const { Schema } = mongoose;
const userSchema = new Schema({
    username: { type : String , unique : true},
    password: String,
    coin: Number
});
module.exports = mongoose.model('users', userSchema);