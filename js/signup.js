const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

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
        const storageRef = storage.ref(`profiles/${uid}`);
        storageRef.put(imageFile).then((snapshot) => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            saveUserData(uid, username, userColor, downloadURL);
          });
        }).catch(err => {
          alert("Image upload failed: " + err.message);
          saveUserData(uid, username, userColor, null);
        });
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
