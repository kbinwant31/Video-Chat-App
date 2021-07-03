const express = require('express');
const app = express();
const server = require('http').Server(app);
const redirect = require("express-redirect");
redirect(app);
//to convert message to an object with user id and time
const formatMessage = require('./public/dist/utils/messages');

//use socket to make a real time connection
const io = require('socket.io')(server);

//to generate random room Id
const { v4:uuidv4 } = require('uuid');

//for getting login credentials
const bodyParser = require('body-parser'); // Middleware
app.use(bodyParser.urlencoded({ extended: false }));

//For chatroom
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./public/dist/utils/user');

//import peer
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug:true
})

app.set('view engine','ejs');
app.use(express.static('public'));
app.use('/peerjs', peerServer);

app.redirect("", "/login");

// Route to Homepage
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
}); 

// Route to Login Page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/sign-in.html');
});


//create video-chat room
app.get("/create-room/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});
//video-chat room with a unique ID
app.get('/:room',(req,res) => {
    res.render('room',{ roomId : req.params.room })
})
//when the user makes a connection on the socket
io.on('connection', socket => {
    
    socket.on('join-chat-room',({username,room}) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        //welcome user
        socket.emit('notification',formatMessage('Admin','Welcome to Teams Clone!'));
        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('notification',
        formatMessage('Admin', `${user.username} has joined the chat!`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for chat messages
    socket.on('chat_message',msg => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('text',formatMessage(user.username,msg));

    })
    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
        io.to(user.room).emit(
            'notification',
            formatMessage('Admin', `${user.username} has left the chat...`)
        );

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }
    });
        



    //on joining a video chat room
    socket.on('join-room' , (roomId, userId) => {
        socket.join(roomId);
        //to broadcast in the room that a user has joined
        socket.broadcast.to(roomId).emit('user-connected', userId);
        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message);

        });
        
    });

    

    //When user diconnects
    
})

const port = 3030 || process.env.port; // Port we will listen on

// Function to listen on the port
server.listen(port);