window.onload = function () {
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

  function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
      cartCountEl.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
  }
  updateCartBadge();

  const defaultProduct = {
    id: 'gibson-1',
    name: 'Gibson Les Paul Studio Session',
    price: '1999',
    brand: 'Gibson',
    img: 'https://vietmusic.vn/cdn/shop/files/LPSTAA01HBCH1_front.jpg?v=1733896075&width=1946'
  };

  const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct')) || defaultProduct;

  document.getElementById('product-img').src = selectedProduct.img || defaultProduct.img;
  document.getElementById('product-title').textContent = selectedProduct.name || defaultProduct.name;
  document.getElementById('product-title-breadcrumb').textContent = selectedProduct.name || defaultProduct.name;
  document.getElementById('product-brand').textContent = selectedProduct.brand || defaultProduct.brand;
  document.getElementById('product-brand-breadcrumb').textContent = selectedProduct.brand || defaultProduct.brand;
  document.getElementById('product-price').textContent = `$${Number(selectedProduct.price || defaultProduct.price).toLocaleString()}`;

  const container = document.querySelector('.product-container');
  if (container && selectedProduct.brand) {
    const brandClass = `theme-${selectedProduct.brand.toLowerCase()}`;
    container.classList.add(brandClass);
  }

  const qtyInput = document.getElementById('qty-input');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.onclick = () => {
      if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
    };
    qtyPlus.onclick = () => {
      if (parseInt(qtyInput.value) < 10) qtyInput.value = parseInt(qtyInput.value) + 1;
    };
  }
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.onclick = () => {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
      const quantity = parseInt(qtyInput.value) || 1;

      const existingIndex = cart.findIndex((item) => item.name === selectedProduct.name);

      if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          id: selectedProduct.id || Date.now(),
          name: selectedProduct.name,
          price: parseFloat(selectedProduct.price),
          img: selectedProduct.img,
          brand: selectedProduct.brand,
          quantity: quantity
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadge();
      alert(`${quantity} x ${selectedProduct.name} added to cart!`);
    };
  }
};