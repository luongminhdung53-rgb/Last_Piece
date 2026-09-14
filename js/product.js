document.addEventListener('DOMContentLoaded', function () {
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
      cartCountEl.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }
  }

  updateCartCount();

  const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct'));

  if (!selectedProduct) {
    console.warn("No product selected in localStorage.");
    return;
  }

  const setElementText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setElementText('product-title', selectedProduct.name);
  setElementText('product-title-path', selectedProduct.name);
  setElementText('product-brand', selectedProduct.brand);
  setElementText('product-brand-path', selectedProduct.brand);

  const formattedPrice = selectedProduct.price.toString().startsWith('$')
    ? selectedProduct.price
    : `$${selectedProduct.price}`;
  setElementText('product-price', formattedPrice);
  setElementText('product-description', selectedProduct.description || "No description available.");

  const imgEl = document.getElementById('product-img');
  if (imgEl && selectedProduct.img) {
    imgEl.src = selectedProduct.img;
    imgEl.alt = selectedProduct.name;
  }

  const qtyInput = document.getElementById('qty-input');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');

  if (qtyMinus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let currentVal = parseInt(qtyInput.value) || 1;
      if (currentVal > 1) qtyInput.value = currentVal - 1;
    });
  }

  if (qtyPlus && qtyInput) {
    qtyPlus.addEventListener('click', () => {
      let currentVal = parseInt(qtyInput.value) || 1;
      if (currentVal < 10) qtyInput.value = currentVal + 1;
    });
  }
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function () {
      const quantity = parseInt(qtyInput ? qtyInput.value : 1) || 1;
      let cart = JSON.parse(localStorage.getItem('cart')) || [];

      const numericPrice = parseFloat(selectedProduct.price.toString().replace(/[^0-9.]/g, '')) || 0;

      const existingItemIndex = cart.findIndex(item => item.id === selectedProduct.id);

      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push({
          id: selectedProduct.id,
          name: selectedProduct.name,
          price: numericPrice,
          brand: selectedProduct.brand,
          img: selectedProduct.img,
          quantity: quantity
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();

      const originalText = addToCartBtn.textContent;
      addToCartBtn.textContent = "Added to Cart!";
      addToCartBtn.style.backgroundColor = "#4CAF50";

      setTimeout(() => {
        addToCartBtn.textContent = originalText;
        addToCartBtn.style.backgroundColor = "";
      }, 1500);
    });
  }
});
document.addEventListener('DOMContentLoaded', function () {
  const openChatBtn = document.getElementById('open-chat-btn');
  const closeChatBtn = document.getElementById('close-chat-btn');
  const chatWidget = document.getElementById('chat-widget-container');

  if (openChatBtn && chatWidget) {
    openChatBtn.addEventListener('click', () => {
      chatWidget.classList.toggle('hidden');
    });
  }

  if (closeChatBtn && chatWidget) {
    closeChatBtn.addEventListener('click', () => {
      chatWidget.classList.add('hidden');
    });
  }
});