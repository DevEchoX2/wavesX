import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { chatConfig } from '/js/firebase-config.js';

const app = getApps().length === 0 ? initializeApp(chatConfig) : getApps()[0];
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  const loginBtn = document.querySelector(".panelBtn[onclick*='pages/login.html']");
  if (!loginBtn) return;
  if (user) {
    loginBtn.innerHTML = `
      <span class="material-symbols-outlined">person</span>
      <span class="label">Account</span>
    `;
    loginBtn.onclick = () => { window.location.href = 'pages/chat.html'; };
  } else {
    loginBtn.innerHTML = `
      <span class="material-symbols-outlined">person</span>
      <span class="label">Login</span>
    `;
    loginBtn.onclick = () => { window.location.href = 'pages/login.html'; };
  }
});
