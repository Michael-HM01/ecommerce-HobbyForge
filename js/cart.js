/* ============================================================
   cart.js
   Responsibility:
   - Cart storage (read/write cart in localStorage)
   - Add to cart / remove from cart
   - Quantity controls
   - Totals (subtotal, total)
   - Cart drawer rendering
   - Cart count badge
   ============================================================ */

/* ---------- Cart storage ---------- */
function getCart() {
  return getFromStorage(STORAGE_KEYS.CART, []);
}

function saveCart(cart) {
  setToStorage(STORAGE_KEYS.CART, cart);
}

/* ---------- Cart operations ---------- */
function addToCart(productId, quantity) {
  const product = getProductById(productId);
  if (!product) return;
  if (product.stock <= 0) return;

  const qtyToAdd = quantity && quantity > 0 ? quantity : 1;
  const cart = getCart();
  const existingItem = cart.find(function (item) {
    return item.id === productId;
  });

  if (existingItem) {
    const newQty = existingItem.quantity + qtyToAdd;
    existingItem.quantity = Math.min(newQty, product.stock);
  } else {
    cart.push({
      id: product.id,
      quantity: Math.min(qtyToAdd, product.stock)
    });
  }

  saveCart(cart);
  updateCartCount();
  renderCartDrawer();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(function (item) {
    return item.id !== productId;
  });
  saveCart(cart);
  updateCartCount();
  renderCartDrawer();
}

function updateCartItemQuantity(productId, newQuantity) {
  const product = getProductById(productId);
  if (!product) return;

  const cart = getCart();
  const item = cart.find(function (i) {
    return i.id === productId;
  });
  if (!item) return;

  let qty = newQuantity;
  if (qty < 1) qty = 1;
  if (qty > product.stock) qty = product.stock;
  item.quantity = qty;

  saveCart(cart);
  updateCartCount();
  renderCartDrawer();
}

/* ---------- Totals ---------- */
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);
}

function getCartTotal() {
  const cart = getCart();
  let total = 0;
  cart.forEach(function (item) {
    const product = getProductById(item.id);
    if (product) {
      total += product.price * item.quantity;
    }
  });
  return total;
}

/* ---------- Cart count badge (exists on every page's nav) ---------- */
function updateCartCount() {
  const countEls = document.querySelectorAll(".js-cart-count");
  if (countEls.length === 0) return;
  const count = getCartItemCount();
  countEls.forEach(function (el) {
    el.textContent = count;
  });
}

/* ---------- Cart drawer rendering ---------- */
function renderCartDrawer() {
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartEmptyEl = document.getElementById("cart-empty");

  if (!cartItemsEl) return; // cart drawer not on this page

  const cart = getCart();
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    if (cartEmptyEl) cartEmptyEl.style.display = "block";
  } else {
    if (cartEmptyEl) cartEmptyEl.style.display = "none";
  }

  cart.forEach(function (item) {
    const product = getProductById(item.id);
    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML =
      '<img src="' + product.image + '" alt="' + product.name + '" class="cart-item-img">' +
      '<div class="cart-item-info">' +
        '<p class="cart-item-name">' + product.name + '</p>' +
        '<p class="cart-item-price">' + formatPrice(product.price) + '</p>' +
        '<div class="cart-qty-controls">' +
          '<button class="qty-btn js-cart-decrease" data-id="' + product.id + '">-</button>' +
          '<span class="qty-value">' + item.quantity + '</span>' +
          '<button class="qty-btn js-cart-increase" data-id="' + product.id + '">+</button>' +
        '</div>' +
      '</div>' +
      '<button class="cart-remove-btn js-cart-remove" data-id="' + product.id + '" aria-label="Remove item">&times;</button>';

    cartItemsEl.appendChild(row);
  });

  if (cartTotalEl) {
    cartTotalEl.textContent = formatPrice(getCartTotal());
  }

  attachCartItemListeners();
}

function attachCartItemListeners() {
  document.querySelectorAll(".js-cart-increase").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("data-id");
      const cart = getCart();
      const item = cart.find(function (i) { return i.id === id; });
      if (item) updateCartItemQuantity(id, item.quantity + 1);
    });
  });

  document.querySelectorAll(".js-cart-decrease").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("data-id");
      const cart = getCart();
      const item = cart.find(function (i) { return i.id === id; });
      if (item) updateCartItemQuantity(id, item.quantity - 1);
    });
  });

  document.querySelectorAll(".js-cart-remove").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("data-id");
      removeFromCart(id);
    });
  });
}

/* ---------- Cart drawer open/close ---------- */
function openCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  if (!drawer) return;
  drawer.classList.add("open");
  if (overlay) overlay.classList.add("open");
  renderCartDrawer();
}

function closeCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  if (!drawer) return;
  drawer.classList.remove("open");
  if (overlay) overlay.classList.remove("open");
}

/* ---------- Init (called on DOMContentLoaded from app.js flow) ---------- */
function initCart() {
  initStorage();
  updateCartCount();
  renderCartDrawer();

  const cartButtons = document.querySelectorAll(".js-open-cart");
  cartButtons.forEach(function (btn) {
    btn.addEventListener("click", openCartDrawer);
  });

  const closeBtn = document.getElementById("cart-close-btn");
  if (closeBtn) closeBtn.addEventListener("click", closeCartDrawer);

  const overlay = document.getElementById("cart-overlay");
  if (overlay) overlay.addEventListener("click", closeCartDrawer);

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      alert("Checkout functionality will be implemented in the next phase.");
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initCart();
});
