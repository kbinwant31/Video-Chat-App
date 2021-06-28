const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chatContainer');

//get username
const { username, password } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

console.log(username);

const socket = io();

//notification from the admin
socket.on('notification', notifText => {
  console.log(notifText);
  outputNotification(notifText);
  //scroll down after every message
});


//message from the server
socket.on('text', messageText => {
    console.log(messageText);
    outputMessage(messageText);
    //scroll down after every message
});

//submitting the message
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //to get the message
    const msg = e.target.elements.msg.value;
    //to emit the message to the server
    socket.emit('chat_message',msg);
    //clear the input in the input text message field
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})


//function to output message to DOM of my own window
function outputMessage(text) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.classList.add('me');
  div.innerHTML = `<div class="text-main">
  <div class="text-group me">
    <div class="text me">
      <p>${text.text}</p>
    </div>
  </div>
  <span>${text.time}</span>
  </div>`;
  document.getElementById("chatContainer").appendChild(div);
}

//function to output message to DOM of my own window
function outputNotification(text) {
  const div = document.createElement('div');
  div.classList.add('date');
  div.innerHTML = `<hr>
  <span>${text.text}</span>
  <hr>`;
  document.getElementById("chatContainer").appendChild(div);
}
