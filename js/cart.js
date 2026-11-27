import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Holds the items currently in the shopping cart and the signed-in user
let cartItems = [];
let currentUser = null;

// Runs once cart.html finishes loading
document.addEventListener('DOMContentLoaded', () => {
  // Show locally cached cart items right away so the screen isn't blank while waiting on Firestore
  loadFromLocalCache();
  // Keep the cart count badge accurate if the navbar re-renders
  watchNavbarChanges();

  // Confirm who is signed in, update the navbar, and load their Firestore cart
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'Sign_in.html';
      return;
    }

    currentUser = user;
    updateNavbarUser(user);
    await loadCartFromFirestore(user.uid);
    updateCartBadge();
  });

  // Hook up the Checkout button
  let checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }
});

// ============================================================================
// [PUTS DATA OUT TO WEBSITE] Replaces "Sign In" button with the user's name
// ============================================================================
function updateNavbarUser(user) {
  let authContainer = document.getElementById('nav-auth-container');
  if (!authContainer) return;

  let displayName = user.displayName
    ? user.displayName.split(' ')[0]
    : user.email.split('@')[0];

  authContainer.innerHTML = `
    <a href="profile.html" id="button" style="background-color: #d4a853; color: #3b240b;">
      ${displayName}
    </a>
  `;
}

// Ensures price and quantity are always numbers so math calculations never break
function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1
  }));
}

// Reads cached cart items from browser localStorage and renders them immediately
function loadFromLocalCache() {
  let savedGuitarentCart = JSON.parse(localStorage.getItem('guitarentCart'));
  let savedGenericCart = JSON.parse(localStorage.getItem('cart'));

  if (Array.isArray(savedGuitarentCart) && savedGuitarentCart.length > 0) {
    cartItems = normalizeCartItems(savedGuitarentCart);
  } else if (Array.isArray(savedGenericCart) && savedGenericCart.length > 0) {
    cartItems = normalizeCartItems(savedGenericCart);
  } else {
    cartItems = [];
  }

  renderCart();
  updateCartBadge();
}

// ============================================================================
// [GETS DATA FROM FIRESTORE] Fetches the user's cart from "carts/{uid}"
// ============================================================================
async function loadCartFromFirestore(uid) {
  try {
    let cartRef = doc(db, 'carts', uid);
    let cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      // Use the saved items from Firestore
      let data = cartSnap.data();
      cartItems = normalizeCartItems(data.items);
    } else if (cartItems.length > 0) {
      // If Firestore has no cart yet, upload the local cache up to Firestore
      await saveCartToFirestore(uid, cartItems);
    } else {
      cartItems = [];
    }

    // Update localStorage and redraw the cart UI
    syncLocalCache();
    renderCart();
    updateCartBadge();
  } catch (error) {
    console.error("Failed to load cart from Firestore:", error.code, error.message);
  }
}

// ============================================================================
// [WRITES DATA TO FIRESTORE] Saves the updated cart array to "carts/{uid}"
// ============================================================================
async function saveCartToFirestore(uid, items) {
  if (!uid) return;
  try {
    let cartRef = doc(db, 'carts', uid);
    await setDoc(cartRef, {
      items: items,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Failed to save cart to Firestore:", error.code, error.message);
  }
}

// Mirrors cartItems into browser localStorage
function syncLocalCache() {
  localStorage.setItem('guitarentCart', JSON.stringify(cartItems));
  localStorage.setItem('cart', JSON.stringify(cartItems));
}

// ============================================================================
// [PUTS DATA OUT TO WEBSITE] Builds the HTML list of cart items and subtotal
// ============================================================================
function renderCart() {
  let emptyMsg = document.getElementById('empty-cart-msg');
  let itemsContainer = document.getElementById('cart-items-container');
  let summaryBox = document.getElementById('cart-summary');
  let subtotalEl = document.getElementById('cart-subtotal');

  if (!itemsContainer) return;

  // If the cart is empty, show the empty message and hide the checkout box
  if (cartItems.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    itemsContainer.innerHTML = '';
    if (summaryBox) summaryBox.style.display = 'none';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  if (summaryBox) summaryBox.style.display = 'block';

  // Build a row card for each item and add up the subtotal
  let subtotal = 0;
  itemsContainer.innerHTML = cartItems.map((item, index) => {
    let qty = Number(item.quantity) || 1;
    let itemTotal = Number(item.price) * qty;
    let imageSrc = item.img || item.image || item.url || '';
    subtotal += itemTotal;

    return `
      <div class="product-wrapper" style="margin-bottom: 20px; grid-template-columns: 140px 1fr auto; align-items: center; padding: 20px;">
        <div style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; background: #3b240b; border-radius: 8px; padding: 10px;">
          <img src="${imageSrc}" alt="${item.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>
        <div>
          <span class="brand-badge">${item.brand || 'Guitar'}</span>
          <h3 style="margin: 5px 0; font-size: 22px;">${item.name}</h3>
          <p class="price-tag" style="font-size: 20px; margin: 0;">$${Number(item.price).toLocaleString()}</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
          <div class="quantity-selector">
            <button onclick="window.changeItemQty(${index}, -1)">-</button>
            <input type="number" value="${qty}" readonly>
            <button onclick="window.changeItemQty(${index}, 1)">+</button>
          </div>
          <button onclick="window.removeCartItem(${index})" style="background-color: #840c0c; color: wheat; border: none; border-radius: 8px; padding: 8px 14px; font-weight: bold; cursor: pointer;">
            Remove
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Display the calculated dollar subtotal on the page
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
}

// Increases or decreases an item's quantity (removes it if quantity drops to 0)
window.changeItemQty = async function(index, change) {
  if (!cartItems[index]) return;
  cartItems[index].quantity = (Number(cartItems[index].quantity) || 1) + change;

  if (cartItems[index].quantity <= 0) {
    cartItems.splice(index, 1);
  }

  await saveAndRender();
};

// Deletes an item completely when the user clicks "Remove"
window.removeCartItem = async function(index) {
  cartItems.splice(index, 1);
  await saveAndRender();
};

// Saves changes locally, updates the webpage UI, and syncs to Firestore
async function saveAndRender() {
  syncLocalCache();
  renderCart();
  updateCartBadge();

  if (currentUser) {
    await saveCartToFirestore(currentUser.uid, cartItems);
  }
}

// ============================================================================
// [WRITES ORDER TO FIRESTORE] Saves completed order under "users/{uid}/orders"
// ============================================================================
async function handleCheckout() {
  if (cartItems.length === 0) return;

  let subtotal = cartItems.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1);
  }, 0);

  let totalQuantity = cartItems.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 1);
  }, 0);

  try {
    if (currentUser) {
      // Save a receipt of this order in the user's orders subcollection
      let ordersRef = collection(db, 'users', currentUser.uid, 'orders');
      await addDoc(ordersRef, {
        items: cartItems,
        subtotal: subtotal,
        totalQuantity: totalQuantity,
        status: 'Completed',
        createdAt: serverTimestamp()
      });
    }

    // Empty the cart locally and in Firestore, then return to the main store
    cartItems = [];
    await saveAndRender();
    alert('Order placed successfully!');
    window.location.href = 'index.html';
  } catch (error) {
    console.error("Checkout failed:", error.code, error.message);
    alert("Could not complete checkout: " + error.message);
  }
}

// ============================================================================
// [PUTS DATA OUT TO WEBSITE] Updates the Cart (X) badge in the navbar
// ============================================================================
function updateCartBadge() {
  let totalQty = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  let badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = totalQty;
  }
}

// Watches the navbar for DOM changes and ensures #cart-count never resets accidentally
function watchNavbarChanges() {
  let authContainer = document.getElementById('nav-auth-container');
  let badge = document.getElementById('cart-count');

  if (!authContainer || !badge) return;

  let observer = new MutationObserver(() => {
    let expectedTotal = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    if (badge.textContent !== String(expectedTotal)) {
      badge.textContent = expectedTotal;
    }
  });

  observer.observe(authContainer, { childList: true, subtree: true, characterData: true });
}