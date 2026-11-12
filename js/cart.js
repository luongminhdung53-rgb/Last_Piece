import { db, requireAuth, syncCartBadge } from './firebase-config.js';
import { doc, getDoc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;
let cartItems = [];

const style = document.createElement('style');
style.innerHTML = `
  .remove-item-btn {
    background-color: #840c0c;
    color: wheat;
    border: none;
    border-radius: 12px;
    padding: 10px 18px;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
  }
  .remove-item-btn:hover {
    background-color: #d4a853;
    color: #3b240b;
    transform: scale(1.03);
  }
`;
document.head.appendChild(style);

requireAuth(async (user) => {
  currentUser = user;
  await loadAndRenderCart();
});

async function loadAndRenderCart() {
  if (!currentUser) return;

  try {
    const cartRef = doc(db, "carts", currentUser.uid);
    const cartSnap = await getDoc(cartRef);
    cartItems = cartSnap.exists() ? (cartSnap.data().items || []) : [];
    renderCart();
  } catch (error) {
    console.error("Error loading cart:", error);
  }
}

function renderCart() {
  const emptyMsg = document.getElementById('empty-cart-msg');
  const itemsContainer = document.getElementById('cart-items-container');
  const summaryBox = document.getElementById('cart-summary');
  const subtotalEl = document.getElementById('cart-subtotal');

  if (cartItems.length === 0) {
    if (emptyMsg) emptyMsg.style.display = 'block';
    if (itemsContainer) itemsContainer.innerHTML = '';
    if (summaryBox) summaryBox.style.display = 'none';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  if (summaryBox) summaryBox.style.display = 'block';

  let subtotal = 0;
  itemsContainer.innerHTML = cartItems.map((item, index) => {
    const numericPrice = Number(item.price) || 0;
    subtotal += numericPrice * item.quantity;

    return `
      <div class="product-wrapper" style="margin-bottom: 20px; grid-template-columns: 140px 1fr auto; align-items: center; padding: 20px;">
        <div style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; background: #3b240b; border-radius: 8px; padding: 10px;">
          <img src="${item.img}" alt="${item.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>
        <div>
          <span class="brand-badge">${item.brand || 'Guitar'}</span>
          <h3 style="margin: 5px 0; font-size: 22px;">${item.name}</h3>
          <p class="price-tag" style="font-size: 20px; margin: 0;">$${numericPrice.toLocaleString()}</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
          <div class="quantity-selector">
            <button onclick="updateQty(${index}, -1)">-</button>
            <input type="number" value="${item.quantity}" readonly>
            <button onclick="updateQty(${index}, 1)">+</button>
          </div>
          <button onclick="removeItem(${index})" class="remove-item-btn">
            Remove
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
}

window.updateQty = async function (index, change) {
  if (!currentUser || !cartItems[index]) return;

  cartItems[index].quantity += change;
  if (cartItems[index].quantity <= 0) {
    cartItems.splice(index, 1);
  }

  await saveCart();
};

window.removeItem = async function (index) {
  if (!currentUser) return;
  cartItems.splice(index, 1);
  await saveCart();
};

async function saveCart() {
  try {
    const cartRef = doc(db, "carts", currentUser.uid);
    await setDoc(cartRef, { items: cartItems });
    await syncCartBadge(currentUser.uid);
    renderCart();
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      if (!currentUser || cartItems.length === 0) return;

      const total = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

      try {
        const ordersRef = collection(db, "users", currentUser.uid, "orders");
        await addDoc(ordersRef, {
          items: cartItems,
          total: total,
          createdAt: new Date().toISOString()
        });

        cartItems = [];
        await saveCart();

        alert('Order placed successfully! Check your profile for order history.');
        window.location.href = 'profile.html';
      } catch (error) {
        console.error("Checkout error:", error);
        alert("Checkout failed: " + error.message);
      }
    });
  }
});