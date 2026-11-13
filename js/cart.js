import { requireAuth } from './firebase-config.js';

requireAuth();

let cartItems = [];

document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});

function loadCart() {
  cartItems = JSON.parse(localStorage.getItem('guitarentCart')) || [];
  renderCart();
  updateCartBadge();
}

function renderCart() {
  const emptyMsg = document.getElementById('empty-cart-msg');
  const itemsContainer = document.getElementById('cart-items-container');
  const summaryBox = document.getElementById('cart-summary');
  const subtotalEl = document.getElementById('cart-subtotal');

  if (!itemsContainer) return;

  if (cartItems.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    itemsContainer.innerHTML = '';
    if (summaryBox) summaryBox.style.display = 'none';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  if (summaryBox) summaryBox.style.display = 'block';

  let subtotal = 0;
  itemsContainer.innerHTML = cartItems.map((item, index) => {
    const itemTotal = Number(item.price) * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="product-wrapper" style="margin-bottom: 20px; grid-template-columns: 140px 1fr auto; align-items: center; padding: 20px;">
        <div style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; background: #3b240b; border-radius: 8px; padding: 10px;">
          <img src="${item.img}" alt="${item.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>
        <div>
          <span class="brand-badge">${item.brand || 'Guitar'}</span>
          <h3 style="margin: 5px 0; font-size: 22px;">${item.name}</h3>
          <p class="price-tag" style="font-size: 20px; margin: 0;">$${Number(item.price).toLocaleString()}</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
          <div class="quantity-selector">
            <button onclick="window.changeItemQty(${index}, -1)">-</button>
            <input type="number" value="${item.quantity}" readonly>
            <button onclick="window.changeItemQty(${index}, 1)">+</button>
          </div>
          <button onclick="window.removeCartItem(${index})" style="background-color: #840c0c; color: wheat; border: none; border-radius: 8px; padding: 8px 14px; font-weight: bold; cursor: pointer;">
            Remove
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
}

window.changeItemQty = function(index, change) {
  cartItems[index].quantity += change;
  if (cartItems[index].quantity <= 0) {
    cartItems.splice(index, 1);
  }
  saveAndRender();
};

window.removeCartItem = function(index) {
  cartItems.splice(index, 1);
  saveAndRender();
};

function saveAndRender() {
  localStorage.setItem('guitarentCart', JSON.stringify(cartItems));
  renderCart();
  updateCartBadge();
}

function updateCartBadge() {
  const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = totalQty;
}

// Checkout button logic
document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cartItems.length === 0) return;
      alert('Order placed successfully!');
      cartItems = [];
      saveAndRender();
      window.location.href = 'Website.html';
    });
  }
});