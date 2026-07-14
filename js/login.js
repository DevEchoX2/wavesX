import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import { chatConfig } from '/js/firebase-config.js';

const app = getApps().length === 0 ? initializeApp(chatConfig) : getApps()[0];
const auth = getAuth(app);
const db = getDatabase(app);

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;
      const userRef = ref(db, 'users/' + uid);
      return get(userRef);
    })
    .then((snapshot) => {
      if (snapshot && snapshot.exists()) {
        const userData = snapshot.val();
        localStorage.setItem('waves_currentUser', JSON.stringify(userData));
        window.location.href = 'chat.html';
      } else {
        // If profile not found, proceed with auth-only login but inform the user
        const fallback = { name: 'User', uid: auth.currentUser.uid, color: '#888888', photoURL: null };
        localStorage.setItem('waves_currentUser', JSON.stringify(fallback));
        alert('Logged in, but user profile was not found. Some features may be limited.');
        window.location.href = 'chat.html';
      }
    })
    .catch((error) => {
      // Handle permission errors from Realtime Database separately
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
