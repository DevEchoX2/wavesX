const currentUser = JSON.parse(localStorage.getItem('waves_currentUser'));

if (!currentUser) {
  window.location.href = 'login.html';
}

const channels = [
  { id: 'general', name: 'general', icon: 'tag' },
  { id: 'gaming', name: 'gaming', icon: 'sports_esports' },
  { id: 'music', name: 'music', icon: 'headphones' }
];

let members = JSON.parse(localStorage.getItem('waves_users')) || [];
if (!members.find(m => m.name === currentUser.name)) {
  members.push(currentUser);
  localStorage.setItem('waves_users', JSON.stringify(members));
}

let messages = JSON.parse(localStorage.getItem('waves_messages')) || {
  general: [],
  gaming: [],
  music: []
};

let currentChannel = 'general';

const channelListEl = document.getElementById('channelList');
const memberListEl = document.getElementById('memberList');
const messageFeedEl = document.getElementById('messageFeed');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const toggleMembersBtn = document.getElementById('toggleMembers');
const sidebarRight = document.getElementById('sidebarRight');
const currentChannelNameEl = document.getElementById('currentChannelName');

function init() {
  renderChannels();
  renderMembers();
  renderMessages();
  setupEventListeners();
  
  const userAvatar = document.querySelector('.userAvatar');
  const userName = document.querySelector('.userName');
  if (userAvatar && userName) {
    userAvatar.style.backgroundColor = `${currentUser.color}40`;
    userAvatar.style.color = currentUser.color;
    userAvatar.innerHTML = currentUser.name.charAt(0).toUpperCase();
    userName.textContent = currentUser.name;
  }
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
    div.innerHTML = `
      <div class="memberCardAvatar" style="background-color: ${member.color}40; color: ${member.color}; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 14px;">
        ${member.name.charAt(0).toUpperCase()}
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
    div.innerHTML = `
      <div class="msgAvatar" style="background-color: ${msg.color}40; color: ${msg.color}; font-weight: bold; font-size: 16px;">
        ${msg.author.charAt(0).toUpperCase()}
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
  currentChannel = channelId;
  
  const channelData = channels.find(c => c.id === currentChannel);
  currentChannelNameEl.textContent = channelData.name;
  
  renderChannels();
  renderMessages();
}

function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  messages[currentChannel].push({
    author: currentUser.name,
    color: currentUser.color,
    time: timeString,
    content: content
  });

  localStorage.setItem('waves_messages', JSON.stringify(messages));

  messageInput.value = '';
  renderMessages();
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
