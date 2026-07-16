const socket = io('http://localhost:3000');

const currentUser = localStorage.getItem('waves_username');
const currentPfp = localStorage.getItem('waves_pfp');

if (!currentUser) {
  window.location.href = 'login.html'; 
}

const currentUserPfp = document.getElementById('currentUserPfp');
const displayUsername = document.getElementById('displayUsername');
const logoutBtn = document.getElementById('logoutBtn');
const channelItems = document.querySelectorAll('.channel-item');
const chatTitle = document.getElementById('chatTitle');
const messageContainer = document.getElementById('messageContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

if (currentUserPfp && currentPfp) currentUserPfp.src = currentPfp;
if (displayUsername) displayUsername.textContent = currentUser;

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('waves_username');
    localStorage.removeItem('waves_pfp');
    window.location.href = 'login.html';
  });
}

let currentChannel = 'general';
socket.emit('joinChannel', currentChannel);

channelItems.forEach(item => {
  item.addEventListener('click', (e) => {
    channelItems.forEach(btn => btn.classList.remove('active'));
    const clickedItem = e.currentTarget;
    clickedItem.classList.add('active');

    socket.emit('leaveChannel', currentChannel);
    currentChannel = clickedItem.dataset.channel;
    socket.emit('joinChannel', currentChannel);

    if (chatTitle) chatTitle.textContent = currentChannel;
    if (messageContainer) messageContainer.innerHTML = '';
  });
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (text) {
    socket.emit('sendMessage', {
      channelId: currentChannel,
      username: currentUser,
      pfp: currentPfp,
      text: text
    });
    messageInput.value = '';
  }
}

if (sendBtn) {
  sendBtn.addEventListener('click', sendMessage);
}

if (messageInput) {
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

socket.on('receiveMessage', (data) => {
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
});
