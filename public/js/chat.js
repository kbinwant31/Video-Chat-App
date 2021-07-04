const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chatContainer');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get username
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
}); 

const socket = io();

// Join a chatroom
socket.emit('join-chat-room', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//notification from the admin
socket.on('notification', notifText => {
  console.log(notifText);
  outputNotification(notifText);
  //scroll down after every message
});

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    $('.list-group').append(`
    <a href="" class="filterDiscussions all single " id="list-chat-list" data-toggle="list" role="tab">
      <img class="avatar-md" src="img/avatars/user.png" data-toggle="tooltip" title="username" alt="avatar">
      <div class="data">
        <h5>${user.username}</h5>
      </div>
    </a>
    `)
  });
}

//submitting the message
chatForm.addEventListener('submit', (e) => {
  
  e.preventDefault();
  //to get the message
  const messg = e.target.elements.msg.value;
  if (!messg) {
    return false;
  }
  sendMessage(messg)
    //to emit the message to the server
    //socket.emit('chat_message',msg);
    //clear the input in the input text message field
  e.target.elements.msg.value = '';
   e.target.elements.msg.focus();
})

function sendMessage(msg){
  //Append
  outputMyMessage(msg);
  //send to server
  socket.emit('chat_message',msg);
  scrollToBottom(chatMessages);
}

//message from the server
socket.on('text', messageText => {
  console.log(messageText);
  outputUserMessage(messageText);
  //scroll down after every message
  
});



//function to output my message to DOM of my own window
function outputMyMessage(text) {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });
  const div = document.createElement('div');
  div.classList.add('message','me');
  div.innerHTML = `
  <div class="text-main">
  <div class="text-group me">
    <div class="text me">
      <p>${text}</p>
    </div>
  </div>
  <span>${formattedTime}</span>
  </div>`;
  document.getElementById("chatContainer").appendChild(div);
}

//function to output user message
function outputUserMessage(text) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
  <img class="avatar-md" src="img/avatars/user.png" data-toggle="tooltip" data-placement="top" title="${text.username}" alt="avatar">
  <div class="text-main">
		<div class="text-group">
    <span>${text.username}</span>
			<div class="text">
				<p>${text.text}</p>
			</div>
		</div>
			<span style="color:gray;font-size:12px;">${text.time}</span>
	</div>`;
  document.getElementById("chatContainer").appendChild(div);
}

//function to output notification to DOM
function outputNotification(text) {
  const div = document.createElement('div');
  div.classList.add('date');
  div.innerHTML = `<span>${text.text}</span>`;
  document.getElementById("chatContainer").appendChild(div);
}
//function to scoll to bottom after every message
function scrollToBottom(el) { el.scrollTop = el.scrollHeight; }
