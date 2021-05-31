const socket = io('/')


const videoGrid = document.getElementById('video-grid')

// a new peer is initialized
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})

//myVideo is a new video element
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

//initialize the video stream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {

//after initializing stream add ones own video element to the DOM
  addVideoStream(myVideo, stream)
    //if there is a call to the myPeer
  myPeer.on('call', call => {

    //answer incoming call stream from the other user 
    call.answer(stream)
    const video = document.createElement('video')
    //after answering other users stream , create a dom Video element of other user
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  //once you join the romm , you are officially connected to the stream
//   socket.on('user-connected', userId => {
//     connectToNewUser(userId, stream)
//   })
  socket.on('user-connected', userId => {
    setTimeout(connectToNewUser,3000,userId,stream)
  })
})

socket.on('user-disconnected', userId => {
    console.log('removing stream of the user')
  if (peers[userId]) peers[userId].close()
})

//whenever you create a your peer then connect to the room
myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})


//when new user arrives we take his user ID and stream even us
function connectToNewUser(userId, stream) {
  console.log(userId)
  console.log(stream)
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')

  //once we get user's video stream then add a video element to it
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  //when exits room then close his video
  call.on('close', () => {
    console.log('removing video of the user')
    video.remove()
  })
  //save his userId so when he disconnects call then you can remove his video in you DOM
  peers[userId] = call
}


//function to add video stream in the DOM
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}