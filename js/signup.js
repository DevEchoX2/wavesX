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
      alert("Sign up failed: " + error.message);
    });
});

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
