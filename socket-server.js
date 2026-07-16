const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  socket.on('joinChannel', (channel) => socket.join(channel));
  socket.on('leaveChannel', (channel) => socket.leave(channel));
  socket.on('sendMessage', (data) => {
    const messagePayload = {
      username: data.username,
      pfp: data.pfp,
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    io.to(data.channelId).emit('receiveMessage', messagePayload);
  });
});

server.listen(3000, () => console.log('Socket Server running on port 3000'));
