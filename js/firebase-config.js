import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD7oRlG6B7Aj6bs12cHhtcR6TU5VpdFDk8",
  authDomain: "jsi-project-eff8f.firebaseapp.com",
  projectId: "jsi-project-eff8f",
  storageBucket: "jsi-project-eff8f.firebasestorage.app",
  messagingSenderId: "512564600436",
  appId: "1:512564600436:web:54c75dd5359ecf036d3b21"
};

// Initialize Firebase
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