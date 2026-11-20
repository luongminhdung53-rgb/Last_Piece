import { requireAuth } from './firebase-config.js';

requireAuth();

let cartItems = [];
let activeStorageKey = 'guitarentCart';

document.addEventListener('DOMContentLoaded', () => {
  loadCart();

  let checkoutBtn = document.getElementById('checkout-btn');
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

function loadCart() {
  // Check 'guitarentCart' first, fall back to 'cart' in case product.js uses 'cart'
  let savedGuitarentCart = JSON.parse(localStorage.getItem('guitarentCart'));
  let savedGenericCart = JSON.parse(localStorage.getItem('cart'));

  if (Array.isArray(savedGuitarentCart) && savedGuitarentCart.length > 0) {
    activeStorageKey = 'guitarentCart';
    cartItems = savedGuitarentCart;
  } else if (Array.isArray(savedGenericCart) && savedGenericCart.length > 0) {
    activeStorageKey = 'cart';
    cartItems = savedGenericCart;
  } else {
    cartItems = savedGuitarentCart || savedGenericCart || [];
  }

  // Ensure every item has a valid numeric quantity
  cartItems = cartItems.map(item => ({
    ...item,
    quantity: Number(item.quantity) || 1
  }));

  renderCart();
  updateCartBadge();
}

function renderCart() {
  let emptyMsg = document.getElementById('empty-cart-msg');
  let itemsContainer = document.getElementById('cart-items-container');
  let summaryBox = document.getElementById('cart-summary');
  let subtotalEl = document.getElementById('cart-subtotal');

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

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
}

window.changeItemQty = function(index, change) {
  cartItems[index].quantity = (Number(cartItems[index].quantity) || 1) + change;
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
  localStorage.setItem('cart', JSON.stringify(cartItems));
  renderCart();
  updateCartBadge();
}

function updateCartBadge() {
  let totalQty = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  let badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = totalQty;
  }
}