const accountsConfig = {
  apiKey: "AIzaSyAjMo4HNBaI9whVizVnAewzLskHatwaNJc",
  authDomain: "wavesaccount1.firebaseapp.com",
  projectId: "wavesaccount1",
  storageBucket: "wavesaccount1.firebasestorage.app",
  messagingSenderId: "467588850012",
  appId: "1:467588850012:web:3e9c3acd6f9858b1946199"
};

const chatConfig = {
  apiKey: "AIzaSyAT9SKJO8pHVBtpma293HL6O6fUPC41hq8",
  authDomain: "waveschat1.firebaseapp.com",
  databaseURL: "https://waveschat1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "waveschat1",
  storageBucket: "waveschat1.firebasestorage.app",
  messagingSenderId: "798003715584",
  appId: "1:798003715584:web:c76900f4600316791d42e5"
};

const accountsApp = firebase.apps.find(app => app.name === '[DEFAULT]') || firebase.initializeApp(accountsConfig);
const auth = accountsApp.auth();

const chatApp = firebase.apps.find(app => app.name === 'ChatApp') || firebase.initializeApp(chatConfig, 'ChatApp');
const db = chatApp.database();

const colors = [
  '#eb4034', '#e89e3a', '#e8d73a', '#4ce83a', '#3a9ee8', '#9e3ae8', '#e83ab8', 
  '#ff99c2', '#40e0d0', '#ff7f50', '#6495ed', '#ffbf00', '#00ff7f', '#dc143c'
];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

const signupForm = document.getElementById('signupForm');

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const imageFile = document.getElementById('profileImage').files[0];

  auth.createUserWithEmailAndPassword(email, password)
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
      if (error.code === 'auth/email-already-in-use') {
        alert("That email is already registered. Please log in instead.");
      } else {
        alert("Sign up failed: " + error.message);
      }
    });
  });
}

function saveUserData(uid, username, color, photoURL) {
  const newUserProfile = {
    name: username,
    color: color,
    uid: uid,
    photoURL: photoURL
  };

  db.ref('users/' + uid).set(newUserProfile).then(() => {
    localStorage.setItem('waves_currentUser', JSON.stringify(newUserProfile));
    window.location.href = '../index.html';
  });
}
