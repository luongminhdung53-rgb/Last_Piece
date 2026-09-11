document.addEventListener('DOMContentLoaded', () => {
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');

  function getRegisteredUsers() {
    return JSON.parse(localStorage.getItem('registeredUsers')) || [];
  }

  if (signinForm) {
    signinForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('signin-email').value.trim();
      const passwordInput = document.getElementById('signin-password').value;

      const registeredUsers = getRegisteredUsers();

      const existingUser = registeredUsers.find(
        (user) => user.email.toLowerCase() === emailInput.toLowerCase()
      );

      if (existingUser) {

        if (existingUser.password !== passwordInput) {
          alert('Incorrect password. Please try again.');
          return;
        }
        localStorage.setItem('currentUser', JSON.stringify(existingUser));
        alert(`Welcome back, ${existingUser.name}!`);
        window.location.href = 'Website.html';
      } else {

        const fallbackUser = {
          name: emailInput.split('@')[0],
          email: emailInput,
          password: passwordInput,
          phone: '',
          address: ''
        };
        registeredUsers.push(fallbackUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
        window.location.href = 'Website.html';
      }
    });
  }

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