const path = require('path')
const http = require('http')
const express = require ('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const path_public = path.join(__dirname,'../public')
const port = process.env.PORT || 3000

app.use(express.static(path_public))

let count=0
let welcome = 'Welcome To The Chat Room! Enjoy!'

io.on('connection', (socket)=>{
    // socket.emit() --> emits data flow to the particular connection
    // socket.broadcast.emit() --> emits data flow to all users except the current one
    // io.emit() --> emits data flow to all users
    
    console.log('socket connected...')

    socket.emit('countUpdated', count)
    socket.emit('message', welcome)

    // notify all users about a new user joining the chat
    socket.broadcast.emit('message', 'A new user has joined us')

    socket.on('inc', ()=>{
        count++
        // socket.emit('countUpdated', count)
        io.emit('countUpdated', count)
    })

    socket.on('sendMessage', (msg)=>{
        io.emit('message', msg)
    })

    socket.on('disconnect', ()=>{
        io.emit('message', 'A User has left')
    })
})

server.listen(port, ()=>{
    console.log("Listening...")
})