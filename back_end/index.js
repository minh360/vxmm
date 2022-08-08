const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = require('express')()
const jsonParser = bodyParser.json();
const port = 3000

mongoose.connect('mongodb://localhost:27017/vxmm')

const db = mongoose.connection;
const router = require('./router')

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
const STATE = {
    PLAYER: 0,
    WATCH: 1
}
let listConnect = []
io.on('connection', (socket) => {
    watch += 1
    listConnect.push({id: socket.id,state: STATE.WATCH})

    socket.emit('reportWatch',watch)
    socket.broadcast.emit('reportWatch',watch)

    socket.on('signIn', id => {
        for (let i = 0; i< listConnect.length; i++){
            if (listConnect[i].id === socket.id){
                listConnect[i].state = STATE.PLAYER
                listConnect[i].idUser = id
            }
        }
        watch -=1
        socket.emit('reportWatch',watch)
        socket.broadcast.emit('reportWatch',watch)
        online += 1;
        socket.emit('reportOnline',online)
        socket.broadcast.emit('reportOnline',online)
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