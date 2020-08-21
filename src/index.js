const path = require('path')
const http = require('http')
const express = require ('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const NodeGeocoder = require('node-geocoder')
 
const geoOptions = { 
    provider: 'geocodio',
    apiKey: '6660a4d0a6e675c5fd55ce3dca33573f70e265f'
}
const geocoder = NodeGeocoder(geoOptions)

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const path_public = path.join(__dirname,'../public')
const port = process.env.PORT || 3000

app.use(express.static(path_public))

// let welcome = 'Welcome To The Chat Room! Enjoy!'

io.on('connection', (socket)=>{
    // socket.emit() --> emits data flow to the particular connection
    // socket.broadcast.emit() --> emits data flow to all users except the current one
    // io.emit() --> emits data flow to all users
    
    console.log('socket connected...')

    socket.on('join', ({ username, room }, callback)=>{
        const { error, user } = addUser({ id:socket.id, username, room })
        
        if (error) {
           return callback(error)
        }

        socket.join(user.room)

        // Methods for sending events from server to clients:
        // socket.emit >>> sends event to a specific client
        // io.emit >>> sends event to every connected client
        // socket.broadcast.emit >>> sends event to every connected client except active user
        
        // io.to.emit >>> emits an event to everybody in a specific room
        // socket.broadcast.to.emit >>> emits an event to everyone in the same room excep active user

        socket.emit('message', generateMessage('Admin', 'Welcome To The Chat Me Room! Enjoy!'))

        // notify all users about a new user joining the chat
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined us`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })    

    

    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    // socket.on('sendLocation', async (latitude, longitude, callback) => {
    //     const location = await geocoder.reverse({ latitude, longitude })
    //     const url = `https://google.com/maps?q=${latitude},${longitude}`
    //     io.emit('locationMessage', location[0], generateLocation(url))
        
    //     console.log(location[0])
        
    //     callback()
    // })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, ()=>{
    console.log("Listening...")
})