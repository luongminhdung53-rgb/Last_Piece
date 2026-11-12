import { db, requireAuth, handleLogout } from './firebase-config.js';
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;

requireAuth(async (user) => {
  currentUser = user;
  await loadUserProfile(user);
  await loadUserOrders(user.uid);
});

async function loadUserProfile(user) {
  const nameInput = document.getElementById('profile-fullname');
  const emailInput = document.getElementById('profile-email');
  const phoneInput = document.getElementById('profile-phone');
  const addressInput = document.getElementById('profile-address');
  const displayName = document.getElementById('display-name');
  const displayEmail = document.getElementById('display-email');
  const avatarInitials = document.getElementById('avatar-initials');

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const fullName = userData.name || user.displayName || 'Guitarist';
    const email = user.email || userData.email || '';

    if (nameInput) nameInput.value = fullName;
    if (emailInput) {
      emailInput.value = email;
      emailInput.readOnly = true;
    }
    if (phoneInput) phoneInput.value = userData.phone || '';
    if (addressInput) addressInput.value = userData.address || '';

    if (displayName) displayName.textContent = fullName;
    if (displayEmail) displayEmail.textContent = email;
    if (avatarInitials && fullName) {
      avatarInitials.textContent = fullName.charAt(0).toUpperCase();
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
  }
}

async function loadUserOrders(uid) {
  const ordersList = document.getElementById('orders-list');
  if (!ordersList) return;

  try {
    const ordersRef = collection(db, "users", uid, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      ordersList.innerHTML = '<p class="no-orders">No recent guitar rentals or purchases yet.</p>';
      return;
    }

    ordersList.innerHTML = snapshot.docs.map(docSnap => {
      const order = docSnap.data();
      const dateStr = new Date(order.createdAt).toLocaleDateString();
      const summary = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
      return `
        <div class="order-item">
          <div>
            <strong>${summary}</strong>
            <div style="font-size: 12px; color: gray;">Ordered on ${dateStr}</div>
          </div>
          <div style="font-weight: bold; color: #5a3b1a;">$${Number(order.total).toLocaleString()}</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error("Error loading orders:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profile-form');
  const logoutBtn = document.getElementById('logout-btn');

  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser) return;

      const nameInput = document.getElementById('profile-fullname').value.trim();
      const phoneInput = document.getElementById('profile-phone').value.trim();
      const addressInput = document.getElementById('profile-address').value.trim();

      try {
        await updateProfile(currentUser, { displayName: nameInput });

        await setDoc(doc(db, "users", currentUser.uid), {
          uid: currentUser.uid,
          name: nameInput,
          email: currentUser.email,
          phone: phoneInput,
          address: addressInput
        }, { merge: true });

        alert('Profile updated successfully!');
        window.location.href = 'Website.html';
      } catch (error) {
        console.error("Profile update failed:", error);
        alert("Failed to update profile: " + error.message);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});