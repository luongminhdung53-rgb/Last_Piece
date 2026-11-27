import { auth, handleLogout } from './firebase-config.js';
import { onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Runs once profile.html finishes loading
document.addEventListener('DOMContentLoaded', () => {
  // Guard profile page: redirect to sign in if not authenticated
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'Sign_in.html';
      return;
    }

    // [GETS USER DATA] Read the signed-in user's name and email from their session
    const fullName = user.displayName || 'Guitarist';
    const email = user.email || 'user@guitarent.com';

    // Locate the form inputs, headings, and avatar circle on profile.html
    const nameInput = document.getElementById('profile-fullname');
    const emailInput = document.getElementById('profile-email');
    const displayName = document.getElementById('display-name');
    const displayEmail = document.getElementById('display-email');
    const avatarInitials = document.getElementById('avatar-initials');

    // [PUTS DATA OUT TO WEBSITE] Fill the profile inputs, display headers, and initial icon
    if (nameInput) nameInput.value = fullName;
    if (emailInput) {
      emailInput.value = email;
      emailInput.readOnly = true;
    }
    if (displayName) displayName.textContent = fullName;
    if (displayEmail) displayEmail.textContent = email;
    if (avatarInitials) avatarInitials.textContent = fullName.charAt(0).toUpperCase();

    // Update Cart Badge from localStorage
    updateCartBadge();

    // [SAVES UPDATED NAME & DISPLAYS IT] Handles saving changes when the profile form is submitted
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = nameInput.value.trim();

        try {
          await updateProfile(user, { displayName: newName });
          // Immediately update the displayed name and avatar letter on the page
          if (displayName) displayName.textContent = newName;
          if (avatarInitials) avatarInitials.textContent = newName.charAt(0).toUpperCase();
          alert('Profile updated successfully!');
        } catch (error) {
          console.error("Profile update failed:", error);
          alert("Failed to update profile: " + error.message);
        }
      });
    }

    // Logout Button Handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  });
});

// ============================================================================
// [PUTS DATA OUT TO WEBSITE] Reads localStorage cart and updates #cart-count
// ============================================================================
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('guitarentCart')) || [];
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = totalQty;
}