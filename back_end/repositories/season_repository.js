const Season = require('../models/season')
const {STATE_SEASON} = require("../state_season");

class SeasonRepository {
    constructor(model) {
        this.model = model;
    }
    create(object){
        console.log(this.countDocument())
        const newSeason = {
            season: this.countDocument() + 1,
            timeBegin: object.time,
            listJoin: object.listJoin,
            state: STATE_SEASON.PLAYING,
            coinWin: object.coin,
            nameWin: object.name
        };
        const season = new this.model(newSeason);

        return season.save();
    }
    countDocument(){
        return this.model.countDocuments()
    }
    findSeasonPlaying(){
        return this.model.findOne({state: STATE_SEASON.PLAYING})
    }
    findBySeason(season){
        return this.model.findOne({season: season})
    }
    updateBySeason(object){
        return this.model.findOneAndUpdate({season: object.season}, { $set: {coinWin: object.coin, nameWin: object.name}})
    }
}
module.exports = new SeasonRepository(Season)