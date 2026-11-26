import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;
let currentProduct = null;
let cartItems = [];
let selectedQty = 1;

document.addEventListener('DOMContentLoaded', () => {
  loadCartFromLocalCache();
  setupQuantityControls();

  let addBtn = document.getElementById('add-to-cart-btn');
  if (addBtn) {
    addBtn.addEventListener('click', handleAddToCart);
  }

  onAuthStateChanged(auth, async (user) => {
    currentUser = user || null;
    updateNavbarUser(currentUser);

    if (currentUser) {
      await loadCartFromFirestore(currentUser.uid);
    }
    updateCartBadge();
  });

  loadProductFromFirestore();
});

function updateNavbarUser(user) {
  let authContainer = document.getElementById('nav-auth-container');
  if (!authContainer) return;

  if (!user) {
    authContainer.innerHTML = `<a href="Sign_in.html" id="button">Sign In</a>`;
    return;
  }

  let displayName = user.displayName
    ? user.displayName.split(' ')[0]
    : user.email.split('@')[0];

  authContainer.innerHTML = `
    <a href="profile.html" id="button" style="background-color: #d4a853; color: #3b240b;">
      ${displayName}
    </a>
  `;
}

function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1
  }));
}

function loadCartFromLocalCache() {
  let savedCart = JSON.parse(localStorage.getItem('guitarentCart'))
    || JSON.parse(localStorage.getItem('cart'))
    || [];
  cartItems = normalizeCartItems(savedCart);
  updateCartBadge();
}

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

function syncLocalCache() {
  localStorage.setItem('guitarentCart', JSON.stringify(cartItems));
  localStorage.setItem('cart', JSON.stringify(cartItems));
}

function updateCartBadge() {
  let totalQty = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  let badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = totalQty;
  }
}

async function loadProductFromFirestore() {
  let params = new URLSearchParams(window.location.search);
  let productId = params.get('id');
  let brandParam = params.get('brand');

  let loadingBox = document.getElementById('product-loading');
  let detailView = document.getElementById('product-detail-view');

  if (!productId) {
    if (loadingBox) loadingBox.innerHTML = "<h3>Missing guitar ID in URL.</h3>";
    return;
  }

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
          brand: brandName,
          name: data.name || "Unnamed Guitar",
          price: Number(data.price) || 0,
          img: data.url || data.image || "",
          description: data.desc || data.description || "No description available."
        };
        break;
      }
    }

    if (!currentProduct) {
      if (loadingBox) loadingBox.innerHTML = "<h3>Guitar not found in catalog.</h3>";
      return;
    }

    renderProductDetails(currentProduct);
    if (loadingBox) loadingBox.classList.add('is-hidden');
    if (detailView) {
      detailView.style.display = '';
      detailView.classList.remove('is-hidden');
    }
  } catch (error) {
    console.error("Failed to load guitar:", error.code, error.message);
    if (loadingBox) loadingBox.innerHTML = `<h3>Error loading guitar: ${error.message}</h3>`;
  }
}

function renderProductDetails(guitar) {
  document.title = `${guitar.name} - Guitarent`;

  let brandEl = document.getElementById('product-brand');
  let nameEl = document.getElementById('product-name');
  let priceEl = document.getElementById('product-price');
  let descEl = document.getElementById('product-desc');
  let imgEl = document.getElementById('product-img');

  if (brandEl) brandEl.textContent = guitar.brand;
  if (nameEl) nameEl.textContent = guitar.name;
  if (priceEl) priceEl.textContent = `$${guitar.price.toLocaleString()}`;
  if (descEl) descEl.textContent = guitar.description;
  if (imgEl) {
    imgEl.src = guitar.img;
    imgEl.alt = guitar.name;
  }
}

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

async function handleAddToCart() {
  if (!currentProduct) return;

  if (!currentUser) {
    alert("Please sign in first to save items to your cart.");
    window.location.href = 'Sign_in.html';
    return;
  }

  let existingIndex = cartItems.findIndex(
    (item) => item.id === currentProduct.id && item.brand === currentProduct.brand
  );

  if (existingIndex !== -1) {
    cartItems[existingIndex].quantity = (Number(cartItems[existingIndex].quantity) || 1) + selectedQty;
  } else {
    cartItems.push({
      id: currentProduct.id,
      brand: currentProduct.brand,
      name: currentProduct.name,
      price: currentProduct.price,
      img: currentProduct.img,
      quantity: selectedQty
    });
  }

  syncLocalCache();
  updateCartBadge();
  await saveCartToFirestore(currentUser.uid, cartItems);

  let feedbackEl = document.getElementById('cart-feedback');
  if (feedbackEl) {
    feedbackEl.textContent = `Added ${selectedQty} × ${currentProduct.name} to your cart!`;
  }
}