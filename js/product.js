import { requireAuth } from './firebase-config.js';

// Protect page: user must be logged in
requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  // Load guitar data from localStorage
  const guitarDataStr = localStorage.getItem('selectedProduct');
  
  if (!guitarDataStr) {
    alert("No guitar selected. Returning to store.");
    window.location.href = 'Website.html';
    return;
  }

  const guitar = JSON.parse(guitarDataStr);

  // Populate UI elements
  document.getElementById('product-title').textContent = guitar.name;
  document.getElementById('product-title-path').textContent = guitar.name;
  document.getElementById('product-brand').textContent = guitar.brand;
  document.getElementById('product-brand-path').textContent = guitar.brand;
  document.getElementById('product-price').textContent = `$${Number(guitar.price).toLocaleString()}`;
  document.getElementById('product-description').textContent = guitar.description || "No description available.";
  
  const imgEl = document.getElementById('product-img');
  if (imgEl && guitar.image) {
    imgEl.src = guitar.image;
    imgEl.alt = guitar.name;
  }

  // Quantity Controls
  const qtyInput = document.getElementById('qty-input');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');

  if (qtyMinus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = val - 1;
    });
  }

  if (qtyPlus && qtyInput) {
    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val < 10) qtyInput.value = val + 1;
    });
  }

  // Add to Cart Logic (localStorage)
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const quantity = parseInt(qtyInput ? qtyInput.value : 1) || 1;
      let cart = JSON.parse(localStorage.getItem('guitarentCart')) || [];

      const existingIndex = cart.findIndex(item => item.id === guitar.id);
      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          id: guitar.id,
          name: guitar.name,
          price: Number(guitar.price),
          brand: guitar.brand,
          img: guitar.image,
          quantity: quantity
        });
      }

      localStorage.setItem('guitarentCart', JSON.stringify(cart));
      updateCartBadge();

      // Visual feedback
      const originalHTML = addToCartBtn.innerHTML;
      addToCartBtn.textContent = "Added to Cart!";
      addToCartBtn.style.backgroundColor = "#4CAF50";

      setTimeout(() => {
        addToCartBtn.innerHTML = originalHTML;
        addToCartBtn.style.backgroundColor = "";
      }, 1500);
    });
  }
});

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('guitarentCart')) || [];
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = totalQty;
}