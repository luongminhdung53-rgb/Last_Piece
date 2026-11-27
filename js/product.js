import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// State variables for the active user, the guitar being viewed, cart items, and quantity picker
let currentUser = null;
let currentProduct = null;
let cartItems = [];
let selectedQty = 1;
let feedbackTimer = null;

// Runs once product.html finishes loading
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromLocalCache();
  setupQuantityControls();

  // Attach click handler to the "Add to Cart" button
  let addBtn = document.getElementById('add-to-cart-btn');
  if (addBtn) {
    addBtn.addEventListener('click', handleAddToCart);
  }

  // Update navbar and load the signed-in user's cart from Firestore
  onAuthStateChanged(auth, async (user) => {
    currentUser = user || null;
    updateNavbarUser(currentUser);

    if (currentUser) {
      await loadCartFromFirestore(currentUser.uid);
    } else {
      loadCartFromLocalCache();
    }
    updateCartBadge();
  });

  // Fetch the specific guitar's details from Firestore
  loadProductFromFirestore();
});

// ============================================================================
// [PUTS DATA OUT TO WEBSITE] Updates the navbar button (user name or Sign In)
// ============================================================================
function updateNavbarUser(user) {
  let authContainer = document.getElementById('nav-auth-container');
  if (!authContainer) return;

  if (!user) {
    authContainer.innerHTML = `<a href="Sign_in.html" id="button">Sign In</a>`;
    return;
  }

  let displayName = user.displayName
    ? user.displayName.split(' ')[0]
    : (user.email ? user.email.split('@')[0] : 'Account');

  authContainer.innerHTML = `
    <a href="profile.html" id="button" style="background-color: #d4a853; color: #3b240b;">
      ${displayName}
    </a>
  `;
}

// Ensures price and quantity are stored as clean numbers
function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1
  }));
}

// Reads cached cart items from browser localStorage
function loadCartFromLocalCache() {
  let savedCart = JSON.parse(localStorage.getItem('guitarentCart'))
    || JSON.parse(localStorage.getItem('cart'))
    || [];
  cartItems = normalizeCartItems(savedCart);
  updateCartBadge();
}

// Saves current cart items into browser localStorage
function syncLocalCache() {
  localStorage.setItem('guitarentCart', JSON.stringify(cartItems));
  localStorage.setItem('cart', JSON.stringify(cartItems));
}

// ============================================================================
// [GETS DATA FROM FIRESTORE] Loads the user's existing cart from "carts/{uid}"
// ============================================================================
async function loadCartFromFirestore(uid) {
  try {
    let cartRef = doc(db, 'carts', uid);
    let cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      let data = cartSnap.data();
      cartItems = normalizeCartItems(data.items);
      syncLocalCache();
      updateCartBadge();
    }
  } catch (error) {
    console.error("Failed to load user cart:", error.code, error.message);
  }
}

// ============================================================================
// [WRITES DATA TO FIRESTORE] Saves updated cart items to "carts/{uid}"
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

// ============================================================================
// [GETS DATA FROM FIRESTORE] Reads ?id=...&brand=... from URL and fetches guitar
// ============================================================================
async function loadProductFromFirestore() {
  // Read query parameters from the URL (e.g., product.html?id=gibson-1&brand=Gibson)
  let params = new URLSearchParams(window.location.search);
  let productId = params.get('id');
  let brandParam = params.get('brand');

  let loadingBox = document.getElementById('product-loading');
  let detailView = document.getElementById('product-detail-view');

  if (!productId) {
    if (loadingBox) loadingBox.innerHTML = "<h3>Missing guitar ID in URL.</h3>";
    return;
  }

  // If brand is in the URL, check only that collection; otherwise check all 5 brand collections
  let brandsToCheck = brandParam
    ? [brandParam]
    : ['Gibson', 'Fender', 'Epiphone', 'Kramer', 'PRS'];

  try {
    for (let brandName of brandsToCheck) {
      let guitarRef = doc(db, brandName, productId);
      let guitarSnap = await getDoc(guitarRef);

      if (guitarSnap.exists()) {
        let data = guitarSnap.data();
        currentProduct = {
          id: guitarSnap.id,
          brand: data.brand || brandName,
          name: data.name || "Unnamed Guitar",
          price: Number(data.price) || 0,
          img: data.url || data.image || data.img || "",
          description: data.desc || data.description || "No description available."
        };
        break;
      }
    }

    if (!currentProduct) {
      if (loadingBox) loadingBox.innerHTML = "<h3>Guitar not found in catalog.</h3>";
      return;
    }

    // [PUTS DATA OUT TO WEBSITE] Fill the product page elements and reveal the view
    renderProductDetails(currentProduct);

    if (loadingBox) loadingBox.classList.add('is-hidden');
    if (detailView) detailView.classList.remove('is-hidden');
  } catch (error) {
    console.error("Failed to load guitar:", error.code, error.message);
    if (loadingBox) {
      loadingBox.innerHTML = `<h3>Error loading guitar: ${error.message}</h3>`;
    }
  }
}

// ============================================================================
// [PUTS DATA OUT TO WEBSITE] Injects guitar brand, name, price, desc, and image
// ============================================================================
function renderProductDetails(guitar) {
  document.title = `${guitar.name} - Guitarent`;

  let brandEl = document.getElementById('product-brand');
  let nameEl = document.getElementById('product-name');
  let priceEl = document.getElementById('product-price');
  let descEl = document.getElementById('product-desc');
  let imgEl = document.getElementById('product-img');

  if (brandEl) brandEl.textContent = guitar.brand;
  if (nameEl) nameEl.textContent = guitar.name;
  if (priceEl) priceEl.textContent = `$${Number(guitar.price).toLocaleString()}`;
  if (descEl) descEl.textContent = guitar.description;
  if (imgEl) {
    imgEl.src = guitar.img;
    imgEl.alt = guitar.name;
  }
}

// Connects the "-" and "+" buttons to adjust selectedQty before adding to cart
function setupQuantityControls() {
  let minusBtn = document.getElementById('qty-minus');
  let plusBtn = document.getElementById('qty-plus');
  let qtyInput = document.getElementById('qty-input');

  if (minusBtn) {
    minusBtn.addEventListener('click', () => {
      if (selectedQty > 1) {
        selectedQty -= 1;
        if (qtyInput) qtyInput.value = selectedQty;
      }
    });
  }

  if (plusBtn) {
    plusBtn.addEventListener('click', () => {
      selectedQty += 1;
      if (qtyInput) qtyInput.value = selectedQty;
    });
  }
}

// ============================================================================
// [SAVES DATA & DISPLAYS FEEDBACK] Adds guitar to cart and shows green message
// ============================================================================
async function handleAddToCart() {
  if (!currentProduct) return;

  // Check if this exact guitar is already in the cart
  let existingIndex = cartItems.findIndex(
    (item) => item.id === currentProduct.id && item.brand === currentProduct.brand
  );

  if (existingIndex !== -1) {
    // Increase quantity if already present
    cartItems[existingIndex].quantity = (Number(cartItems[existingIndex].quantity) || 1) + selectedQty;
  } else {
    // Otherwise push a new item entry into cartItems
    cartItems.push({
      id: currentProduct.id,
      brand: currentProduct.brand,
      name: currentProduct.name,
      price: Number(currentProduct.price) || 0,
      img: currentProduct.img,
      quantity: selectedQty
    });
  }

  // Save locally, update navbar badge, and sync to Firestore
  syncLocalCache();
  updateCartBadge();

  if (currentUser) {
    await saveCartToFirestore(currentUser.uid, cartItems);
  }

  // [PUTS DATA OUT TO WEBSITE] Turn button green and display confirmation text for 2 seconds
  let addBtn = document.getElementById('add-to-cart-btn');
  let feedbackEl = document.getElementById('cart-feedback');

if (addBtn) {
  addBtn.disabled = true;
  addBtn.style.backgroundColor = '#2e7d32';
  addBtn.style.color = '#ffffff';
  addBtn.textContent = 'Added!';
}

if (feedbackEl) {
  feedbackEl.style.color = '#1b5e20';
  feedbackEl.textContent = 'The product has been added to cart!';
}

if (feedbackTimer) {
  clearTimeout(feedbackTimer);
}

feedbackTimer = setTimeout(() => {
  if (addBtn) {
    addBtn.style.backgroundColor = '';
    addBtn.style.color = '';
    addBtn.textContent = 'Add to Cart';
    addBtn.disabled = false;
  }
  if (feedbackEl) {
    feedbackEl.textContent = '';
  }
}, 1000);
}