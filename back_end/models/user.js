const mongoose = require('mongoose')
const { Schema } = mongoose;
const userSchema = new Schema({
    userName: { type : String , unique : true, required : true },
    password: String,
    coin: Number
});
module.exports = mongoose.model('users', userSchema);