const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const app = require('express')()
const port = 3000

mongoose.connect('mongodb://localhost:27017/vxmm')

const db = mongoose.connection;
const router = require('./router')

db.once('open', function(){
    console.log("Connected to MongoDB successfully!");
});
const jsonParser = bodyParser.json();

app.use(jsonParser);
app.use(cors())
app.use('/', router);

const http = require('http').Server(app);
const io = require('socket.io')(http);
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

    socket.on('signIn', () => {
        for (let i = 0; i< listConnect.length; i++){
            if (listConnect[i].id === socket.id){
                listConnect[i].state = STATE.PLAYER
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

http.listen(port, () => {
    console.log('listening on port:3000');
});

