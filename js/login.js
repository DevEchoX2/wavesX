const firebaseConfig = {
  apiKey: "YOUR_SECRET_API_KEY_FROM_FIREBASE",
  authDomain: "wavesaccount1.firebaseapp.com",
  databaseURL: "https://wavesaccount1-default-rtdb.firebaseio.com",
  projectId: "wavesaccount1",
  storageBucket: "wavesaccount1.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const loginForm = document.getElementById('loginForm');

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
      alert("Login failed: " + error.message);
    });
});
