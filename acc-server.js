const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'users.json');

function readUsers() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([]));
    }
    
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file:", err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Error writing to database file:", err);
  }
}

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const users = readUsers();

  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: 'Username already taken' });
  }

  const token = 'waves_token_' + Date.now() + Math.random().toString(36).substring(2, 7);
  const pfpUrl = 'https://www.gravatar.com/avatar/' + Math.random().toString(36).substring(7) + '?d=identicon';
  
  const newUser = { 
    id: Date.now().toString(), 
    username, 
    email, 
    password, 
    token, 
    pfpUrl 
  };
  
  users.push(newUser);
  writeUsers(users);

  res.json({ token, username: newUser.username, pfpUrl: newUser.pfpUrl });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ token: user.token, username: user.username, pfpUrl: user.pfpUrl });
});

app.listen(PORT, () => {
  console.log(`Account Server running on port ${PORT}`);
});
