const http = require('http');
const fs = require('fs');
const path = require('path');

const users = [];
let clients = [];

const getBody = (req) => new Promise(resolve => {
  let body = '';
  req.on('data', chunk => body += chunk.toString());
  req.on('end', () => resolve(body ? JSON.parse(body) : {}));
});

const broadcastOnlineUsers = () => {
  const onlineData = clients.reduce((acc, client) => {
    if (client.username && !acc.find(u => u.username === client.username)) {
      acc.push({ username: client.username, pfpUrl: client.pfpUrl });
    }
    return acc;
  }, []);
  
  const data = JSON.stringify({ type: 'onlineUsers', users: onlineData });
  clients.forEach(client => client.res.write(`data: ${data}\n\n`));
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/signup') {
    const { username, email, password } = await getBody(req);
    if (!username || !email || !password) return res.writeHead(400).end(JSON.stringify({ error: 'All fields required' }));
    if (users.find(u => u.email === email)) return res.writeHead(400).end(JSON.stringify({ error: 'Email exists' }));

    const pfpUrl = 'https://www.gravatar.com/avatar/' + Math.random().toString(36).substring(7) + '?d=identicon';
    const newUser = { id: Date.now().toString(), username, email, password, pfpUrl };
    users.push(newUser);
    return res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify({ username: newUser.username, pfpUrl: newUser.pfpUrl }));
  }

  if (req.method === 'POST' && req.url === '/api/login') {
    const { email, password } = await getBody(req);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.writeHead(401).end(JSON.stringify({ error: 'Invalid credentials' }));
    return res.writeHead(200, {'Content-Type': 'application/json'}).end(JSON.stringify({ username: user.username, pfpUrl: user.pfpUrl }));
  }

  if (req.method === 'POST' && req.url === '/api/sendMessage') {
    const data = await getBody(req);
    const messageData = {
      type: 'message',
      username: data.username,
      pfp: data.pfp,
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    clients.forEach(client => {
      if (client.channel === data.channelId) {
        client.res.write(`data: ${JSON.stringify(messageData)}\n\n`);
      }
    });
    return res.writeHead(200).end(JSON.stringify({ success: true }));
  }

  if (req.method === 'GET' && req.url.startsWith('/api/stream')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const channel = urlParams.get('channel') || 'general';
    const username = urlParams.get('username');
    const pfpUrl = urlParams.get('pfpUrl');

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const clientId = Date.now();
    clients.push({ id: clientId, channel, username, pfpUrl, res });
    broadcastOnlineUsers();

    req.on('close', () => {
      clients = clients.filter(c => c.id !== clientId);
      broadcastOnlineUsers();
    });
    return;
  }

  let filePath = '.' + req.url;
  if (filePath === './') filePath = './pages/chat.html';

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css'
  };
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404).end('File Not Found');
      } else {
        res.writeHead(500).end('Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(3000, () => console.log('Server running on port 3000'));
