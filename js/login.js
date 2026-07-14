import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import { accountsConfig, chatConfig } from '/js/firebase-config.js';

const accountsApp = initializeApp(accountsConfig);
const auth = getAuth(accountsApp);

const chatApp = initializeApp(chatConfig, "ChatApp");
const db = getDatabase(chatApp);

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
      if (snapshot.exists()) {
        const userData = snapshot.val();
        localStorage.setItem('waves_currentUser', JSON.stringify(userData));
        window.location.href = '../index.html';
      } else {
        alert('User profile not found in database.');
      }
    })
    .catch((error) => {
      alert('Login failed: ' + error.message);
    });
});
