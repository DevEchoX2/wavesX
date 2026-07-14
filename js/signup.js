import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, getIdToken, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import { accountsConfig, chatConfig } from '/js/firebase-config.js';

const apps = getApps();
const accountsApp = apps.find(a => a.name === 'AccountsApp') || initializeApp(accountsConfig, 'AccountsApp');
const chatApp = apps.find(a => a.name === 'ChatApp') || initializeApp(chatConfig, 'ChatApp');
const accountsAuth = getAuth(accountsApp);
const chatAuth = getAuth(chatApp);
const db = getDatabase(chatApp);

const TOKEN_EXCHANGE_URL = '/token-exchange';

const colors = [
  '#eb4034', '#e89e3a', '#e8d73a', '#4ce83a', '#3a9ee8', '#9e3ae8', '#e83ab8',
  '#ff99c2', '#40e0d0', '#ff7f50', '#6495ed', '#ffbf00', '#00ff7f', '#dc143c'
];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const imageFile = document.getElementById('profileImage').files[0];

  createUserWithEmailAndPassword(accountsAuth, email, password)
    .then((userCredential) => getIdToken(userCredential.user))
    .then((idToken) => fetch(TOKEN_EXCHANGE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }))
    .then((res) => res.ok ? res.json() : Promise.reject(new Error('Token exchange failed')))
    .then((data) => signInWithCustomToken(chatAuth, data.customToken))
    .then(() => {
      const uid = chatAuth.currentUser.uid;
      const userColor = getRandomColor();

      if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          saveUserData(uid, username, userColor, base64String);
        };
        reader.readAsDataURL(imageFile);
      } else {
        saveUserData(uid, username, userColor, null);
      }
    })
    .catch((error) => {
      if (error && error.code === 'auth/email-already-in-use') {
        alert('That email is already in use. Try logging in instead.');
        return;
      }
      alert('Sign up failed: ' + error.message);
    });
});

function saveUserData(uid, username, color, photoURL) {
  const newUserProfile = {
    name: username,
    color: color,
    uid: uid,
    photoURL: photoURL
  };

  const userRef = ref(db, 'users/' + uid);
  set(userRef, newUserProfile).then(() => {
    localStorage.setItem('waves_currentUser', JSON.stringify(newUserProfile));
    window.location.href = 'chat.html';
  });
}
