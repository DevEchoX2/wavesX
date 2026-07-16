document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('waves_token', data.token);
      localStorage.setItem('waves_username', data.username);
      localStorage.setItem('waves_pfp', data.pfpUrl);
      window.location.href = 'chat.html'; 
    } else {
      alert(data.error);
    }
  } catch (err) {
    alert('Failed to connect to the accounts server.');
  }
});
