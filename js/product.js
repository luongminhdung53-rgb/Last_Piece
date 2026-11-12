import { db, requireAuth, syncCartBadge } from './firebase-config.js';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;
let currentGuitar = null;

requireAuth(async (user) => {
  currentUser = user;

  const urlParams = new URLSearchParams(window.location.search);
  const guitarId = urlParams.get('id') || localStorage.getItem('selectedProductId');

  if (!guitarId) {
    alert("No guitar selected. Returning to store.");
    window.location.href = 'Website.html';
    return;
  }

  await loadGuitarDetails(guitarId);
  setupCommentsListener(guitarId);
});

async function loadGuitarDetails(guitarId) {
  try {
    const docRef = doc(db, "guitars", guitarId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("Guitar not found in database.");
      window.location.href = 'Website.html';
      return;
    }

    currentGuitar = { id: docSnap.id, ...docSnap.data() };

    const setElementText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    setElementText('product-title', currentGuitar.name);
    setElementText('product-title-path', currentGuitar.name);
    setElementText('product-brand', currentGuitar.brand);
    setElementText('product-brand-path', currentGuitar.brand);
    setElementText('product-price', `$${Number(currentGuitar.price).toLocaleString()}`);
    setElementText('product-description', currentGuitar.description || "No description available.");

    const imgEl = document.getElementById('product-img');
    if (imgEl && currentGuitar.image) {
      imgEl.src = currentGuitar.image;
      imgEl.alt = currentGuitar.name;
    }
  } catch (error) {
    console.error("Failed to fetch guitar details:", error);
  }
}

function setupCommentsListener(guitarId) {
  const commentsList = document.getElementById('comments-list');
  if (!commentsList) return;

  const commentsRef = collection(db, "guitars", guitarId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      commentsList.innerHTML = '<p style="color: #d8c8b8; font-style: italic;">No reviews yet. Be the first guitarist to share your thoughts!</p>';
      return;
    }

    commentsList.innerHTML = snapshot.docs.map(docSnap => {
      const c = docSnap.data();
      const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '';
      return `
        <div class="comment-card">
          <div class="comment-header">
            <span class="comment-author">${c.userName}</span>
            <span class="comment-date">${dateStr}</span>
          </div>
          <p class="comment-body">${escapeHTML(c.text)}</p>
        </div>
      `;
    }).join('');
  });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
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

  // Add to Firestore Cart
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async () => {
      if (!currentUser || !currentGuitar) return;

      const quantity = parseInt(qtyInput ? qtyInput.value : 1) || 1;
      const numericPrice = Number(currentGuitar.price) || 0;

      try {
        const cartRef = doc(db, "carts", currentUser.uid);
        const cartSnap = await getDoc(cartRef);
        let items = cartSnap.exists() ? (cartSnap.data().items || []) : [];

        const existingIndex = items.findIndex(item => item.id === currentGuitar.id);
        if (existingIndex > -1) {
          items[existingIndex].quantity += quantity;
        } else {
          items.push({
            id: currentGuitar.id,
            name: currentGuitar.name,
            price: numericPrice,
            brand: currentGuitar.brand,
            img: currentGuitar.image,
            quantity: quantity
          });
        }

        await setDoc(cartRef, { items });
        await syncCartBadge(currentUser.uid);

        const originalHTML = addToCartBtn.innerHTML;
        addToCartBtn.textContent = "Added to Cart!";
        addToCartBtn.style.backgroundColor = "#4CAF50";

        setTimeout(() => {
          addToCartBtn.innerHTML = originalHTML;
          addToCartBtn.style.backgroundColor = "";
        }, 1500);
      } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Failed to update cart: " + error.message);
      }
    });
  }

  // Submit Product Comment to Firestore
  const commentForm = document.getElementById('comment-form');
  const commentInput = document.getElementById('comment-input');

  if (commentForm && commentInput) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!currentUser || !currentGuitar) return;

      const text = commentInput.value.trim();
      if (!text) return;

      try {
        const commentsRef = collection(db, "guitars", currentGuitar.id, "comments");
        await addDoc(commentsRef, {
          uid: currentUser.uid,
          userName: currentUser.displayName || currentUser.email.split('@')[0],
          text: text,
          createdAt: new Date().toISOString()
        });
        commentInput.value = '';
      } catch (error) {
        console.error("Failed to post comment:", error);
        alert("Could not post comment: " + error.message);
      }
    });
  }
});