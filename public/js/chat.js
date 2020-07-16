const socket = io()

socket.on('countUpdated', (count)=>{
    console.log('The count has been updated', count)
})



socket.on('message', (msg)=>{
    console.log(msg)
})

// document.querySelector('#inc').addEventListener('click', ()=>{
//     console.log('click')
//     socket.emit('inc')
// })

document.querySelector('#message-form').addEventListener('submit', (e)=>{
    e.preventDefault()

    const msg = e.target.elements.message.value

    if (msg.length !==0) {socket.emit('sendMessage', msg)}

})

document.querySelector("#send-location").addEventListener('click', ()=>{
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
    })
})