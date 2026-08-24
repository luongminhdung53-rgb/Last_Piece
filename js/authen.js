// Simple helper script for authentication pages

document.addEventListener('DOMContentLoaded', () => {
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');

  // Handle Sign In submission
  if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('signin-email').value;
      const password = document.getElementById('signin-password').value;

      if (email && password) {
        // Save current user to local storage
        localStorage.setItem('currentUser', JSON.stringify({ email: email }));
        alert('Successfully signed in!');
        window.location.href = 'Website.html';
      }
    });
  }

  // Handle Sign Up submission
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('signup-fullname').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;

      if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
      }

      // Save user profile info
      const userData = { name: name, email: email };
      localStorage.setItem('currentUser', JSON.stringify(userData));

      alert('Account created successfully!');
      window.location.href = 'Sign_in.html';
    });
  }
});