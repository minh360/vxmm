const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = require('express')()
const jsonParser = bodyParser.json();
const port = 3000

mongoose.connect('mongodb://localhost:27017/vxmm')

const db = mongoose.connection;
const router = require('./router')
const dayjs = require("dayjs");

db.once('open', function(){
    console.log("Connected to MongoDB successfully!");
});
app.use(cors())
app.use(jsonParser);
app.use('/', router);

const server = app.listen(port  )

const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST", "PUT"]
    }
});
const {createSeason, updateSeason, plusCoin, getCoin} = require('./api')
let online = 0
let watch = 0
let timeBeginSeason
let timeRemaining
let countUserJoin = 0
let countDown
let season = 0
const STATE = {
    WATCH: 0,
    PLAYER: 1
}
let data
let listConnect = []
let listJoin = []
io.on('connection', (socket) => {
    //-------------------methods---------------------------------------------
    function findUserWin(){
        let listPercent = []
        let totalCoins = 0
        let VAT
        for (let obj of listJoin) {
            const data = findPercent(obj.username)
            totalCoins = data.totalCoins
            listPercent.push(data.percent)
        }
        const percentWin = Math.floor(Math.random() * 101) + Math.floor(Math.random())
        let numberPercent = 0
        if(countUserJoin > 10)
            VAT = 10
        else VAT = countUserJoin - 1

        totalCoins = (totalCoins - (totalCoins * VAT / 100)).toFixed(0)

        for (let i = 0; i < listPercent.length; i++){
            numberPercent += listPercent[i]
            if(numberPercent > percentWin){
                return {coinWin: totalCoins, nameWin: listJoin[i].username, coinJoin: listJoin[i].coin}
            }
        }
    }
    function updateOnline(){
        socket.emit('reportOnline',online)
        socket.broadcast.emit('reportOnline',online)
    }
    function updateWatch(){
        socket.emit('reportWatch',watch)
        socket.broadcast.emit('reportWatch',watch)
    }
    function updateSeasonDetailUser(condition){
        const data = findPercent()
        socket.emit('seasonSelect',{
            countUserJoin: countUserJoin,
            percent: data.percent,
            totalCoins: data.totalCoins,
            coinJoin: data.coinJoin
        })
        if(condition) socket.broadcast.emit('reload')
    }
    async function updateTime (){
        timeRemaining = dayjs(timeBeginSeason).add(2,'minute')- dayjs(new Date())
        if(timeRemaining <= 0){
            let coinBefore = 0
            clearInterval(countDown)
            const objectWin = findUserWin()
            data.coinWin = objectWin.coinWin
            data.state = 'DONE'
            data.coinJoin = objectWin.coinJoin
            data.nameWin = objectWin.nameWin
            data.listJoin = listJoin

            await updateSeason(data)
                .then(async () => {
                    const object = listConnect.filter(obj => obj.username === objectWin.nameWin)
                    await getCoin(object[0].idUser)
                        .then(coin => {
                            coinBefore = coin.data
                        })
                    await plusCoin({coin: objectWin.coinWin, id: object[0].idUser, season: season, coinBefore: coinBefore, username: objectWin.nameWin})
                        .then(()=> {
                            if(socket.id === object[0].idClient){
                                socket.emit('updateCoin')
                            }
                            socket.emit('sendMessage',{nameWin: objectWin.nameWin,coinWin: objectWin.coinWin})
                            socket.broadcast.emit('sendMessage',{nameWin: objectWin.nameWin,coinWin: objectWin.coinWin})
                        })
                    data = {}
                    listJoin = []
                    timeBeginSeason = ''
                    countUserJoin = 0
                    socket.emit('checkLastSeason')
                    socket.broadcast.emit('checkLastSeason')
                    console.log('End season',season)
                })
        }
    }
    function findPercent(username){
        let totalCoins = 0
        let userSocket = ''
        let coinUserJoin = 0
        if(username){
            userSocket = username
        }
        else{
            for (let user of listConnect) {
                if(user.idClient === socket.id){
                    userSocket = user.username
                    break
                }
            }
        }
        for (let obj of listJoin){
            totalCoins += obj.coin
            if(obj.username === userSocket){
                coinUserJoin += obj.coin
            }
        }
        return {totalCoins: totalCoins,percent: userSocket ? (coinUserJoin / totalCoins * 100) : 0, coinJoin: coinUserJoin}
    }
    //---------------------------------------------------
    watch += 1
    listConnect.push({idClient: socket.id,state: STATE.WATCH})
    online = (listConnect.filter(connect => connect.state === STATE.PLAYER)).length
    updateOnline()
    updateWatch()
    updateSeasonDetailUser()
    //---------------------------------------------------
    socket.on('update', () => {
        updateSeasonDetailUser()
    })
    socket.on('join',obj => {
        season = obj.season
        listJoin.push({username: obj.username,coin: obj.coin})
        countUserJoin += 1
        let flag = 0
        for (const object of listJoin) {
            if(obj.username === object.username){
                flag +=1
                break
            }
        }
        if (flag > 1) countUserJoin -= 1
        updateSeasonDetailUser('Join')
        if(countUserJoin === 2){
            data = {
                timeBegin: new Date(),
                season : obj.season,
                listJoin: listJoin,
            }
            createSeason(data)
                .then(() => {
                    console.log('Begin Season',obj.season)
                    timeBeginSeason = dayjs(data.timeBegin)
                    countDown = setInterval(updateTime, 0)
                    updateSeasonDetailUser('Join')
                })
        }
    })
    socket.on('signIn', async data => {
        for (let i = 0; i< listConnect.length; i++){
            if (listConnect[i].idClient === socket.id){
                listConnect[i].state = STATE.PLAYER
                listConnect[i].idUser = data.id
                listConnect[i].username = data.username
                break
            }
        }
        watch -=1
        online += 1
        updateOnline()
        updateWatch()
        updateSeasonDetailUser()
    })
    socket.on('disconnect',  () => {
        for (let i = 0; i< listConnect.length; i++){
            if (listConnect[i].idClient === socket.id){
                if(listConnect[i].state === STATE.PLAYER){
                    online -= 1;
                    socket.broadcast.emit('reportOnline',online)
                }
                else {
                    watch -=1
                    socket.broadcast.emit('reportWatch',watch)
                }
                listConnect.splice(i,1)
                break
            }
        }
    });
});