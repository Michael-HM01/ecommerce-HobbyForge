/* ============================================================
   products.js
   Responsibility:
   - Rendering product cards (featured + full grid)
   - Search
   - Category filters
   - Sorting
   - Product Details Modal (open/close, quantity, add to cart)
   ============================================================ */

/* Keeps track of the current modal product + selected quantity */
let currentModalProductId = null;
let currentModalQuantity = 1;

/* ---------- Card builder (shared by featured + grid) ---------- */
function buildProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  let stockLabel = "";
  let stockClass = "";
  let addToCartDisabled = "";

  if (product.stock <= 0) {
    stockLabel = "Out of Stock";
    stockClass = "stock-out";
    addToCartDisabled = "disabled";
  } else if (product.stock <= 5) {
    stockLabel = "Low Stock (" + product.stock + " left)";
    stockClass = "stock-low";
  } else {
    stockLabel = "In Stock";
    stockClass = "stock-ok";
  }

  const badgeHtml = product.badge
    ? '<span class="product-badge">' + product.badge + '</span>'
    : "";

  card.innerHTML =
    '<div class="product-img-wrap js-view-details" data-id="' + product.id + '">' +
      badgeHtml +
      '<img src="' + product.image + '" alt="' + product.name + '" class="product-img">' +
    '</div>' +
    '<div class="product-card-body">' +
      '<p class="product-category">' + product.category + '</p>' +
      '<h3 class="product-name">' + product.name + '</h3>' +
      '<p class="product-price">' + formatPrice(product.price) + '</p>' +
      '<p class="stock-status ' + stockClass + '">' + stockLabel + '</p>' +
      '<div class="product-card-actions">' +
        '<button class="btn btn-outline js-view-details" data-id="' + product.id + '">View Details</button>' +
        '<button class="btn btn-primary js-add-to-cart" data-id="' + product.id + '" ' + addToCartDisabled + '>Add to Cart</button>' +
      '</div>' +
    '</div>';

  return card;
}

/* ---------- Featured products (home page) ---------- */
function renderFeaturedProducts() {
  const container = document.getElementById("featured-products");
  if (!container) return;

  const products = getProducts().slice(0, 6);
  container.innerHTML = "";
  products.forEach(function (product) {
    container.appendChild(buildProductCard(product));
  });

  attachProductCardListeners();
}

/* ---------- Product grid (products page) ---------- */
function getActiveFilters() {
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const activeFilterBtn = document.querySelector(".filter-btn.active");

  return {
    search: searchInput ? searchInput.value.trim().toLowerCase() : "",
    category: activeFilterBtn ? activeFilterBtn.getAttribute("data-category") : "All",
    sort: sortSelect ? sortSelect.value : "default"
  };
}

function applyFiltersAndRender() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const filters = getActiveFilters();
  let products = getProducts();

  if (filters.category && filters.category !== "All") {
    products = products.filter(function (p) {
      return p.category === filters.category;
    });
  }

  if (filters.search) {
    products = products.filter(function (p) {
      return (
        p.name.toLowerCase().indexOf(filters.search) !== -1 ||
        p.category.toLowerCase().indexOf(filters.search) !== -1
      );
    });
  }

  if (filters.sort === "price-asc") {
    products = products.slice().sort(function (a, b) { return a.price - b.price; });
  } else if (filters.sort === "price-desc") {
    products = products.slice().sort(function (a, b) { return b.price - a.price; });
  } else if (filters.sort === "name-asc") {
    products = products.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
  }

  grid.innerHTML = "";

  const noResultsEl = document.getElementById("no-results");
  if (products.length === 0) {
    if (noResultsEl) noResultsEl.style.display = "block";
  } else {
    if (noResultsEl) noResultsEl.style.display = "none";
  }

  products.forEach(function (product) {
    grid.appendChild(buildProductCard(product));
  });

  attachProductCardListeners();
}

/* ---------- Category filter buttons (built dynamically from data) ---------- */
function renderCategoryFilters() {
  const filterContainer = document.getElementById("category-filters");
  if (!filterContainer) return;

  const categories = ["All"].concat(getAllCategories());

  filterContainer.innerHTML = "";
  categories.forEach(function (category) {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = category;
    btn.setAttribute("data-category", category);
    filterContainer.appendChild(btn);
  });

  // Check if a category was passed from the home page (URL param or localStorage)
  const urlParams = new URLSearchParams(window.location.search);
  let preselectedCategory = urlParams.get("category");
  if (!preselectedCategory) {
    preselectedCategory = localStorage.getItem("hobbyshop_selected_category");
  }
  localStorage.removeItem("hobbyshop_selected_category");

  const buttons = filterContainer.querySelectorAll(".filter-btn");
  let matched = false;
  buttons.forEach(function (btn) {
    if (preselectedCategory && btn.getAttribute("data-category") === preselectedCategory) {
      btn.classList.add("active");
      matched = true;
    }
  });
  if (!matched && buttons.length > 0) {
    buttons[0].classList.add("active");
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterContainer.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      applyFiltersAndRender();
    });
  });
}

/* ---------- Category cards on home page (navigate to products.html) ---------- */
function initHomeCategoryCards() {
  const cards = document.querySelectorAll(".js-category-card");
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      const category = card.getAttribute("data-category");
      localStorage.setItem("hobbyshop_selected_category", category);
      window.location.href = "products.html?category=" + encodeURIComponent(category);
    });
  });
}

/* ---------- Search + sort listeners (products page) ---------- */
function initProductControls() {
  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");

  if (searchInput) {
    searchInput.addEventListener("input", applyFiltersAndRender);
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", applyFiltersAndRender);
  }
}

/* ---------- Add to cart buttons on cards ---------- */
function attachProductCardListeners() {
  document.querySelectorAll(".js-view-details").forEach(function (el) {
    el.addEventListener("click", function () {
      const id = el.getAttribute("data-id");
      openProductModal(id);
    });
  });

  document.querySelectorAll(".js-add-to-cart").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("data-id");
      addToCart(id, 1);
    });
  });
}

/* ---------- Product Details Modal ---------- */
function openProductModal(productId) {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  const product = getProductById(productId);
  if (!product) return;

  currentModalProductId = productId;
  currentModalQuantity = 1;

  document.getElementById("modal-img").src = product.image;
  document.getElementById("modal-img").alt = product.name;
  document.getElementById("modal-name").textContent = product.name;
  document.getElementById("modal-category").textContent = product.category;
  document.getElementById("modal-price").textContent = formatPrice(product.price);
  document.getElementById("modal-description").textContent = product.description;

  const stockEl = document.getElementById("modal-stock");
  const addBtn = document.getElementById("modal-add-to-cart");
  const qtyValueEl = document.getElementById("modal-qty-value");
  qtyValueEl.textContent = currentModalQuantity;

  if (product.stock <= 0) {
    stockEl.textContent = "Out of Stock";
    stockEl.className = "stock-status stock-out";
    addBtn.disabled = true;
  } else if (product.stock <= 5) {
    stockEl.textContent = "Low Stock (" + product.stock + " left)";
    stockEl.className = "stock-status stock-low";
    addBtn.disabled = false;
  } else {
    stockEl.textContent = "In Stock (" + product.stock + " available)";
    stockEl.className = "stock-status stock-ok";
    addBtn.disabled = false;
  }

  modal.classList.add("open");
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;
  modal.classList.remove("open");
  currentModalProductId = null;
  currentModalQuantity = 1;
}

function changeModalQuantity(delta) {
  const product = getProductById(currentModalProductId);
  if (!product) return;

  let newQty = currentModalQuantity + delta;
  if (newQty < 1) newQty = 1;
  if (newQty > product.stock) newQty = product.stock;
  currentModalQuantity = newQty;

  const qtyValueEl = document.getElementById("modal-qty-value");
  if (qtyValueEl) qtyValueEl.textContent = currentModalQuantity;
}

function initProductModal() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  const closeBtn = document.getElementById("modal-close-btn");
  const overlay = document.getElementById("modal-overlay");
  const increaseBtn = document.getElementById("modal-qty-increase");
  const decreaseBtn = document.getElementById("modal-qty-decrease");
  const addBtn = document.getElementById("modal-add-to-cart");

  if (closeBtn) closeBtn.addEventListener("click", closeProductModal);
  if (overlay) overlay.addEventListener("click", closeProductModal);
  if (increaseBtn) increaseBtn.addEventListener("click", function () { changeModalQuantity(1); });
  if (decreaseBtn) decreaseBtn.addEventListener("click", function () { changeModalQuantity(-1); });

  if (addBtn) {
    addBtn.addEventListener("click", function () {
      if (!currentModalProductId) return;
      addToCart(currentModalProductId, currentModalQuantity);
      closeProductModal();
      openCartDrawer();
    });
  }
}

/* ---------- Page init ---------- */
document.addEventListener("DOMContentLoaded", function () {
  initStorage();

  renderFeaturedProducts();
  initHomeCategoryCards();

  renderCategoryFilters();
  initProductControls();
  applyFiltersAndRender();

  initProductModal();
});
