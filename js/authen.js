document.addEventListener('DOMContentLoaded', () => {
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');

  function getRegisteredUsers() {
    return JSON.parse(localStorage.getItem('registeredUsers')) || [];
  }

  // Handle Sign In
  if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('signin-email').value.trim();
      const passwordInput = document.getElementById('signin-password').value;

      const registeredUsers = getRegisteredUsers();

      // Find user matching the entered email
      const existingUser = registeredUsers.find(
        (user) => user.email.toLowerCase() === emailInput.toLowerCase()
      );

      if (existingUser) {
        // Verify password
        if (existingUser.password !== passwordInput) {
          alert('Incorrect password. Please try again.');
          return;
        }

        // Set as active logged in user with all saved account details
        localStorage.setItem('currentUser', JSON.stringify(existingUser));
        alert(`Welcome back, ${existingUser.name}!`);
        window.location.href = 'Website.html';
      } else {
        // Fallback for new sign-in attempts without a prior sign-up
        const fallbackUser = {
          name: emailInput.split('@')[0], // Generate default name from email prefix
          email: emailInput,
          password: passwordInput,
          phone: '',
          address: ''
        };

        // Save to users list and set as current active user
        registeredUsers.push(fallbackUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
        window.location.href = 'Website.html';
      }
    });
  }

  // Handle Sign Up
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('signup-fullname').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;

      if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
      }

      const registeredUsers = getRegisteredUsers();

      const userExists = registeredUsers.some(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );

      if (userExists) {
        alert('An account with this email already exists. Please sign in.');
        window.location.href = 'Sign_in.html';
        return;
      }
      
      const newUser = {
        name: name,
        email: email,
        password: password,
        phone: '',
        address: ''
      };

      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      window.location.href = 'Website.html';
    });
  }
});