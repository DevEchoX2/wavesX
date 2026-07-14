import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { accountsConfig } from '/js/firebase-config.js';

// Initialize a named accounts app so other modules can initialize their own apps
const apps = getApps();
const accountsApp = apps.find(a => a.name === 'AccountsApp') || initializeApp(accountsConfig, 'AccountsApp');
const auth = getAuth(accountsApp);

// Update landing page login button label based on auth state, without redirecting
onAuthStateChanged(auth, (user) => {
  const loginBtn = document.querySelector(".panelBtn[onclick*='pages/login.html']");
  if (!loginBtn) return;

  if (user) {
    // show Account / Profile (does not force chat)
    loginBtn.innerHTML = `
      <span class="material-symbols-outlined">person</span>
      <span class="label">Account</span>
    `;
    loginBtn.onclick = () => { window.location.href = 'pages/chat.html'; };
  } else {
    // show Login
    loginBtn.innerHTML = `
      <span class="material-symbols-outlined">person</span>
      <span class="label">Login</span>
    `;
    loginBtn.onclick = () => { window.location.href = 'pages/login.html'; };
  }
});
