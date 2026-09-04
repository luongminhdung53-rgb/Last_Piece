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

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }

  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      const section = card.closest('section');
      const brand = section ? section.id : 'Guitar';
      const imgEl = card.querySelector('img');
      const titleEl = card.querySelector('h3');
      const priceEl = card.querySelector('p');

      const name = titleEl ? (titleEl.getAttribute('title') || titleEl.textContent.trim()) : 'Guitar';
      const rawPrice = priceEl ? priceEl.textContent.replace(/[^0-9.]/g, '') : '0';
      const imgSrc = imgEl ? imgEl.src : '';

      const selectedProduct = {
        id: `${brand.toLowerCase()}-${index}`,
        name: name,
        price: rawPrice,
        brand: brand,
        img: imgSrc
      };

      localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));

      window.location.href = 'product.html';
    });
  });
};