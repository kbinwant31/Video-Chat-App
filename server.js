const express = require('express');
const app = express();
const server = require('http').Server(app);

//to convert message to an object with user id and time
const formatMessage = require('./public/dist/utils/messages');

//use socket to make a real time connection
 const io = require('socket.io')(server);

//to generate random room Id
const { v4:uuidv4 } = require('uuid');

//for getting login credentials
const bodyParser = require('body-parser'); // Middleware
app.use(bodyParser.urlencoded({ extended: false }));

//import peer
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug:true
})

app.set('view engine','ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);

// Route to Homepage
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
  
// Route to Login Page
app.get('/', (req,res)=>{
    res.render(path.join(__dirname, '/sign-in.html'));
})

// login handler route
app.post('/', (req, res) => {
    // Insert Login Code Here
    let username = req.body.username;
    let password = req.body.password;
    res.send(`Username: ${username} Password: ${password}`);
});
//create room
app.get("/create-room/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});
//room with a unique ID
app.get('/:room',(req,res) => {
    res.render('room',{ roomId : req.params.room })
})
//when the user makes a connection on the socket
io.on('connection', socket => {
    //welcome user
    socket.emit('notification',formatMessage('Admin','Welcome to Teams Clone!'));
    //broadcast when anew user connects
    socket.broadcast.emit('notification',formatMessage('Admin','A new user has joined!'));
    

    socket.on('join-room' , (roomId, userId) => {
        socket.join(roomId);
        //to broadcast in the room that a user has joined
        socket.broadcast.to(roomId).emit('user-connected', userId);
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message);

        })
        
    })

    //Listen for chat messages
    socket.on('chat_message',msg => {
        io.emit('text',formatMessage('USER',msg));

    })

    //When user diconnects
    
})

const port = 3030 || process.env.port; // Port we will listen on

// Function to listen on the port
server.listen(port);