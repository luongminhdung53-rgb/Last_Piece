import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  // Redirect immediately if user already has an active session
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = 'Website.html';
    }
  });

  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');

  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('signin-email').value.trim();
      const passwordInput = document.getElementById('signin-password').value;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        const user = userCredential.user;
        alert(`Welcome back, ${user.displayName || user.email}!`);
        window.location.href = 'Website.html';
      } catch (error) {
        console.error("Sign In Error:", error);
        alert(`Sign in failed: ${error.message}`);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('signup-fullname').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;

      if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        // Create user profile document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: name,
          email: email,
          phone: '',
          address: '',
          createdAt: new Date().toISOString()
        });

        // Initialize empty Firestore cart
        await setDoc(doc(db, "carts", user.uid), { items: [] });

        alert('Account created successfully!');
        window.location.href = 'Website.html';
      } catch (error) {
        console.error("Sign Up Error:", error);
        alert(`Sign up failed: ${error.message}`);
      }
    });
  }
});