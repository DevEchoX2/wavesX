const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const storedUsers = JSON.parse(localStorage.getItem('waves_users') || '{}');
    const user = storedUsers[email];

    if (user && user.password === password) {
      localStorage.setItem('waves_currentUser', JSON.stringify(user));
      window.location.href = 'chat.html';
    } else {
      alert('No matching local account was found. Please sign up first.');
    }
  });
}
