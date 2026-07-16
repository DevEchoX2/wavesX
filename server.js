const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const users = [];

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const token = 'waves_token_' + Date.now();
  const pfpUrl = 'https://www.gravatar.com/avatar/' + Math.random().toString(36).substring(7) + '?d=identicon';
  const newUser = { id: Date.now().toString(), username, email, password, token, pfpUrl };
  users.push(newUser);

  res.json({ token, username: newUser.username, pfpUrl: newUser.pfpUrl });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ token: user.token, username: user.username, pfpUrl: user.pfpUrl });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
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
      username: data.username,
      pfp: data.pfp,
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    io.to(data.channelId).emit('receiveMessage', messageData);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
