const User = require('../models/user')

class UserRepository {
    constructor(model) {
        this.model = model;
    }
    create(object){
        const newUser = {
            userName: object.userName,
            password: object.password,
            coin: 1000000
        };
        const user = new this.model(newUser);

        return user.save();
    }
    getUser (id) {
        return this.model.findById(id)
    }
    checkExist(object){
        return this.model.findOne({userName: object.userName})
    }
    getCoin(id){
        return this.model.findById(id)
    }
    signIn(object){
        return this.model.findOne({
            userName: object.userName,
            password: object.password
        })
    }
    updateCoin (id,coin){
        const query = { _id: id };
        return this.model.findOneAndUpdate(query, { $set: { coin: coin} });
    }
}
module.exports = new UserRepository(User)