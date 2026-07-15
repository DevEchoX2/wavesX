const signupForm = document.getElementById('signupForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const pfpInput = document.getElementById('pfp');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const pfpFile = pfpInput.files[0];

  if (!username || !email || !password) {
    return;
  }

  const formData = new FormData();
  formData.append('username', username);
  formData.append('email', email);
  formData.append('password', password);
  
  if (pfpFile) {
    formData.append('pfp', pfpFile);
  }

  try {
    const response = await fetch('', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();
    window.location.href = 'chat.html';

  } catch (error) {

  }
});

function validateForm(username, email, password) {
  
}

function handleSignupError(error) {
  
}
