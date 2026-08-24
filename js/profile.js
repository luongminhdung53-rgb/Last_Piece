// Easy Profile JavaScript Logic

document.addEventListener('DOMContentLoaded', () => {
  // Load current saved user data from local storage
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
    name: "Guitarist Player",
    email: "player@guitarent.com",
    phone: "",
    address: ""
  };

  // UI Elements
  const nameInput = document.getElementById('profile-fullname');
  const emailInput = document.getElementById('profile-email');
  const phoneInput = document.getElementById('profile-phone');
  const addressInput = document.getElementById('profile-address');
  const displayName = document.getElementById('display-name');
  const displayEmail = document.getElementById('display-email');
  const avatarInitials = document.getElementById('avatar-initials');
  const profileForm = document.getElementById('profile-form');
  const logoutBtn = document.getElementById('logout-btn');

  // Populate UI with user data
  function loadUserProfile() {
    nameInput.value = currentUser.name || "";
    emailInput.value = currentUser.email || "";
    phoneInput.value = currentUser.phone || "";
    addressInput.value = currentUser.address || "";

    displayName.textContent = currentUser.name || "Guitarist";
    displayEmail.textContent = currentUser.email || "user@guitarent.com";

    // Get initials for avatar icon
    if (currentUser.name) {
      avatarInitials.textContent = currentUser.name.charAt(0).toUpperCase();
    }
  }

  // Save profile modifications
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    currentUser.name = nameInput.value;
    currentUser.email = emailInput.value;
    currentUser.phone = phoneInput.value;
    currentUser.address = addressInput.value;

    // Save updated info back to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    loadUserProfile();
    alert("Profile saved successfully!");
  });

  // Handle Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    alert("Signed out successfully.");
    window.location.href = 'Website.html';
  });

  // Initial load
  loadUserProfile();
});