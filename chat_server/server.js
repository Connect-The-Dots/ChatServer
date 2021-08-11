const path = require('path');
const express = require('express');
const http = require('http');
const socket = require('socket.io');
const cors = require('cors');
// const messageRoutes = require("../server/messageRoutes");
// const userRoutes = require("../server/userRoutes");
// const dataRoutes = require("../server/dataRoutes");
// const diaryRoutes = require("../server/diaryRoutes");
// let clients = [];

const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ConnectTheDotsDbAdmin:readandwrite@connectthedotscluster.ottrl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority&ssl=true', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false});

// Connect to MongoDb
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
    
console.log("Connected to ConnectTheDots MongoDb successfully!");
    
    // Initialize Express server
const app = express();
app.enable('trust proxy');

    // Middleware
app.use(express.json());
app.use(cors());  
app.use(express.static('../server/public'));
app.use(express.static(path.join(__dirname, './chatModels')));
   
    // IMPORTANT: End Points
// app.use("/messageApi", messageRoutes);
// app.use("/userApi", userRoutes);
// app.use("/dataApi", dataRoutes);
// app.use("/diaryApi", diaryRoutes);


const server = http.createServer(app);
const io = socket(server);


const PORT = 10000 || process.env.PORT;

server.listen(PORT, () => console.log(`>> server is listening to port: ${PORT}`));

io.on('connection', (socket) => {
    console.log('>> new client connection ', socket.id)

    // welcome message
    socket.emit('enter-room')

    // connect with other users
    socket.on('pair', () => {

        // send a request to connect a random user
        socket.broadcast.emit('request', {
            message: ">> a user requests to connect to a random user",
            sender: socket.id 
        })

    })

    // provide an offer for random connection
    socket.on('offer', (offer) => {  
        console.log(offer.message)
        socket.to(offer.receiver).emit('offer', offer)    
    })

    // confirm the offer and set up the connection 
    socket.on('confirm', (message) => {
        console.log(message.message)
        socket.to(message.receiver).emit('confirm', message)
    })

    // provide a feedback after confirm
    socket.on('feedback', (message) => {
        console.log(message.message)
        socket.to(message.receiver).emit('feedback', message)
    })


    // send a message 
    socket.on('send-message', (message) => {
        socket.to(message.receiver).emit('send-message',message)
    })

    // notify when other users are typing
    socket.on('typing', (notification) => {
        socket.to(notification.receiver).emit('typing', notification)
    })

    // notify when a user leaves
    // socket.on('disconnect', () => {
    //     io.emit('leave', {
    //         message: "has left the chat room !",
    //         sender: user
    //     })
    // })

    socket.on('leave', (message) => {
        socket.to(message.receiver).emit('leave', message)
    })
})