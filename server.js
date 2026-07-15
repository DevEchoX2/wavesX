const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {

  socket.on('joinChannel', (channelId) => {
    socket.join(channelId);
  });

  socket.on('leaveChannel', (channelId) => {
    socket.leave(channelId);
  });

  socket.on('sendMessage', (data) => {
    const messageData = {
      id: Date.now().toString(),
      user: data.user,
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roles: data.roles
    };

    io.to(data.channelId).emit('receiveMessage', messageData);
  });

  socket.on('disconnect', () => {
  });
});

const PORT = 3000;
server.listen(PORT, () => {
});
