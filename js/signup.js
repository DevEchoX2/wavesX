const colors = [
  '#eb4034', '#e89e3a', '#e8d73a', '#4ce83a', '#3a9ee8', '#9e3ae8', '#e83ab8',
  '#ff99c2', '#40e0d0', '#ff7f50', '#6495ed', '#ffbf00', '#00ff7f', '#dc143c'
];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
const signupForm = document.getElementById('signupForm');

if (signupForm) {
  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const imageFile = document.getElementById('profileImage').files[0];

    if (!username || !email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('waves_users') || '{}');
    if (storedUsers[email]) {
      alert('That email is already registered. Try logging in instead.');
      return;
    }

    const userColor = getRandomColor();

    const finishSignup = (photoURL = null) => {
      const newUserProfile = {
        name: username,
        email,
        password,
        color: userColor,
        uid: crypto.randomUUID ? crypto.randomUUID() : `user-${Date.now()}`,
        photoURL
      };

      storedUsers[email] = newUserProfile;
      localStorage.setItem('waves_users', JSON.stringify(storedUsers));
      localStorage.setItem('waves_currentUser', JSON.stringify(newUserProfile));
      window.location.href = 'chat.html';
    };

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => finishSignup(reader.result);
      reader.readAsDataURL(imageFile);
    } else {
      finishSignup(null);
    }
  });
}
