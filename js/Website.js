import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let gibsonGuitars = [];
let fenderGuitars = [];
let epiphoneGuitars = [];
let kramerGuitars = [];
let prsGuitars = [];
let cartItems = [];

function detectBrand(guitarName, docId) {
  let text = `${guitarName || ''} ${docId || ''}`.toLowerCase();
  if (text.includes('gibson')) return 'Gibson';
  if (text.includes('fender') || text.includes('squier')) return 'Fender';
  if (text.includes('epiphone')) return 'Epiphone';
  if (text.includes('kramer')) return 'Kramer';
  if (text.includes('prs')) return 'PRS';
  return 'Other';
}

function getAllGuitars() {
  return [
    ...gibsonGuitars,
    ...fenderGuitars,
    ...epiphoneGuitars,
    ...kramerGuitars,
    ...prsGuitars
  ];
}

function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1
  }));
}

function syncLocalCartCache(items) {
  localStorage.setItem('guitarentCart', JSON.stringify(items));
  localStorage.setItem('cart', JSON.stringify(items));
}

function updateCartBadge(items = cartItems) {
  let totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  let badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = totalQty;
  }
}

function loadCartFromLocalCache() {
  let savedCart = JSON.parse(localStorage.getItem('guitarentCart'))
    || JSON.parse(localStorage.getItem('cart'))
    || [];
  cartItems = normalizeCartItems(savedCart);
  updateCartBadge(cartItems);
}

async function loadCartFromFirestore(uid) {
  if (!uid) return;
  try {
    let cartRef = doc(db, 'carts', uid);
    let cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      let data = cartSnap.data();
      cartItems = normalizeCartItems(data.items);
      syncLocalCartCache(cartItems);
    }
    updateCartBadge(cartItems);
  } catch (error) {
    console.error("Failed to load user cart:", error.code, error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCartFromLocalCache();
  setupSearch();
  setupChatWidget();

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'Sign_in.html';
      return;
    }

    let authContainer = document.getElementById('nav-auth-container');
    if (authContainer) {
      let displayName = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
      authContainer.innerHTML = `
        <a href="profile.html" id="button" style="background-color: #d4a853; color: #3b240b;">
          ${displayName}
        </a>
      `;
    }

    await loadCartFromFirestore(user.uid);
    await loadCatalogFromFirestore();
  });
});

async function loadCatalogFromFirestore() {
  try {
    gibsonGuitars = [];
    fenderGuitars = [];
    epiphoneGuitars = [];
    kramerGuitars = [];
    prsGuitars = [];

    let brandSources = [
      { name: 'Gibson', targetArray: gibsonGuitars },
      { name: 'Fender', targetArray: fenderGuitars },
      { name: 'Epiphone', targetArray: epiphoneGuitars },
      { name: 'Kramer', targetArray: kramerGuitars },
      { name: 'PRS', targetArray: prsGuitars }
    ];

    let totalDocs = 0;

    for (let source of brandSources) {
      let querySnapshot = await getDocs(collection(db, source.name));
      totalDocs += querySnapshot.size;

      querySnapshot.docs.forEach((docSnap) => {
        let data = docSnap.data();
        let guitarObj = {
          id: docSnap.id,
          brand: source.name,
          name: data.name || "Unnamed Guitar",
          price: Number(data.price) || 0,
          image: data.url || data.image || "",
          description: data.desc || data.description || "",
          isNew: Boolean(data.new),
          isBestSeller: Boolean(data.bestSeller)
        };

        source.targetArray.push(guitarObj);
      });
    }

    console.log("Firestore returned total documents count:", totalDocs);

    if (totalDocs === 0) {
      console.warn("No documents found across brand collections.");
      return;
    }

    renderAllBrands();
    renderFeaturedSections();
  } catch (error) {
    console.error("Failed to fetch guitars from Firestore:", error.code, error.message);
    alert("Database error: " + error.message);
  }
}

function renderBrandSection(brandName, guitarArray) {
  let section = document.getElementById(brandName);
  if (!section) return;

  let grid = section.querySelector('.product-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (guitarArray.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  guitarArray.forEach((guitar) => {
    let card = document.createElement('div');
    card.className = 'product-card';
    card.addEventListener('click', () => selectProduct(guitar));

    let img = document.createElement('img');
    img.src = guitar.image;
    img.alt = guitar.name;

    let title = document.createElement('h3');
    title.title = guitar.name;
    title.textContent = guitar.name;

    let price = document.createElement('p');
    price.textContent = `$${guitar.price.toLocaleString()}`;

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(price);
    grid.appendChild(card);
  });
}

function renderAllBrands() {
  renderBrandSection('Gibson', gibsonGuitars);
  renderBrandSection('Fender', fenderGuitars);
  renderBrandSection('Epiphone', epiphoneGuitars);
  renderBrandSection('Kramer', kramerGuitars);
  renderBrandSection('PRS', prsGuitars);
}

function renderFeaturedSections() {
  let allGuitars = getAllGuitars();

  let createFeaturedCard = (guitar, badgeText, badgeClass) => {
    let card = document.createElement('div');
    card.className = 'featured-card';
    card.addEventListener('click', () => selectProduct(guitar));

    let badge = document.createElement('span');
    badge.className = `badge ${badgeClass}`;
    badge.textContent = badgeText;

    let img = document.createElement('img');
    img.src = guitar.image;
    img.alt = guitar.name;

    let title = document.createElement('h3');
    title.textContent = guitar.name;

    let price = document.createElement('p');
    price.className = 'price';
    price.textContent = `$${guitar.price.toLocaleString()}`;

    card.appendChild(badge);
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(price);
    return card;
  };

  let newArrivalsGrid = document.getElementById('new-arrivals-grid');
  if (newArrivalsGrid) {
    newArrivalsGrid.innerHTML = '';
    let newItems = allGuitars.filter(g => g.isNew).slice(0, 4);
    newItems.forEach(g => newArrivalsGrid.appendChild(createFeaturedCard(g, 'NEW', 'badge-new')));
  }

  let bestSellersGrid = document.getElementById('best-sellers-grid');
  if (bestSellersGrid) {
    bestSellersGrid.innerHTML = '';
    let hotItems = allGuitars.filter(g => g.isBestSeller).slice(0, 4);
    hotItems.forEach(g => bestSellersGrid.appendChild(createFeaturedCard(g, 'HOT', 'badge-hot')));
  }
}

function selectProduct(guitar) {
  localStorage.setItem('selectedProduct', JSON.stringify(guitar));
  localStorage.setItem('selectedProductId', guitar.id);
  window.location.href = `product.html?id=${encodeURIComponent(guitar.id)}&brand=${encodeURIComponent(guitar.brand)}`;
}

function setupSearch() {
  let searchToggleBtn = document.getElementById('search-toggle-btn');
  let searchModal = document.getElementById('search-modal');
  let closeSearchBtn = document.getElementById('close-search-btn');
  let searchForm = document.getElementById('search-form');
  let searchInput = document.getElementById('search-input');

  if (searchToggleBtn && searchModal) {
    searchToggleBtn.addEventListener('click', () => {
      searchModal.classList.remove('hidden');
      if (searchInput) searchInput.focus();
    });
  }

  if (closeSearchBtn && searchModal) {
    closeSearchBtn.addEventListener('click', () => {
      searchModal.classList.add('hidden');
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let query = searchInput.value.toLowerCase().trim();

      if (searchModal) searchModal.classList.add('hidden');

      let featuredSection = document.querySelector('.featured-section');
      if (!query) {
        if (featuredSection) featuredSection.style.display = 'flex';
        renderAllBrands();
        return;
      }

      if (featuredSection) featuredSection.style.display = 'none';

      let brandMap = {
        Gibson: gibsonGuitars,
        Fender: fenderGuitars,
        Epiphone: epiphoneGuitars,
        Kramer: kramerGuitars,
        PRS: prsGuitars
      };

      Object.entries(brandMap).forEach(([brandName, guitars]) => {
        let matches = guitars.filter(g =>
          g.name.toLowerCase().includes(query) ||
          g.brand.toLowerCase().includes(query)
        );
        renderBrandSection(brandName, matches);
      });
    });
  }
}

function setupChatWidget() {
  let openChatBtn = document.getElementById('open-chat-btn');
  let closeChatBtn = document.getElementById('close-chat-btn');
  let chatWidget = document.getElementById('chat-widget-container');

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
}