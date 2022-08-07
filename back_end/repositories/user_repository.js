const User = require('../models/user')

class UserRepository {
    constructor(model) {
        this.model = model;
    }
    create(object){
        const newUser = {
            username: object.username,
            password: object.password,
            coin: 1000000
        };
        const user = new this.model(newUser);

        return user.save();
    }
    checkExist(object){
        return this.model.findOne({username: object.username})
    }
    getCoin(id){
        return this.model.findById(id)
    }
    signIn(object){
        return this.model.findOne({
            username: object.username,
            password: object.password
        })
    }
}
module.exports = new UserRepository(User)