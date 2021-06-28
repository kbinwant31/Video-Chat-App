
const socket = io('/')
const videoGrid = document.getElementById('video-grid')

var peer = new Peer ()

//---------Video chat feature----------------------
const myVideo = document.createElement('video');
myVideo.muted = true;
let myVideoStream
const peers = {};
navigator.mediaDevices.getUserMedia({
    video:true, 
    audio: true
}).then(stream => {
    myVideoStream=stream;
    addVideoStream(myVideo,stream);

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', (userVideoStream) => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        console.log("New User Connected");
        connectToNewUser(userId, stream);
    })

    let txt=$('input')

    //when enter is pressed take input from the chatbox and send it to the backend
    $('html').keydown((e) => {
        if(e.which == 13 && txt.val().length != 0) {
            console.log(txt.val())
            socket.emit('message', txt.val());
            txt.val('')
        }
    })

    socket.on('createMessage', message => {
        console.log(message);
        $('.messages').append(`<li class="message"><b>${userId}</b><br/>${message}</li>`)
        scrollToBottom()
    })
})

socket.on("user-disconnected", (userId) => {
  console.log("New User Disconnected");
  if (peers[userId]) peers[userId].close();
});

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})

//function to connect to a new user
const connectToNewUser = (userId, stream) => {
    //calling the user through peer and send the video stream
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    });
    call.on('close', () => {
      video.remove();
    });
  
    peers[userId] = call;
}

const addVideoStream = (video,stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}
//function to scroll to bottom after every message
const scrollToBottom = () =>{
    let d = $('.main_chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}


//function to mute audio during the call
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }
  //change mic icon buttons
  const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main_mute_button').innerHTML = html;
  }
  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main_mute_button').innerHTML = html;
  }

  //change icon
  const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
  }
  //change icon
  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
  }
  //function to stop or play video stream
  const playStop = () => {
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

// End Call
document.getElementById("end-button").addEventListener("click", endCall);

function endCall() {
  window.location.href = "/";
}

//---------the chat room feature-----------------------


