/* ============================================================
   data.js
   Responsibility:
   - Default product data (the ONE source of truth for products)
   - localStorage keys
   - Generic localStorage read/write helpers
   - Storage initialization (products, cart, orders)
   - Shared product lookup helpers
   ============================================================ */

/* ---------- localStorage keys (keep these consistent everywhere) ---------- */
const STORAGE_KEYS = {
  PRODUCTS: "hobbyshop_products",
  CART: "hobbyshop_cart",
  ORDERS: "hobbyshop_orders"
};

/* ---------- Default product data ---------- */
/* This is the ONLY place product info should be written manually.
   Every page reads from localStorage, which is seeded from this list. */
const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    name: "Charizard Holo Card",
    category: "Trading Cards",
    price: 89.99,
    stock: 12,
    image: "assets/images/placeholder.png",
    description: "A holographic collector's card featuring Charizard. A must-have for trading card enthusiasts.",
    badge: "Rare"
  },
  {
    id: "p2",
    name: "Pikachu VMAX Card",
    category: "Trading Cards",
    price: 45.50,
    stock: 3,
    image: "assets/images/placeholder.png",
    description: "A powerful VMAX card featuring everyone's favorite electric mouse.",
    badge: "Hot"
  },
  {
    id: "p3",
    name: "Classic Castle Building Set",
    category: "Building Sets",
    price: 129.99,
    stock: 8,
    image: "assets/images/placeholder.png",
    description: "A detailed medieval castle building set with over 900 pieces.",
    badge: ""
  },
  {
    id: "p4",
    name: "LEGO Star Explorer Set",
    category: "Building Sets",
    price: 199.99,
    stock: 0,
    image: "assets/images/placeholder.png",
    description: "A space-themed building set featuring an explorer ship and minifigures.",
    badge: "Sold Out"
  },
  {
    id: "p5",
    name: "Hot Wheels Speed Racer Pack",
    category: "Die-Cast",
    price: 19.99,
    stock: 25,
    image: "assets/images/placeholder.png",
    description: "A 5-pack of die-cast racing cars, perfect for track sets.",
    badge: ""
  },
  {
    id: "p6",
    name: "Classic Muscle Car Die-Cast 1:18",
    category: "Die-Cast",
    price: 34.99,
    stock: 4,
    image: "assets/images/placeholder.png",
    description: "A highly detailed 1:18 scale die-cast muscle car replica.",
    badge: ""
  },
  {
    id: "p7",
    name: "Gundam RX-78-2 Model Kit",
    category: "Model Kits",
    price: 54.99,
    stock: 15,
    image: "assets/images/placeholder.png",
    description: "A classic RX-78-2 Gundam plastic model kit with snap-fit assembly.",
    badge: "New"
  },
  {
    id: "p8",
    name: "Zaku II Model Kit",
    category: "Model Kits",
    price: 49.99,
    stock: 6,
    image: "assets/images/placeholder.png",
    description: "A detailed Zaku II mobile suit model kit for hobbyist builders.",
    badge: ""
  },
  {
    id: "p9",
    name: "Limited Edition Collector Figure",
    category: "Collectibles",
    price: 74.99,
    stock: 2,
    image: "assets/images/placeholder.png",
    description: "A limited run collectible figure with premium detailing.",
    badge: "Limited"
  },
  {
    id: "p10",
    name: "Vintage Comic Statue",
    category: "Collectibles",
    price: 149.99,
    stock: 10,
    image: "assets/images/placeholder.png",
    description: "A hand-painted statue inspired by classic vintage comic art.",
    badge: ""
  },
  {
    id: "p11",
    name: "Hobby Paint & Tool Set",
    category: "Hobby Accessories",
    price: 24.99,
    stock: 20,
    image: "assets/images/placeholder.png",
    description: "A starter set of paints, brushes, and tools for model building.",
    badge: ""
  },
  {
    id: "p12",
    name: "Display Case Stand",
    category: "Hobby Accessories",
    price: 15.99,
    stock: 30,
    image: "assets/images/placeholder.png",
    description: "A clear acrylic display case to protect and showcase your collectibles.",
    badge: ""
  }
];

/* ---------- Generic localStorage helpers ---------- */
function getFromStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallbackValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading storage key:", key, err);
    return fallbackValue;
  }
}

function setToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Error writing storage key:", key, err);
  }
}

/* ---------- Storage initialization ---------- */
/* Call this once on every page before reading/rendering anything. */
function initStorage() {
  if (localStorage.getItem(STORAGE_KEYS.PRODUCTS) === null) {
    setToStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  }
  if (localStorage.getItem(STORAGE_KEYS.CART) === null) {
    setToStorage(STORAGE_KEYS.CART, []);
  }
  if (localStorage.getItem(STORAGE_KEYS.ORDERS) === null) {
    setToStorage(STORAGE_KEYS.ORDERS, []);
  }
}

/* ---------- Product helpers (used by products.js, app.js, admin.js, cart.js) ---------- */
function getProducts() {
  return getFromStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
}

function saveProducts(products) {
  setToStorage(STORAGE_KEYS.PRODUCTS, products);
}

function getProductById(id) {
  const products = getProducts();
  return products.find(function (product) {
    return product.id === id;
  });
}

function getAllCategories() {
  const products = getProducts();
  const categories = [];
  products.forEach(function (product) {
    if (categories.indexOf(product.category) === -1) {
      categories.push(product.category);
    }
  });
  return categories;
}

function formatPrice(price) {
  return "$" + Number(price).toFixed(2);
}
