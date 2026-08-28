window.onload = function () {
  // 1. Update Auth state in Navbar
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

  // 2. Update Cart Badge Count
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }

  // 3. Attach click event to all product cards
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      // Find the brand section heading this card belongs to
      const section = card.closest('section');
      const brand = section ? section.id : 'Guitar';

      // Scrape data directly from the card elements
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

      // Save selected product object to LocalStorage
      localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));

      // Redirect to product page
      window.location.href = 'product.html';
    });
  });
};