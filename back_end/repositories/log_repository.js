const Log = require('../models/log')

class LogRepository {
    constructor(model) {
        this.model = model;
    }
    create(object){
        const newLog = {
            season: object.season,
            username: object.username,
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
    findByUser(username){
        return this.model.find({username: username})
    }
}
module.exports = new LogRepository(Log)