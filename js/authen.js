import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  console.log("Authen.js loaded and DOM fully parsed.");

  // If user is already logged in, redirect straight to Website.html
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Active session detected for:", user.email);
      window.location.href = 'Website.html';
    }
  });

  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');

  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log("Sign-in form submitted.");

      const emailInput = document.getElementById('signin-email').value.trim();
      const passwordInput = document.getElementById('signin-password').value;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        console.log("Sign-in successful for:", userCredential.user.email);
        window.location.href = 'Website.html';
      } catch (error) {
        console.error("Sign In Error code:", error.code, "Message:", error.message);
        alert(`Sign in failed: ${error.message}`);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log("Sign-up form submitted.");

      const name = document.getElementById('signup-fullname').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;

      if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
      }

      try {
        console.log("Attempting to create user in Firebase Auth...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User successfully created in Firebase Auth! UID:", user.uid);

        await updateProfile(user, { displayName: name });
        console.log("Display name updated successfully.");

        // Separate try/catch for Firestore so a rule failure doesn't block Auth
        try {
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            phone: '',
            address: '',
            createdAt: new Date().toISOString()
          });
          console.log("Firestore user document created.");

          await setDoc(doc(db, "carts", user.uid), { items: [] });
          console.log("Firestore cart document created.");
        } catch (firestoreError) {
          console.error("Firestore database write warning (Check security rules):", firestoreError);
        }

        alert('Account created successfully!');
        window.location.href = 'Website.html';
      } catch (error) {
        console.error("Sign Up Error code:", error.code, "Message:", error.message);
        alert(`Sign up failed: ${error.message}`);
      }
    });
  }
});