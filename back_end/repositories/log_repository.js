const Logs = require('../models/season')

class LogsRepository {
    constructor(model) {
        this.model = model;
    }
    create(object){
        console.log(this.model.countDocuments())
        const newLogs = {
            season: object.season,
            username: object.name,
            coinBefore: object.coinBefore,
            coinAfter: object.coinAfter,
        };
        const log = new this.model(newLogs);

        return log.save();
    }
    findBySeason(season){
        return this.model.findOne({season: season})
    }
    findByUser(username){
        return this.model.findOne({username: username})
    }
}
module.exports = new LogsRepository(Logs)