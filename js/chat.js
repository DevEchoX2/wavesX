const currentUser = JSON.parse(localStorage.getItem('waves_currentUser') || 'null');
const activeUser = currentUser && currentUser.uid ? currentUser : {
  name: 'Guest',
  color: '#888888',
  uid: null,
  photoURL: null
};

const channels = [
  { id: 'general', name: 'general', icon: 'tag' },
  { id: 'gaming', name: 'gaming', icon: 'sports_esports' },
  { id: 'music', name: 'music', icon: 'headphones' }
];

let members = [];
let messages = { general: [], gaming: [], music: [] };
let currentChannel = 'general';

const channelListEl = document.getElementById('channelList');
const memberListEl = document.getElementById('memberList');
const messageFeedEl = document.getElementById('messageFeed');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const toggleMembersBtn = document.getElementById('toggleMembers');
const sidebarRight = document.getElementById('sidebarRight');
const currentChannelNameEl = document.getElementById('currentChannelName');

function loadMessages() {
  const storedMessages = JSON.parse(localStorage.getItem('waves_chatMessages') || '{}');
  messages = {
    general: Array.isArray(storedMessages.general) ? storedMessages.general : [],
    gaming: Array.isArray(storedMessages.gaming) ? storedMessages.gaming : [],
    music: Array.isArray(storedMessages.music) ? storedMessages.music : []
  };
}

function saveMessages() {
  localStorage.setItem('waves_chatMessages', JSON.stringify(messages));
}

function getMembers() {
  const storedUsers = JSON.parse(localStorage.getItem('waves_users') || '{}');
  const profiles = Object.values(storedUsers);
  const seen = new Set();
  const mergedMembers = [];

  const addMember = (member) => {
    if (!member || !member.name) return;
    const key = member.uid || member.email || member.name;
    if (!seen.has(key)) {
      seen.add(key);
      mergedMembers.push(member);
    }
  };

  addMember(activeUser);
  profiles.forEach(addMember);
  return mergedMembers;
}

function init() {
  loadMessages();
  members = getMembers();
  renderChannels();
  listenForMessages(currentChannel);
  setupEventListeners();
  renderMembers();
  renderCurrentUser();
}

function listenForMessages(channelId) {
  currentChannel = channelId;
  renderMessages();
}

function renderChannels() {
  if (!channelListEl) return;
  channelListEl.innerHTML = '';
  channels.forEach((channel) => {
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
  if (!memberListEl) return;
  memberListEl.innerHTML = '';
  members.forEach((member) => {
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
  if (!messageFeedEl) return;
  messageFeedEl.innerHTML = '';
  const currentMessages = messages[currentChannel] || [];

  if (currentMessages.length === 0) {
    messageFeedEl.innerHTML = `
      <div style="text-align: center; color: #555; margin-top: auto; margin-bottom: auto;">
        <span class="material-symbols-outlined" style="font-size: 48px; margin-bottom: 10px;">forum</span>
        <p>Welcome to #${channels.find((c) => c.id === currentChannel).name}!</p>
        <p style="font-size: 12px; margin-top: 5px;">Be the first to say hello.</p>
      </div>
    `;
    return;
  }

  currentMessages.forEach((msg) => {
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

function renderCurrentUser() {
  const userAvatar = document.querySelector('.userAvatar');
  const userName = document.querySelector('.userName');
  if (userAvatar && userName) {
    if (activeUser.photoURL) {
      userAvatar.style.backgroundColor = 'transparent';
      userAvatar.innerHTML = `<img src="${activeUser.photoURL}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      userAvatar.style.backgroundColor = `${activeUser.color}40`;
      userAvatar.style.color = activeUser.color;
      userAvatar.innerHTML = activeUser.name.charAt(0).toUpperCase();
    }
    userName.textContent = activeUser.name;
  }
}

function switchChannel(channelId) {
  if (currentChannel === channelId) return;

  const channelData = channels.find((c) => c.id === channelId);
  if (currentChannelNameEl) {
    currentChannelNameEl.textContent = channelData.name;
  }

  renderChannels();
  listenForMessages(channelId);
}

function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messages[currentChannel] = messages[currentChannel] || [];
  messages[currentChannel].push({
    author: activeUser.name,
    color: activeUser.color,
    photoURL: activeUser.photoURL || null,
    time: timeString,
    content
  });

  saveMessages();
  renderMessages();
  messageInput.value = '';
}

function setupEventListeners() {
  if (messageInput) {
    messageInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  if (toggleMembersBtn && sidebarRight) {
    toggleMembersBtn.addEventListener('click', () => {
      sidebarRight.classList.toggle('hidden');
      toggleMembersBtn.classList.toggle('active');
    });
  }
}

init();
