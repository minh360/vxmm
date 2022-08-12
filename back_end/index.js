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
let online = 0
let watch = 0
let timeBeginSeason
let timeRemaining
let countDown
const STATE = {
    PLAYER: 0,
    WATCH: 1
}
let listConnect = []

io.on('connection', (socket) => {
    function updateOnline(){
        socket.emit('reportOnline',online)
        socket.broadcast.emit('reportOnline',online)
    }
    function updateWatch(){
        socket.emit('reportWatch',watch)
        socket.broadcast.emit('reportWatch',watch)
    }
    function updateTime (){
        if(timeRemaining <= 0){
            //todo: Thực hiện tìm người chiến thắng
        }
        else
            timeRemaining = dayjs(new Date()) - dayjs(timeBeginSeason).add(2,'minute')
        console.log(timeRemaining)
    }
    watch += 1
    listConnect.push({id: socket.id,state: STATE.WATCH})
    online = (listConnect.filter(connect => connect.state === STATE.PLAYER)).length
    updateOnline()
    updateWatch()
    socket.on('setTimeBegin', time => {
        timeBeginSeason = dayjs(time)
        countDown = setInterval(updateTime, 1000);
    })
    socket.on('signIn', id => {
        for (let i = 0; i< listConnect.length; i++){
            if (listConnect[i].id === socket.id){
                listConnect[i].state = STATE.PLAYER
                listConnect[i].idUser = id
            }
        }
        watch -=1
        online += 1
        updateWatch()
        updateOnline()
    })
    socket.on('disconnect',  () => {
        for (let i = 0; i< listConnect.length; i++){
            if (listConnect[i].id === socket.id){
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