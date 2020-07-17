const path = require('path')
const http = require('http')
const express = require ('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const path_public = path.join(__dirname,'../public')
const port = process.env.PORT || 3000

app.use(express.static(path_public))

let welcome = 'Welcome To The Chat Room! Enjoy!'

io.on('connection', (socket)=>{
    // socket.emit() --> emits data flow to the particular connection
    // socket.broadcast.emit() --> emits data flow to all users except the current one
    // io.emit() --> emits data flow to all users
    
    console.log('socket connected...')

    socket.emit('message', welcome)

    // notify all users about a new user joining the chat
    socket.broadcast.emit('message', 'A new user has joined us')

    socket.on('sendMessage', (msg, callback)=>{
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed!')
        }
        
        io.emit('message', msg)
        callback()
    })

    socket.on('sendLocation', (coords, callback)=>{
        io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    socket.on('disconnect', ()=>{
        io.emit('message', 'A User has left')
    })
})

server.listen(port, ()=>{
    console.log("Listening...")
})