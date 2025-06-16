document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('errorMsg');

  if (!email || !password) {
    errorMsg.textContent = 'Please fill out both fields.';
    return;
  }

  // You can integrate Google OAuth or backend auth here later.
  errorMsg.textContent = '';
  alert(`Logging in as: ${email}`);
});
