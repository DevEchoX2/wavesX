const messageContainer = document.getElementById('messageContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const membersList = document.getElementById('membersList');
const channelItems = document.querySelectorAll('.channel-item');
const chatHeader = document.getElementById('chatHeader');

let socket;
let currentChannelId = 'general';

function connectWebSocket() {

}

function renderMessage(data) {
  const { id, user, text, timestamp, roles = [] } = data;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'message';
  msgDiv.dataset.id = id;

  const roleTagsHTML = roles.map(role => {
    const color = role.color || '#fff';
    const borderColor = role.color ? `${role.color}40` : '#444';
    return `<span class="role-tag" style="color: ${color}; border-color: ${borderColor}">${role.name}</span>`;
  }).join('');

  msgDiv.innerHTML = `
    <div class="avatar">
      <img src="${user.avatarUrl || 'default-avatar.png'}" alt="Avatar">
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="username" style="color: ${user.color || '#fff'}">${user.name}</span>
        ${roleTagsHTML}
        <span class="timestamp">${timestamp}</span>
      </div>
      <div class="message-text">${escapeHTML(text)}</div>
    </div>
  `;

  messageContainer.appendChild(msgDiv);
  scrollToBottom();
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  messageInput.value = '';
}

channelItems.forEach(item => {
  item.addEventListener('click', () => {
    channelItems.forEach(c => c.classList.remove('active'));
    item.classList.add('active');
    
    currentChannelId = item.dataset.channel;
    chatHeader.innerText = `# ${currentChannelId}`;
    messageContainer.innerHTML = ''; 
  });
});

function loadChannels() {

}

function loadMembers() {

}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

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
