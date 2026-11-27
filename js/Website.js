// Import Firebase Auth instance and Firestore database instance from your config file
import { auth, db } from './firebase-config.js';
// Import Firebase Auth listener to detect when a user is signed in
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// Import Firestore functions:
// - collection & getDocs: read multiple documents inside a collection (e.g., all guitars in "Gibson")
// - doc & getDoc: read one specific document by path (e.g., "carts/{userId}")
import { collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Arrays holding guitars fetched from each brand collection in Firestore
let gibsonGuitars = [];
let fenderGuitars = [];
let epiphoneGuitars = [];
let kramerGuitars = [];
let prsGuitars = [];

// Array holding the current user's cart items ({ id, brand, name, price, img, quantity })
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

// Combines all 5 brand arrays into one flat list (used for New Arrivals & Best Sellers)
function getAllGuitars() {
  return [
    ...gibsonGuitars,
    ...fenderGuitars,
    ...epiphoneGuitars,
    ...kramerGuitars,
    ...prsGuitars
  ];
}

// Makes sure price and quantity are always numbers (prevents string bugs like "1" + 1 = "11")
function normalizeCartItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => ({
    ...item,
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1
  }));
}

// Saves a local backup of the cart in browser localStorage so other pages/loads can read it quickly
function syncLocalCartCache(items) {
  localStorage.setItem('guitarentCart', JSON.stringify(items));
  localStorage.setItem('cart', JSON.stringify(items));
}

// ============================================================================
// [PUTS DATA OUT TO WEBSITE] Updates the Cart (X) badge in the navbar
// ============================================================================
function updateCartBadge(items = cartItems) {
  // Sum up `quantity` across all cart items (defaults each item to 1 if missing)
  let totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  // Find <span id="cart-count">0</span> inside index.html
  let badge = document.getElementById('cart-count');
  // Put the calculated number into the DOM text so the user sees it
  if (badge) {
    badge.textContent = totalQty;
  }
}

// Reads any cached cart from localStorage immediately on page load before Firestore responds
function loadCartFromLocalCache() {
  let savedCart = JSON.parse(localStorage.getItem('guitarentCart'))
    || JSON.parse(localStorage.getItem('cart'))
    || [];
  cartItems = normalizeCartItems(savedCart);
  // Show cached count right away
  updateCartBadge(cartItems);
}

// ============================================================================
// [GETS DATA FROM FIRESTORE] Reads the signed-in user's cart from "carts/{uid}"
// ============================================================================
async function loadCartFromFirestore(uid) {
  if (!uid) return;
  try {
    // Point to document "carts/<user.uid>" in Firestore
    let cartRef = doc(db, 'carts', uid);
    // Fetch the document snapshot from Firestore
    let cartSnap = await getDoc(cartRef);

    // If the user has a cart document in Firestore, extract its `items` array
    if (cartSnap.exists()) {
      let data = cartSnap.data();
      cartItems = normalizeCartItems(data.items);
      // Keep localStorage in sync with Firestore's latest cart
      syncLocalCartCache(cartItems);
    }
    // [PUTS DATA OUT TO WEBSITE] Refresh #cart-count with Firestore's cart total
    updateCartBadge(cartItems);
  } catch (error) {
    console.error("Failed to load user cart:", error.code, error.message);
  }
}

// Runs once the HTML document is parsed
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromLocalCache();
  setupSearch();
  setupChatWidget();

  // Waits for Firebase Auth to confirm who is logged in (auth takes a moment on page load)
  onAuthStateChanged(auth, async (user) => {
    // Redirect to login page if nobody is signed in
    if (!user) {
      window.location.href = 'Sign_in.html';
      return;
    }

    // [PUTS DATA OUT TO WEBSITE] Replaces "Sign In" button with user's name linking to profile.html
    let authContainer = document.getElementById('nav-auth-container');
    if (authContainer) {
      let displayName = user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0];
      authContainer.innerHTML = `
        <a href="profile.html" id="button" style="background-color: #d4a853; color: #3b240b;">
          ${displayName}
        </a>
      `;
    }

    // Load this user's cart and guitar catalog from Firestore
    await loadCartFromFirestore(user.uid);
    await loadCatalogFromFirestore();
  });
});

// ============================================================================
// [GETS DATA FROM FIRESTORE] Reads all guitars from each brand collection
// ============================================================================
async function loadCatalogFromFirestore() {
  try {
    // Reset arrays before filling them with fresh Firestore data
    gibsonGuitars = [];
    fenderGuitars = [];
    epiphoneGuitars = [];
    kramerGuitars = [];
    prsGuitars = [];

    // Maps each Firestore collection name to its matching local array
    let brandSources = [
      { name: 'Gibson', targetArray: gibsonGuitars },
      { name: 'Fender', targetArray: fenderGuitars },
      { name: 'Epiphone', targetArray: epiphoneGuitars },
      { name: 'Kramer', targetArray: kramerGuitars },
      { name: 'PRS', targetArray: prsGuitars }
    ];

    let totalDocs = 0;

    // Loop through each brand collection and fetch all documents inside it
    for (let source of brandSources) {
      let querySnapshot = await getDocs(collection(db, source.name));
      totalDocs += querySnapshot.size;

      // Convert each Firestore document into a clean guitar object for the UI
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

    // [PUTS DATA OUT TO WEBSITE] Draw guitar cards onto the page once data is loaded
    renderAllBrands();
    renderFeaturedSections();
  } catch (error) {
    console.error("Failed to fetch guitars from Firestore:", error.code, error.message);
    alert("Database error: " + error.message);
  }
}

// ============================================================================
// [PUTS DATA OUT TO WEBSITE] Creates DOM cards for one brand and inserts them
// ============================================================================
function renderBrandSection(brandName, guitarArray) {
  // Locate the <section id="Gibson"> (etc.) in index.html
  let section = document.getElementById(brandName);
  if (!section) return;

  // Locate <div class="product-grid"> inside that brand section
  let grid = section.querySelector('.product-grid');
  if (!grid) return;

  // Clear old cards before rendering
  grid.innerHTML = '';

  // Hide empty brand sections so the page doesn't show blank headers
  if (guitarArray.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';

  // Build a card element for each guitar and append it to .product-grid
  guitarArray.forEach((guitar) => {
    let card = document.createElement('div');
    card.className = 'product-card';
    // Clicking a card saves the selected guitar and navigates to product.html
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

// [PUTS DATA OUT TO WEBSITE] Renders all 5 brand sections on the main page
function renderAllBrands() {
  renderBrandSection('Gibson', gibsonGuitars);
  renderBrandSection('Fender', fenderGuitars);
  renderBrandSection('Epiphone', epiphoneGuitars);
  renderBrandSection('Kramer', kramerGuitars);
  renderBrandSection('PRS', prsGuitars);
}

// ============================================================================
// [PUTS DATA OUT TO WEBSITE] Renders New Arrivals & Best Sellers grids
// ============================================================================
function renderFeaturedSections() {
  let allGuitars = getAllGuitars();

  // Helper that builds a featured card with a "NEW" or "HOT" badge
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

  // Put up to 4 "new: true" guitars into #new-arrivals-grid
  let newArrivalsGrid = document.getElementById('new-arrivals-grid');
  if (newArrivalsGrid) {
    newArrivalsGrid.innerHTML = '';
    let newItems = allGuitars.filter(g => g.isNew).slice(0, 4);
    newItems.forEach(g => newArrivalsGrid.appendChild(createFeaturedCard(g, 'NEW', 'badge-new')));
  }

  // Put up to 4 "bestSeller: true" guitars into #best-sellers-grid
  let bestSellersGrid = document.getElementById('best-sellers-grid');
  if (bestSellersGrid) {
    bestSellersGrid.innerHTML = '';
    let hotItems = allGuitars.filter(g => g.isBestSeller).slice(0, 4);
    hotItems.forEach(g => bestSellersGrid.appendChild(createFeaturedCard(g, 'HOT', 'badge-hot')));
  }
}

// Saves clicked guitar and opens product.html with id and brand in the URL query string
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

      // [PUTS DATA OUT TO WEBSITE] Re-renders each brand section with only matching guitars
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