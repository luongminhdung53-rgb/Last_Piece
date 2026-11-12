import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TODO: Replace with your actual Firebase Project Configuration from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Global Auth Guard: Forces login before accessing protected pages
export function requireAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'Sign_in.html';
      return;
    }

    // Update Navbar Profile Button
    const authContainer = document.getElementById('nav-auth-container');
    if (authContainer) {
      const displayName = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
      authContainer.innerHTML = `
        <a href="profile.html" id="button" style="background-color: #d4a853; color: #3b240b;">
          ${displayName}
        </a>
      `;
    }

    // Update Global Cart Badge from Firestore
    await syncCartBadge(user.uid);

    if (callback) callback(user);
  });
}

export async function syncCartBadge(uid) {
  const cartCountEl = document.getElementById('cart-count');
  if (!cartCountEl) return;

  try {
    const cartRef = doc(db, "carts", uid);
    const cartSnap = await getDoc(cartRef);
    const items = cartSnap.exists() ? (cartSnap.data().items || []) : [];
    const total = items.reduce((sum, item) => sum + item.quantity, 0);
    cartCountEl.textContent = total;
  } catch (error) {
    console.error("Failed to sync cart count:", error);
  }
}

export async function handleLogout() {
  try {
    await signOut(auth);
    alert('Signed out successfully.');
    window.location.href = 'Sign_in.html';
  } catch (error) {
    console.error("Logout failed:", error);
    alert('Error signing out: ' + error.message);
  }
}