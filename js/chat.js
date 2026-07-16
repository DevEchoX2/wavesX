const currentUser = localStorage.getItem('waves_username');
const currentPfp = localStorage.getItem('waves_pfp');

if (!currentUser || !currentPfp) {
  window.location.href = 'login.html';
  throw new Error('Unauthorized');
}

const currentUserPfp = document.getElementById('currentUserPfp');
const displayUsername = document.getElementById('displayUsername');
const logoutBtn = document.getElementById('logoutBtn');
const channelItems = document.querySelectorAll('.channel-item');
const chatTitle = document.getElementById('chatTitle');
const messageContainer = document.getElementById('messageContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const membersList = document.getElementById('membersList');

if (currentUserPfp) currentUserPfp.src = currentPfp;
if (displayUsername) displayUsername.textContent = currentUser;

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('waves_username');
    localStorage.removeItem('waves_pfp');
    window.location.href = 'login.html';
  });
}

let currentChannel = 'general';
let eventSource = null;

function joinChannel(channel) {
  if (eventSource) eventSource.close();
  currentChannel = channel;
  
  const streamUrl = `/api/stream?channel=${channel}&username=${encodeURIComponent(currentUser)}&pfpUrl=${encodeURIComponent(currentPfp)}`;
  eventSource = new EventSource(streamUrl);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'message') {
      appendMessage(data);
    } else if (data.type === 'onlineUsers') {
      updateMembersList(data.users);
    }
  };
}

joinChannel(currentChannel);

channelItems.forEach(item => {
  item.addEventListener('click', (e) => {
    channelItems.forEach(btn => btn.classList.remove('active'));
    const clickedItem = e.currentTarget;
    clickedItem.classList.add('active');

    const newChannel = clickedItem.dataset.channel;
    if (chatTitle) chatTitle.textContent = newChannel;
    if (messageContainer) messageContainer.innerHTML = '';
    
    joinChannel(newChannel);
  });
});

async function sendMessage() {
  const text = messageInput.value.trim();
  if (text) {
    await fetch('/api/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channelId: currentChannel,
        username: currentUser,
        pfp: currentPfp,
        text: text
      })
    });
    messageInput.value = '';
  }
}

if (sendBtn) sendBtn.addEventListener('click', sendMessage);

if (messageInput) {
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

function appendMessage(data) {
  if (!messageContainer) return;
  
  const msgElement = document.createElement('div');
  msgElement.className = 'message';
  
  msgElement.innerHTML = `
    <div class="avatar">
      <img src="${data.pfp}" alt="pfp" style="width: 40px; height: 40px; border-radius: 50%;">
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="msg-username">${data.username}</span>
        <span class="msg-timestamp">${data.timestamp}</span>
      </div>
      <div class="msg-text"></div> 
    </div>
  `;
  
  msgElement.querySelector('.msg-text').textContent = data.text;
  messageContainer.appendChild(msgElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function updateMembersList(users) {
  if (!membersList) return;
  membersList.innerHTML = `<div class="member-category">ONLINE — ${users.length}</div>`;
  
  users.forEach(user => {
    const memberElement = document.createElement('div');
    memberElement.className = 'member-item';
    const isMe = user.username === currentUser;
    
    memberElement.innerHTML = `
      <div class="avatar-wrapper">
          <img src="${user.pfpUrl}" alt="user" style="width: 32px; height: 32px; border-radius: 50%;">
          <div class="status-dot online"></div>
      </div>
      <span class="member-name ${isMe ? 'blue-text' : ''}">${user.username}</span>
    `;
    membersList.appendChild(memberElement);
  });
}
