const socket = io('http://localhost:3000');

const currentUser = localStorage.getItem('waves_username');
const currentPfp = localStorage.getItem('waves_pfp');

if (!currentUser) {
  window.location.href = 'login.html';
}

let currentChannel = 'general';
const chatDisplay = document.getElementById('chat-display');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const channelButtons = document.querySelectorAll('.channel-btn');

socket.emit('joinChannel', currentChannel);

if (channelButtons) {
  channelButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      socket.emit('leaveChannel', currentChannel);
      currentChannel = e.target.dataset.channel || e.target.id;
      chatDisplay.innerHTML = '';
      socket.emit('joinChannel', currentChannel);
    });
  });
}

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

if (sendButton) {
  sendButton.addEventListener('click', sendMessage);
}

if (messageInput) {
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

socket.on('receiveMessage', (data) => {
  if (!chatDisplay) return;
  
  const msgElement = document.createElement('div');
  msgElement.className = 'message';
  msgElement.innerHTML = `
    <img src="${data.pfp}" alt="pfp" class="message-pfp" style="width: 40px; height: 40px; border-radius: 50%;">
    <div class="message-content">
      <strong>${data.username}</strong> <span class="timestamp" style="font-size: 0.8em; color: gray;">${data.timestamp}</span>
      <p>${data.text}</p>
    </div>
  `;
  
  chatDisplay.appendChild(msgElement);
  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});
