import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Runs once the sign-in / sign-up HTML page finishes loading
document.addEventListener('DOMContentLoaded', () => {
  console.log("Authen.js loaded and DOM fully parsed.");

  // If the user is already signed in, skip the login screen and go straight to index.html
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Active session detected for:", user.email);
      window.location.href = 'index.html';
    }
  });

  // Grab the sign-in and sign-up <form> elements from the page
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');

  // ============================================================================
  // [READS USER INPUT & AUTHENTICATES] Handles existing user sign-in
  // ============================================================================
  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log("Sign-in form submitted.");

      // Read email and password typed into the sign-in inputs
      const emailInput = document.getElementById('signin-email').value.trim();
      const passwordInput = document.getElementById('signin-password').value;

      try {
        // Verify credentials and redirect to the main store page
        const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        console.log("Sign-in successful for:", userCredential.user.email);
        window.location.href = 'index.html';
      } catch (error) {
        console.error("Sign In Error code:", error.code, "Message:", error.message);
        alert(`Sign in failed: ${error.message}`);
      }
    });
  }

  // ============================================================================
  // [WRITES NEW DATA TO FIRESTORE] Creates a new account, profile doc, and empty cart
  // ============================================================================
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log("Sign-up form submitted.");

      // Read all fields from the registration form
      const name = document.getElementById('signup-fullname').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;

      // Stop early if the two password boxes don't match
      if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
      }

      try {
        console.log("Attempting to create user in Firebase Auth...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User successfully created in Firebase Auth! UID:", user.uid);

        // Save the user's full name onto their Auth profile
        await updateProfile(user, { displayName: name });
        console.log("Display name updated successfully.");

        // Separate try/catch for Firestore so a rule failure doesn't block Auth
        try {
          // Create the user's profile document at "users/{uid}"
          await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            phone: '',
            address: '',
            createdAt: new Date().toISOString()
          });
          console.log("Firestore user document created.");

          // Create an empty cart document at "carts/{uid}" for this new user
          await setDoc(doc(db, "carts", user.uid), { items: [] });
          console.log("Firestore cart document created.");
        } catch (firestoreError) {
          console.error("Firestore database write warning (Check security rules):", firestoreError);
        }

        alert('Account created successfully!');
        window.location.href = 'index.html';
      } catch (error) {
        console.error("Sign Up Error code:", error.code, "Message:", error.message);
        alert(`Sign up failed: ${error.message}`);
      }
    });
  }
});