const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocationButton = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const roomTemplate = document.querySelector('#room-template').innerHTML


// oPTIONS
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) // Ignores the question mark goes away from query string



socket.on('countUpdated', (count)=>{
    console.log('The count has been updated', count)
})



socket.on('message', (message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})


socket.on('locationMessage', (message) => {
    // const { city, state } = location

    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({room, users}) => {
   const html = Mustache.render(roomTemplate, {
       room,
       users
   })
   document.querySelector('#sidebar').innerHTML = html
})

// document.querySelector('#inc').addEventListener('click', ()=>{
//     console.log('click')
//     socket.emit('inc')
// })

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    // disable the form
   
        $messageFormButton.setAttribute('disabled', 'disabled')
   
    const message = e.target.elements.message.value

    if (message.length !==0) {
        socket.emit('sendMessage', message, (error)=>{
            // enable the form
            $messageFormButton.removeAttribute('disabled')
            $messageFormInput.value=''
            $messageFormInput.focus()

            if (error) {
                return console.log(error)
            } 
            console.log("Message Delivered!")
        })
    }

})

$sendLocationButton.addEventListener('click', ()=>{
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error)=>{
            $sendLocationButton.removeAttribute('disabled')

            if (error) {
                return console.log('Location was not shared!')
            }
            console.log('Location shared!')
            // let mapProp= {
            //     center:new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
            //     zoom:5,
            //   };
            // let map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
        })
    })
})

socket.emit('join', { username, room }, (error)=>{
    if (error) {
        alert(error)
        location.href = '/'
    }
})