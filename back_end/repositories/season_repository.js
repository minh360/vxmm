const Season = require('../models/season')

class SeasonRepository {
    constructor(model) {
        this.model = model;
    }
    create(object){
        const newSeason = {
            season: object.season,
            timeBegin: '',
            listJoin: object.listJoin,
            state: 'PLAYING',
            coinJoin: 0,
            coinWin: '',
            nameWin: '',

        };
        const season = new this.model(newSeason);

        return season.save();
    }
    countDocument(){
        return this.model.countDocuments()
    }
    findSeasonPlaying(){
        return this.model.findOne({state: 'PLAYING'})
    }
    findBySeason(season){
        return this.model.findOne({season: season})
    }
    updateBySeason(object){
        return this.model.findOneAndUpdate({season: object.season}, { $set: {
            coinWin: object.coinWin,
            timeBegin: object.timeBegin,
            nameWin: object.nameWin,
            state: object.state,
            listJoin: object.listJoin,
            coinJoin: object.coinJoin
        }})
    }
}
module.exports = new SeasonRepository(Season)