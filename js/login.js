import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const accountsConfig = {
  apiKey: "AIzaSyAjMo4HNBaI9whVizVnAewzLskHatwaNJc",
  authDomain: "wavesaccount1.firebaseapp.com",
  projectId: "wavesaccount1",
  storageBucket: "wavesaccount1.firebasestorage.app",
  messagingSenderId: "467588850012",
  appId: "1:467588850012:web:9fd187d75331cc24946199",
  measurementId: "G-GQV8LJM23E"
};

const chatConfig = {
  apiKey: "AIzaSyAT9SKJO8pHVBtpma293HL6O6fUPC41hq8",
  authDomain: "waveschat1.firebaseapp.com",
  databaseURL: "https://waveschat1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "waveschat1",
  storageBucket: "waveschat1.firebasestorage.app",
  messagingSenderId: "798003715584",
  appId: "1:798003715584:web:3199c464651728b51d42e5",
  measurementId: "G-0QJZXX13KL"
};

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
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          localStorage.setItem('waves_currentUser', JSON.stringify(userData));
          window.location.href = '../index.html';
        } else {
          alert("User profile not found in database.");
        }
      });
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
});
