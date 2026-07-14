import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import { accountsConfig, chatConfig } from '/js/firebase-config.js';
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, getIdToken, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const apps = getApps();
const accountsApp = apps.find(a => a.name === 'AccountsApp') || initializeApp(accountsConfig, 'AccountsApp');
const chatApp = apps.find(a => a.name === 'ChatApp') || initializeApp(chatConfig, 'ChatApp');
const accountsAuth = getAuth(accountsApp);
const chatAuth = getAuth(chatApp);
const db = getDatabase(chatApp);

const TOKEN_EXCHANGE_URL = '/token-exchange';

const app = getApps().length === 0 ? initializeApp(chatConfig) : getApps()[0];
const auth = getAuth(app);
const db = getDatabase(app);

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(accountsAuth, email, password)
    .then((userCredential) => getIdToken(userCredential.user))
    .then((idToken) => fetch(TOKEN_EXCHANGE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }))
    .then((res) => res.ok ? res.json() : Promise.reject(new Error('Token exchange failed')))
    .then((data) => signInWithCustomToken(chatAuth, data.customToken))
    .then(() => {
      const uid = chatAuth.currentUser.uid;
      const userRef = ref(db, 'users/' + uid);
      return get(userRef);
    })
    .then((snapshot) => {
      if (snapshot && snapshot.exists()) {
        const userData = snapshot.val();
        localStorage.setItem('waves_currentUser', JSON.stringify(userData));
        window.location.href = 'chat.html';
      } else {
        const fallback = { name: 'User', uid: chatAuth.currentUser.uid, color: '#888888', photoURL: null };
        localStorage.setItem('waves_currentUser', JSON.stringify(fallback));
        alert('Logged in, but user profile was not found. Some features may be limited.');
        window.location.href = 'chat.html';
      }
    })
    .catch((error) => {
      if (error && error.code && error.code.includes('permission-denied')) {
        const uid = auth.currentUser ? auth.currentUser.uid : null;
        const fallback = { name: 'User', uid: uid, color: '#888888', photoURL: null };
        localStorage.setItem('waves_currentUser', JSON.stringify(fallback));
        alert('Logged in, but database read was denied by rules. Proceeding with limited access.');
        window.location.href = 'chat.html';
        return;
      }
      alert('Login failed: ' + error.message);
    });
});
