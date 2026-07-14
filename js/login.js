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

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;
      
      db.ref('users/' + uid).once('value').then((snapshot) => {
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
      if (error.code === 'auth/user-not-found') {
        alert("No account found with that email. Please sign up first.");
      } else if (error.code === 'auth/wrong-password') {
        alert("Incorrect password. Please try again.");
      } else {
        alert("Login failed: " + error.message);
      }
    });
  });
}
