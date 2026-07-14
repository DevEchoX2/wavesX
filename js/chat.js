import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getDatabase, ref, update, onValue, off, push } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const currentUser = JSON.parse(localStorage.getItem('waves_currentUser'));

if (!currentUser) {
  window.location.href = 'pages/login.html';
}

const chatConfig = {
  apiKey: "AIzaSyAT9SKJO8pHVBtpma293HL6O6fUPC41hq8",
  authDomain: "waveschat1.firebaseapp.com",
  databaseURL: "https://waveschat1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "waveschat1",
  storageBucket: "waveschat1.firebasestorage.app",
  messagingSenderId: "798003715584",
  appId: "1:798003715584:web:3199c464651728b51d42e5",
  measurementId: "G-0QJZXX13KL"
};

let chatApp;
if (getApps().length === 0) {
  chatApp = initializeApp(chatConfig);
} else {
  chatApp = getApps()[0];
}
const db = getDatabase(chatApp);

const channels = [
  { id: 'general', name: 'general', icon: 'tag' },
  { id: 'gaming', name: 'gaming', icon: 'sports_esports' },
  { id: 'music', name: 'music', icon: 'headphones' }
];

let members = [];
let messages = { general: [], gaming: [], music: [] };
let currentChannel = 'general';
let messageRef = null;

const channelListEl = document.getElementById('channelList');
const memberListEl = document.getElementById('memberList');
const messageFeedEl = document.getElementById('messageFeed');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const toggleMembersBtn = document.getElementById('toggleMembers');
const sidebarRight = document.getElementById('sidebarRight');
const currentChannelNameEl = document.getElementById('currentChannelName');

function init() {
  const activeRef = ref(db, 'users/' + currentUser.uid);
  update(activeRef, { active: true });

  const usersRef = ref(db, 'users');
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    members = data ? Object.values(data) : [];
    renderMembers();
  });

  renderChannels();
  listenForMessages(currentChannel);
  setupEventListeners();
  
  const userAvatar = document.querySelector('.userAvatar');
  const userName = document.querySelector('.userName');
  if (userAvatar && userName) {
    if (currentUser.photoURL) {
      userAvatar.style.backgroundColor = 'transparent';
      userAvatar.innerHTML = `<img src="${currentUser.photoURL}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      userAvatar.style.backgroundColor = `${currentUser.color}40`;
      userAvatar.style.color = currentUser.color;
      userAvatar.innerHTML = currentUser.name.charAt(0).toUpperCase();
    }
    userName.textContent = currentUser.name;
  }
}

function listenForMessages(channelId) {
  if (messageRef) {
    off(messageRef);
  }
  
  currentChannel = channelId;
  messageRef = ref(db, 'messages/' + currentChannel);
  
  onValue(messageRef, (snapshot) => {
    const data = snapshot.val();
    messages[currentChannel] = data ? Object.values(data) : [];
    renderMessages();
  });
}

function renderChannels() {
  channelListEl.innerHTML = '';
  channels.forEach(channel => {
    const div = document.createElement('div');
    div.className = `channelItem ${channel.id === currentChannel ? 'active' : ''}`;
    div.innerHTML = `
      <span class="material-symbols-outlined">${channel.icon}</span>
      <span class="channelName">${channel.name}</span>
    `;
    div.addEventListener('click', () => switchChannel(channel.id));
    channelListEl.appendChild(div);
  });
}

function renderMembers() {
  memberListEl.innerHTML = '';
  members.forEach(member => {
    const div = document.createElement('div');
    div.className = 'memberCard';
    
    const avatarContent = member.photoURL 
      ? `<img src="${member.photoURL}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`
      : member.name.charAt(0).toUpperCase();

    div.innerHTML = `
      <div class="memberCardAvatar" style="background-color: ${member.photoURL ? 'transparent' : member.color + '40'}; color: ${member.color}; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 14px; overflow: hidden;">
        ${avatarContent}
        <div class="statusDot"></div>
      </div>
      <span class="memberCardName" style="color: ${member.color}">${member.name}</span>
    `;
    memberListEl.appendChild(div);
  });
}

function renderMessages() {
  messageFeedEl.innerHTML = '';
  const currentMessages = messages[currentChannel];
  
  if (currentMessages.length === 0) {
    messageFeedEl.innerHTML = `
      <div style="text-align: center; color: #555; margin-top: auto; margin-bottom: auto;">
        <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 10px;">forum</span>
        <p>Welcome to #${channels.find(c => c.id === currentChannel).name}!</p>
        <p style="font-size: 12px; margin-top: 5px;">Be the first to say hello.</p>
      </div>
    `;
    return;
  }

  currentMessages.forEach(msg => {
    const div = document.createElement('div');
    div.className = 'messageWrapper';
    
    const avatarContent = msg.photoURL 
      ? `<img src="${msg.photoURL}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`
      : msg.author.charAt(0).toUpperCase();

    div.innerHTML = `
      <div class="msgAvatar" style="background-color: ${msg.photoURL ? 'transparent' : msg.color + '40'}; color: ${msg.color}; font-weight: bold; font-size: 16px; overflow: hidden;">
        ${avatarContent}
      </div>
      <div class="msgBody">
        <div class="msgHeader">
          <span class="msgAuthor" style="color: ${msg.color}">${msg.author}</span>
          <span class="msgTime">${msg.time}</span>
        </div>
        <div class="msgContent">${msg.content}</div>
      </div>
    `;
    messageFeedEl.appendChild(div);
  });

  messageFeedEl.scrollTop = messageFeedEl.scrollHeight;
}

function switchChannel(channelId) {
  if (currentChannel === channelId) return;
  
  const channelData = channels.find(c => c.id === channelId);
  currentChannelNameEl.textContent = channelData.name;
  
  renderChannels();
  listenForMessages(channelId);
}

function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const channelMessagesRef = ref(db, 'messages/' + currentChannel);
  push(channelMessagesRef, {
    author: currentUser.name,
    color: currentUser.color,
    photoURL: currentUser.photoURL || null,
    time: timeString,
    content: content
  });

  messageInput.value = '';
}

function setupEventListeners() {
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  toggleMembersBtn.addEventListener('click', () => {
    sidebarRight.classList.toggle('hidden');
    toggleMembersBtn.classList.toggle('active');
  });
}

init();
