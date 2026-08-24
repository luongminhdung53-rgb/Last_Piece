window.onload = function() {
  // Check if a user is currently signed in
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const authContainer = document.getElementById('nav-auth-container');

  if (currentUser && authContainer) {
    // Determine short name display
    const userName = currentUser.name ? currentUser.name.split(' ')[0] : 'Profile';

    // Replace the Sign In button with a Profile link
    authContainer.innerHTML = `
      <a href="profile.html" id="button" style="background-color: #d4a853; color: #3b240b;">
        👤 ${userName}
      </a>
    `;
  }
};