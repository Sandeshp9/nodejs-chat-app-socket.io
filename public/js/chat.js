const socket = io()

const $msgform = document.querySelector('#msg-form')
const $msgformInput = $msgform.querySelector('input')
const $msgformButton = $msgform.querySelector('button')
const $sendloc = document.querySelector('#send-loc')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const LocationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix:true })

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.name,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('LocationMessage', (LocMsg) => {
    console.log(LocMsg)
    const html = Mustache.render(LocationTemplate,{
        username:LocMsg.username,
        url:LocMsg.loc,
        createdAt: moment(LocMsg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({ room, users })=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$msgform.addEventListener('submit', (e) => {
    e.preventDefault()
    //disable form
    $msgformButton.setAttribute('disabled','disabled')

    const msg = e.target.elements.msg.value
    socket.emit('sendMessage', msg, (error) => {
        //Enable form
        $msgformButton.removeAttribute('disabled')
        $msgformInput.value=''
        $msgformInput.focus()
        if(error) {
            return console.log(error)
        }
        console.log('Message was delivered')
    })
})

$sendloc.addEventListener('click', () => {
    
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    //disable form
    $sendloc.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        const clientpos = {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }
        socket.emit('sendLocation', clientpos, () => {
            //Enable form
            $sendloc.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', {username,room}, (error) => {
    if(error) {
        alert(error)
        location.href='/'
    }
})