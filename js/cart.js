window.onload = function () {
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

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const authContainer = document.getElementById('nav-auth-container');

  if (currentUser && authContainer) {
    const userName = currentUser.name ? currentUser.name.split(' ')[0] : 'Profile';
    authContainer.innerHTML = `
      <a href="profile.html" id="button" style="background-color: #d4a853; color: #3b240b;">
         ${userName}
      </a>
    `;
  }

  function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountEl = document.getElementById('cart-count');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const itemsContainer = document.getElementById('cart-items-container');
    const summaryBox = document.getElementById('cart-summary');
    const subtotalEl = document.getElementById('cart-subtotal');

    // Update Nav Badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountEl) cartCountEl.textContent = totalItems;

    // Toggle Empty vs Active State
    if (cart.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      if (itemsContainer) itemsContainer.innerHTML = '';
      if (summaryBox) summaryBox.style.display = 'none';
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (summaryBox) summaryBox.style.display = 'block';

    let subtotal = 0;
    itemsContainer.innerHTML = cart.map((item, index) => {
      subtotal += item.price * item.quantity;

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
              <button onclick="updateQty(${index}, -1)">-</button>
              <input type="number" value="${item.quantity}" readonly>
              <button onclick="updateQty(${index}, 1)">+</button>
            </div>
            <!-- Animated Remove Button -->
            <button onclick="removeItem(${index})" class="remove-item-btn">
              Remove 
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toLocaleString()}`;
  }
  
  window.updateQty = function (index, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart[index]) {
      cart[index].quantity += change;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    }
  };

  window.removeItem = function (index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
  };

  renderCart();
};