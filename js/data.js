/* ============================================================
   data.js
   Responsibility:
   - Official default HobbyForge product catalog
   - localStorage initialization
   - Product CRUD helpers
   - Catalog version management
   - Shared pricing helpers
   ============================================================ */


/* ============================================================
   Storage keys
   ============================================================ */

const STORAGE_KEYS = {
  PRODUCTS: "hobbyshop_products",
  CART: "hobbyshop_cart",
  CATALOG_VERSION: "hobbyshop_catalog_version"
};


/* ============================================================
   Catalog version

   Increase this whenever the official hard-coded catalog changes.

   Version 1.2 forces devices with old/broken product data to
   receive the current official catalog.
   ============================================================ */

const CATALOG_VERSION = "1.2";


/* ============================================================
   Official default product catalog
   ============================================================ */

const DEFAULT_PRODUCTS = [

  {
    id: "p1",
    name: "Charizard Holo Card",
    category: "Trading Cards",
    price: 89.99,
    discountPrice: null,
    stock: 12,
    image: "assets/image/Charizard-HC.jpeg",
    description:
      "A holographic collector's card featuring Charizard. A must-have for trading card enthusiasts.",
    badge: "Rare",
    previousBadge: ""
  },

  {
    id: "p2",
    name: "Pikachu VMAX Card",
    category: "Trading Cards",
    price: 45.50,
    discountPrice: null,
    stock: 3,
    image: "assets/image/Pikachu-Vmax.jpg",
    description:
      "A powerful VMAX card featuring everyone's favorite electric mouse.",
    badge: "Hot",
    previousBadge: ""
  },

  {
    id: "p3",
    name: "Classic Castle Building Set",
    category: "Building Sets",
    price: 129.99,
    discountPrice: null,
    stock: 8,
    image: "assets/image/Classic-Castle.jpg",
    description:
      "A detailed medieval castle building set with over 900 pieces.",
    badge: "",
    previousBadge: ""
  },

  {
    id: "p4",
    name: "LEGO Star Explorer Set",
    category: "Building Sets",
    price: 199.99,
    discountPrice: null,
    stock: 0,
    image: "assets/image/Lego-ex.jpeg",
    description:
      "A space-themed building set featuring an explorer ship and minifigures.",
    badge: "",
    previousBadge: ""
  },

  {
    id: "p5",
    name: "Hot Wheels Speed Racer Pack",
    category: "Die-Cast",
    price: 19.99,
    discountPrice: null,
    stock: 25,
    image: "assets/image/Hotwheels.webp",
    description:
      "A 5-pack of die-cast racing cars, perfect for track sets.",
    badge: "",
    previousBadge: ""
  },

  {
    id: "p6",
    name: "Classic Muscle Car Die-Cast 1:18",
    category: "Die-Cast",
    price: 34.99,
    discountPrice: null,
    stock: 4,
    image: "assets/image/Dodge-Charger.jpeg",
    description:
      "A highly detailed 1:18 scale die-cast muscle car replica.",
    badge: "",
    previousBadge: ""
  },

  {
    id: "p7",
    name: "Gundam RX-78-2 Model Kit",
    category: "Model Kits",
    price: 54.99,
    discountPrice: null,
    stock: 15,
    image: "assets/image/Rx-78.jpeg",
    description:
      "A classic RX-78-2 Gundam plastic model kit with snap-fit assembly.",
    badge: "New",
    previousBadge: ""
  },

  {
    id: "p8",
    name: "Zaku II Model Kit",
    category: "Model Kits",
    price: 49.99,
    discountPrice: null,
    stock: 6,
    image: "assets/image/Zaku2.jpeg",
    description:
      "A detailed Zaku II mobile suit model kit for hobbyist builders.",
    badge: "",
    previousBadge: ""
  },

  {
    id: "p19",
    name: "RG Hi-Nu Gundam 1/144 Scale",
    category: "Model Kits",
    price: 60.99,
    discountPrice: null,
    stock: 2,
    image: "assets/image/Hi-nu.jpg",
    description:
      "Real Grade Gundam Hi-Nu 1/144 scale Bandai model kit.",
    badge: "",
    previousBadge: ""
  },

  {
    id: "p18",
    name: "HGGTO Rx-78-02 Gundam",
    category: "Model Kits",
    price: 31.00,
    discountPrice: null,
    stock: 4,
    image: "assets/image/Rx-78.jpeg",
    description:
      "High Grade Gundam Origins version of the iconic RX-78-02.",
    badge: "Hot",
    previousBadge: ""
  },

  {
    id: "p9",
    name: "Limited Edition Collector Figure",
    category: "Collectibles",
    price: 74.99,
    discountPrice: null,
    stock: 3,
    image: "assets/image/Figure.jpeg",
    description:
      "A limited run collectible figure with premium detailing.",
    badge: "Limited",
    previousBadge: ""
  },

  {
    id: "p11",
    name: "Warhammer Hobby Paint & Tool Set",
    category: "Hobby Accessories",
    price: 24.99,
    discountPrice: null,
    stock: 20,
    image: "assets/image/Paint.jpeg",
    description:
      "A Warhammer set of paints, brushes, and tools for model building.",
    badge: "",
    previousBadge: ""
  },

  {
    id: "p12",
    name: "Display Case Stand",
    category: "Hobby Accessories",
    price: 15.99,
    discountPrice: null,
    stock: 30,
    image: "assets/image/Case.jpeg",
    description:
      "A clear acrylic display case to protect and showcase your collectibles.",
    badge: "",
    previousBadge: ""
  },

  {
    id: "p17",
    name: "Pagmamahal",
    category: "Life aspect",
    price: 10000000,
    discountPrice: null,
    stock: 1,
    image: "assets/image/Love.jpg",
    description:
      "Love life, your soulmate the one..",
    badge: "Rare",
    previousBadge: ""
  }

];


/* ============================================================
   Shared pricing helpers
   ============================================================ */

function getEffectivePrice(product) {

  if (!product) {
    return 0;
  }

  const regularPrice = Number(product.price);
  const discountPrice = Number(product.discountPrice);

  if (
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice !== "" &&
    Number.isFinite(discountPrice) &&
    discountPrice >= 0 &&
    discountPrice < regularPrice
  ) {
    return discountPrice;
  }

  return Number.isFinite(regularPrice)
    ? regularPrice
    : 0;
}


function formatPrice(price) {

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "$0.00";
  }

  return "$" + numericPrice.toFixed(2);
}


/* ============================================================
   Storage helpers
   ============================================================ */

function getFromStorage(key, fallbackValue) {

  try {

    const storedValue = localStorage.getItem(key);

    if (storedValue === null) {
      return fallbackValue;
    }

    return JSON.parse(storedValue);

  } catch (error) {

    console.warn(
      "Could not read localStorage key:",
      key,
      error
    );

    return fallbackValue;
  }

}


function setToStorage(key, value) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

  } catch (error) {

    console.warn(
      "Could not save localStorage key:",
      key,
      error
    );
  }

}


/* ============================================================
   Catalog initialization
   ============================================================ */

function initStorage() {

  const storedCatalogVersion =
    localStorage.getItem(
      STORAGE_KEYS.CATALOG_VERSION
    );

  const storedProducts =
    getFromStorage(
      STORAGE_KEYS.PRODUCTS,
      null
    );


  /*
     Reset when:

     - No product data exists
     - Stored data is not an array
     - Stored array is empty
     - Catalog version is outdated
  */

  const hasInvalidProducts =
    !Array.isArray(storedProducts) ||
    storedProducts.length === 0;


  const needsCatalogUpdate =
    storedCatalogVersion !==
    CATALOG_VERSION;


  if (
    hasInvalidProducts ||
    needsCatalogUpdate
  ) {

    setToStorage(
      STORAGE_KEYS.PRODUCTS,
      DEFAULT_PRODUCTS
    );

    localStorage.setItem(
      STORAGE_KEYS.CATALOG_VERSION,
      CATALOG_VERSION
    );

  }

}


/* ============================================================
   Product access
   ============================================================ */

function getProducts() {

  initStorage();

  return getFromStorage(
    STORAGE_KEYS.PRODUCTS,
    DEFAULT_PRODUCTS
  );

}


function saveProducts(products) {

  setToStorage(
    STORAGE_KEYS.PRODUCTS,
    products
  );

}


function getProductById(productId) {

  const products =
    getProducts();

  return products.find(
    function (product) {
      return product.id === productId;
    }
  ) || null;

}


/* ============================================================
   Category helpers
   ============================================================ */

function getAllCategories() {

  const products =
    getProducts();

  const categories =
    products.map(
      function (product) {
        return product.category;
      }
    );

  return [
    ...new Set(categories)
  ];

}


/* ============================================================
   Product creation
   ============================================================ */

function createProduct(productData) {

  const products =
    getProducts();

  const product = {

    id:
      productData.id ||
      ("p" + Date.now()),

    name:
      productData.name || "",

    category:
      productData.category || "",

    price:
      Number(productData.price) || 0,

    discountPrice:

      productData.discountPrice !== undefined &&
      productData.discountPrice !== null &&
      productData.discountPrice !== ""

        ? Number(
            productData.discountPrice
          )

        : null,

    stock:
      Number(productData.stock) || 0,

    image:
      productData.image || "",

    description:
      productData.description ||
      "No description provided yet.",

    badge:
      productData.badge || "",

    previousBadge:
      productData.previousBadge || ""

  };


  products.push(product);

  saveProducts(products);

  return product;

}


/* ============================================================
   Product update
   ============================================================ */

function updateProduct(
  productId,
  updates
) {

  const products =
    getProducts();

  const productIndex =
    products.findIndex(
      function (product) {
        return product.id === productId;
      }
    );


  if (
    productIndex === -1
  ) {
    return null;
  }


  products[productIndex] = {

    ...products[productIndex],

    ...updates

  };


  saveProducts(products);

  return products[
    productIndex
  ];

}


/* ============================================================
   Product deletion
   ============================================================ */

function deleteProduct(productId) {

  const products =
    getProducts();

  const updatedProducts =
    products.filter(
      function (product) {
        return (
          product.id !==
          productId
        );
      }
    );


  saveProducts(
    updatedProducts
  );

  return updatedProducts;

}


/* ============================================================
   Reset utility
   ============================================================ */

function resetProductsToDefault() {

  setToStorage(
    STORAGE_KEYS.PRODUCTS,
    DEFAULT_PRODUCTS
  );

  localStorage.setItem(
    STORAGE_KEYS.CATALOG_VERSION,
    CATALOG_VERSION
  );

}
