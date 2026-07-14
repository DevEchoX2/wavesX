import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";
import { accountsConfig, chatConfig } from '/js/firebase-config.js';

const accountsApp = initializeApp(accountsConfig);
const auth = getAuth(accountsApp);

const chatApp = initializeApp(chatConfig, "ChatApp");
const db = getDatabase(chatApp);

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

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;
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
    window.location.href = '../index.html';
  });
}
