const User = require('../models/user')

class UserRepository {
    constructor(model) {
        this.model = model;
    }
    create(object){
        const newUser = {
            username: object.username,
            password: object.password,
            coin: object.coin ? object.coin : 100000
        };
        const user = new this.model(newUser);

        return user.save();
    }
    getUser(id) {
        return this.model.findById(id)
    }
    checkExist(username){
        return this.model.findOne({username: username})
    }
    changeCoin (id,coin){
        const query = { _id: id };
        return this.model.findOneAndUpdate(query, { $inc: { coin: coin} });
    }
}
module.exports = new UserRepository(User)