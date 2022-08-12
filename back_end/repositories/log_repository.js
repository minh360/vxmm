const Log = require('../models/log')

class LogRepository {
    constructor(model) {
        this.model = model;
    }
    create(object){
        const newLog = {
            season: object.season,
            userName: object.userName,
            coinBefore: object.coinBefore,
            coinAfter: object.coinAfter,
            coinUsed: object.coinUsed
        };
        const log = new this.model(newLog);

        return log.save();
    }
    findBySeason(season){
        return this.model.findOne({season: season})
    }
    findByUser(userName){
        return this.model.findOne({username: userName})
    }
}
module.exports = new LogRepository(Log)