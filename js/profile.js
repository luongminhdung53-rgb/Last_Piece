window.onload = function () {
  // Read saved profile
  let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
    name: 'Guitarist Player',
    email: 'player@guitarent.com',
    phone: '',
    address: ''
  };

  // Get HTML elements
  const nameInput = document.getElementById('profile-fullname');
  const emailInput = document.getElementById('profile-email');
  const phoneInput = document.getElementById('profile-phone');
  const addressInput = document.getElementById('profile-address');
  const displayName = document.getElementById('display-name');
  const displayEmail = document.getElementById('display-email');
  const avatarInitials = document.getElementById('avatar-initials');
  const profileForm = document.getElementById('profile-form');
  const logoutBtn = document.getElementById('logout-btn');

  // Load values into UI
  if (nameInput) nameInput.value = currentUser.name || '';
  if (emailInput) emailInput.value = currentUser.email || '';
  if (phoneInput) phoneInput.value = currentUser.phone || '';
  if (addressInput) addressInput.value = currentUser.address || '';
  if (displayName) displayName.textContent = currentUser.name || 'Guitarist';
  if (displayEmail) displayEmail.textContent = currentUser.email || 'user@guitarent.com';
  if (avatarInitials && currentUser.name) avatarInitials.textContent = currentUser.name.charAt(0).toUpperCase();

  if (profileForm) {
    profileForm.onsubmit = function (e) {
      e.preventDefault();

      const oldEmail = currentUser.email;

      currentUser.name = nameInput.value;
      currentUser.email = emailInput.value;
      currentUser.phone = phoneInput.value;
      currentUser.address = addressInput.value;

      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
      const userIndex = registeredUsers.findIndex((u) => u.email === oldEmail || u.email === currentUser.email);

      if (userIndex !== -1) {
        registeredUsers[userIndex] = { ...registeredUsers[userIndex], ...currentUser };
      } else {
        registeredUsers.push(currentUser);
      }
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

      displayName.textContent = currentUser.name;
      displayEmail.textContent = currentUser.email;
      avatarInitials.textContent = currentUser.name.charAt(0).toUpperCase();

      alert('Profile updated successfully!');
      window.location.href = 'Website.html';
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = function () {
      localStorage.removeItem('currentUser');
      alert('Signed out successfully.');
      window.location.href = 'Website.html';
    };
  }
};