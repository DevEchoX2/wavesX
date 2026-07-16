const token = localStorage.getItem('waves_token');
const savedUsername = localStorage.getItem('waves_username');
const savedPfp = localStorage.getItem('waves_pfp');

if (!token || !savedUsername) {
  window.location.href = 'login.html';
}

const defaultPfp = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

document.getElementById('displayUsername').innerText = savedUsername;
document.getElementById('currentUserPfp').src = savedPfp || defaultPfp;

const membersList = document.getElementById('membersList');
function updateMembersList() {
  membersList.innerHTML = `
    <div class="member-category">ONLINE — 1</div>
    <div class="member-item">
      <div class="avatar-wrapper">
        <div class="avatar">
          <img src="${savedPfp || defaultPfp}" alt="pfp">
        </div>
        <div class="status-dot online"></div>
      </div>
      <span class="member-name blue-text">${escapeHTML(savedUsername)}</span>
    </div>
  `;
}
updateMembersList();

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('waves_token');
  localStorage.removeItem('waves_username');
  localStorage.removeItem('waves_pfp');
  window.location.href = 'login.html';
});

const socket = io('http://localhost:3000');
const messageContainer = document.getElementById('messageContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const channelItems = document.querySelectorAll('.channel-item');
const chatTitle = document.getElementById('chatTitle');

let currentChannelId = 'general';
socket.emit('joinChannel', currentChannelId);

socket.on('receiveMessage', (data) => {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message';
  
  const userPfp = data.pfp || defaultPfp;
  
  msgDiv.innerHTML = `
    <div class="avatar">
      <img src="${userPfp}" alt="pfp">
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="msg-username">${escapeHTML(data.username)}</span>
        <span class="msg-timestamp">${data.timestamp}</span>
      </div>
      <div class="msg-text">${escapeHTML(data.text)}</div>
    </div>
  `;
  
  messageContainer.appendChild(msgDiv);
  messageContainer.scrollTop = messageContainer.scrollHeight;
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  socket.emit('sendMessage', {
    channelId: currentChannelId,
    username: savedUsername,
    pfp: savedPfp || defaultPfp,
    text: text
  });
  messageInput.value = '';
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

channelItems.forEach(item => {
  item.addEventListener('click', () => {
    channelItems.forEach(c => c.classList.remove('active'));
    item.classList.add('active');
    
    socket.emit('leaveChannel', currentChannelId);
    
    currentChannelId = item.dataset.channel;
    chatTitle.innerText = currentChannelId;
    messageContainer.innerHTML = ''; 
    
    socket.emit('joinChannel', currentChannelId);
  });
});

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
