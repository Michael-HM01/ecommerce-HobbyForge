/* ============================================================
   admin.js
   Responsibility:
   - Dashboard statistics (total / low stock / out of stock / cart items)
   - Product table rendering
   - Edit product (price + stock) via modal
   - Delete product (with confirmation)
   No authentication is implemented — this is a foundation only.
   ============================================================ */

let editingProductId = null;

document.addEventListener("DOMContentLoaded", function () {
  initStorage();
  renderDashboardStats();
  renderProductTable();
  initAdminEditModal();
  initAddProductForm();
});

/* ---------- Dashboard stats ---------- */
function renderDashboardStats() {
  const products = getProducts();
  const cart = getCart();

  const totalEl = document.getElementById("stat-total-products");
  const lowStockEl = document.getElementById("stat-low-stock");
  const outOfStockEl = document.getElementById("stat-out-of-stock");
  const cartItemsEl = document.getElementById("stat-cart-items");

  if (totalEl) totalEl.textContent = products.length;

  if (lowStockEl) {
    const lowStockCount = products.filter(function (p) {
      return p.stock > 0 && p.stock <= 5;
    }).length;
    lowStockEl.textContent = lowStockCount;
  }

  if (outOfStockEl) {
    const outOfStockCount = products.filter(function (p) {
      return p.stock <= 0;
    }).length;
    outOfStockEl.textContent = outOfStockCount;
  }

  if (cartItemsEl) {
    const totalCartItems = cart.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
    cartItemsEl.textContent = totalCartItems;
  }
}

/* ---------- Product table ---------- */
function renderProductTable() {
  const tableBody = document.getElementById("admin-product-table-body");
  if (!tableBody) return;

  const products = getProducts();
  tableBody.innerHTML = "";

  products.forEach(function (product) {
    const row = document.createElement("tr");
    row.innerHTML =
      "<td>" + product.id + "</td>" +
      "<td>" + product.name + "</td>" +
      "<td>" + product.category + "</td>" +
      "<td>" + formatPrice(product.price) + "</td>" +
      "<td>" + product.stock + "</td>" +
      "<td class='admin-actions'>" +
        "<button class='btn btn-small btn-outline js-edit-product' data-id='" + product.id + "'>Edit</button>" +
        "<button class='btn btn-small btn-danger js-delete-product' data-id='" + product.id + "'>Delete</button>" +
      "</td>";
    tableBody.appendChild(row);
  });

  attachAdminTableListeners();
}

function attachAdminTableListeners() {
  document.querySelectorAll(".js-edit-product").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openEditModal(btn.getAttribute("data-id"));
    });
  });

  document.querySelectorAll(".js-delete-product").forEach(function (btn) {
    btn.addEventListener("click", function () {
      deleteProduct(btn.getAttribute("data-id"));
    });
  });
}

/* ---------- Edit product ---------- */
function openEditModal(productId) {
  const modal = document.getElementById("edit-product-modal");
  const product = getProductById(productId);
  if (!modal || !product) return;

  editingProductId = productId;

  document.getElementById("edit-product-name").textContent = product.name;
  document.getElementById("edit-price-input").value = product.price;
  document.getElementById("edit-stock-input").value = product.stock;

  modal.classList.add("open");
}

function closeEditModal() {
  const modal = document.getElementById("edit-product-modal");
  if (!modal) return;
  modal.classList.remove("open");
  editingProductId = null;
}

function saveEditedProduct() {
  if (!editingProductId) return;

  const priceInput = document.getElementById("edit-price-input");
  const stockInput = document.getElementById("edit-stock-input");

  const newPrice = parseFloat(priceInput.value);
  const newStock = parseInt(stockInput.value, 10);

  if (isNaN(newPrice) || newPrice < 0 || isNaN(newStock) || newStock < 0) {
    alert("Please enter valid price and stock values.");
    return;
  }

  const products = getProducts();
  const product = products.find(function (p) { return p.id === editingProductId; });
  if (!product) return;

  product.price = newPrice;
  product.stock = newStock;

  saveProducts(products);
  closeEditModal();
  renderProductTable();
  renderDashboardStats();
}

function initAdminEditModal() {
  const modal = document.getElementById("edit-product-modal");
  if (!modal) return;

  const closeBtn = document.getElementById("edit-modal-close-btn");
  const overlay = document.getElementById("edit-modal-overlay");
  const saveBtn = document.getElementById("edit-modal-save-btn");

  if (closeBtn) closeBtn.addEventListener("click", closeEditModal);
  if (overlay) overlay.addEventListener("click", closeEditModal);
  if (saveBtn) saveBtn.addEventListener("click", saveEditedProduct);
}

/* ---------- Delete product ---------- */
function deleteProduct(productId) {
  const confirmed = confirm("Are you sure you want to delete this product?");
  if (!confirmed) return;

  let products = getProducts();
  products = products.filter(function (p) { return p.id !== productId; });
  saveProducts(products);

  renderProductTable();
  renderDashboardStats();
}

/* ---------- Add product (optional, kept simple) ---------- */
function initAddProductForm() {
  const form = document.getElementById("add-product-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("new-product-name").value.trim();
    const category = document.getElementById("new-product-category").value.trim();
    const price = parseFloat(document.getElementById("new-product-price").value);
    const stock = parseInt(document.getElementById("new-product-stock").value, 10);

    if (!name || !category || isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
      alert("Please fill out all fields with valid values.");
      return;
    }

    const products = getProducts();
    const newId = "p" + (Date.now());

    products.push({
      id: newId,
      name: name,
      category: category,
      price: price,
      stock: stock,
      image: "assets/images/placeholder.png",
      description: "No description provided yet.",
      badge: ""
    });

    saveProducts(products);
    form.reset();
    renderProductTable();
    renderDashboardStats();
  });
}
