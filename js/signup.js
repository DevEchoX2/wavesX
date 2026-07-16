const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('waves_token', data.token);
      localStorage.setItem('waves_username', data.username);
      localStorage.setItem('waves_pfp', data.pfpUrl || '');
      window.location.href = 'chat.html';
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Could not connect to server.");
  }
});
