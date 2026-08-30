/* ============================================================
   data.js

   Responsibility:
   - Official HobbyForge product catalog
   - Product storage
   - Product CRUD helpers
   - Product pricing helpers
   - Category helpers
   - Catalog recovery / initialization

   IMPORTANT:
   DEFAULT_PRODUCTS is the official starter catalog.

   If localStorage is:
   - missing
   - invalid
   - empty

   the website automatically restores DEFAULT_PRODUCTS.

   Admin changes are still local to each device because there is
   currently no shared backend/database.
   ============================================================ */


/* ============================================================
   STORAGE KEYS
   ============================================================ */

const STORAGE_KEYS = {
  PRODUCTS: "hobbyshop_products",
  CART: "hobbyshop_cart",
  CATALOG_VERSION: "hobbyshop_catalog_version"
};


/* ============================================================
   CATALOG VERSION
   ============================================================ */

const CATALOG_VERSION = "2.0";


/* ============================================================
   OFFICIAL PRODUCT CATALOG
   ============================================================ */

const DEFAULT_PRODUCTS = [

  /* ==========================================================
     TRADING CARDS
     ========================================================== */

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


  /* ==========================================================
     BUILDING SETS
     ========================================================== */

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


  /* ==========================================================
     DIE-CAST
     ========================================================== */

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


  /* ==========================================================
     MODEL KITS
     ========================================================== */

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
    id: "p1788076144320",
    name: "RG Hi-Nu Gundam 1/144 Scale",
    category: "Model Kits",
    price: 60.99,
    discountPrice: null,
    stock: 2,
    image: "assets/image/Hi-nu.jpg",
    description:
      "Real Grade Gundam Hi-nu 1/144 scale Bandai",
    badge: "",
    previousBadge: ""
  },

  {
    id: "p1788076144322",
    name: "HGGTO Rx-78-02 Gundam",
    category: "Model Kits",
    price: 31.00,
    discountPrice: null,
    stock: 4,
    image: "assets/image/Rx-78.jpeg",
    description:
      "High Grade Gundam origins of the iconic Rx-78-02",
    badge: "Hot",
    previousBadge: ""
  },


  /* ==========================================================
     COLLECTIBLES
     ========================================================== */

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


  /* ==========================================================
     HOBBY ACCESSORIES
     ========================================================== */

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


  /* ==========================================================
     SPECIAL
     ========================================================== */

  {
    id: "p1788076107983",
    name: "Pagmamahal",
    category: "Life aspect",
    price: 10000000,
    discountPrice: null,
    stock: 1,
    image: "assets/image/Love.jpg",
    description:
      "No description provided yet.",
    badge: "Rare",
    previousBadge: ""
  }

];


/* ============================================================
   STORAGE HELPERS
   ============================================================ */

function getFromStorage(key, fallbackValue) {

  try {

    const storedValue =
      localStorage.getItem(key);

    if (
      storedValue === null
    ) {
      return fallbackValue;
    }

    return JSON.parse(
      storedValue
    );

  } catch (error) {

    console.warn(
      "Could not read localStorage:",
      key,
      error
    );

    return fallbackValue;
  }

}


function setToStorage(
  key,
  value
) {

  try {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

  } catch (error) {

    console.warn(
      "Could not save localStorage:",
      key,
      error
    );

  }

}


/* ============================================================
   PRODUCT VALIDATION
   ============================================================ */

function isValidProductList(
  products
) {

  if (
    !Array.isArray(products)
  ) {
    return false;
  }

  if (
    products.length === 0
  ) {
    return false;
  }

  return products.every(
    function (product) {

      return (
        product &&
        typeof product === "object" &&
        typeof product.id === "string" &&
        product.id !== "" &&
        typeof product.name === "string"
      );

    }
  );

}


/* ============================================================
   CATALOG INITIALIZATION
   ============================================================ */

function initStorage() {

  const storedProducts =
    getFromStorage(
      STORAGE_KEYS.PRODUCTS,
      null
    );


  /* ----------------------------------------------------------
     RECOVERY RULE

     Restore official products if storage is:
     - missing
     - invalid
     - empty
     ---------------------------------------------------------- */

  if (
    !isValidProductList(
      storedProducts
    )
  ) {

    setToStorage(
      STORAGE_KEYS.PRODUCTS,
      DEFAULT_PRODUCTS
    );

    localStorage.setItem(
      STORAGE_KEYS.CATALOG_VERSION,
      CATALOG_VERSION
    );

    return;
  }


  /* ----------------------------------------------------------
     VERSION INITIALIZATION

     If an existing valid catalog does not yet have a version,
     keep it instead of destroying local products.

     This prevents unnecessary product loss.
     ---------------------------------------------------------- */

  const storedVersion =
    localStorage.getItem(
      STORAGE_KEYS.CATALOG_VERSION
    );

  if (
    !storedVersion
  ) {

    localStorage.setItem(
      STORAGE_KEYS.CATALOG_VERSION,
      CATALOG_VERSION
    );

  }

}


/* ============================================================
   PRODUCT ACCESS
   ============================================================ */

function getProducts() {

  initStorage();

  const products =
    getFromStorage(
      STORAGE_KEYS.PRODUCTS,
      DEFAULT_PRODUCTS
    );

  if (
    !isValidProductList(
      products
    )
  ) {

    setToStorage(
      STORAGE_KEYS.PRODUCTS,
      DEFAULT_PRODUCTS
    );

    return DEFAULT_PRODUCTS.slice();

  }

  return products;

}


function saveProducts(
  products
) {

  if (
    !Array.isArray(products)
  ) {
    return;
  }

  setToStorage(
    STORAGE_KEYS.PRODUCTS,
    products
  );

}


function getProductById(
  productId
) {

  const products =
    getProducts();

  return (
    products.find(
      function (product) {

        return (
          product.id ===
          productId
        );

      }
    ) ||
    null
  );

}


/* ============================================================
   CATEGORY HELPERS
   ============================================================ */

function getAllCategories() {

  const products =
    getProducts();

  const categories =
    products
      .map(
        function (product) {

          return product.category;

        }
      )
      .filter(
        function (category) {

          return (
            typeof category === "string" &&
            category.trim() !== ""
          );

        }
      );


  return [
    ...new Set(categories)
  ];

}


/* ============================================================
   PRICE HELPERS
   ============================================================ */

function getEffectivePrice(
  product
) {

  if (
    !product
  ) {
    return 0;
  }


  const discountPrice =
    Number(
      product.discountPrice
    );


  if (
    product.discountPrice !== null &&
    product.discountPrice !== undefined &&
    product.discountPrice !== "" &&
    Number.isFinite(
      discountPrice
    ) &&
    discountPrice >= 0 &&
    discountPrice < Number(product.price)
  ) {

    return discountPrice;

  }


  return (
    Number(product.price) ||
    0
  );

}


/* ============================================================
   PRODUCT CREATION
   ============================================================ */

function createProduct(
  productData
) {

  const products =
    getProducts();


  const product = {

    id:
      productData.id ||
      (
        "p" +
        Date.now()
      ),

    name:
      productData.name ||
      "",

    category:
      productData.category ||
      "",

    price:
      Number(
        productData.price
      ) ||
      0,

    discountPrice:

      productData.discountPrice !==
        undefined &&
      productData.discountPrice !==
        null &&
      productData.discountPrice !==
        ""

        ? Number(
            productData.discountPrice
          )

        : null,

    stock:
      Number(
        productData.stock
      ) ||
      0,

    image:
      productData.image ||
      "",

    description:

      productData.description ||
      "No description provided yet.",

    badge:
      productData.badge ||
      "",

    previousBadge:
      productData.previousBadge ||
      ""

  };


  products.push(
    product
  );


  saveProducts(
    products
  );


  return product;

}


/* ============================================================
   PRODUCT UPDATE
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

        return (
          product.id ===
          productId
        );

      }
    );


  if (
    productIndex === -1
  ) {
    return null;
  }


  products[
    productIndex
  ] = {

    ...products[
      productIndex
    ],

    ...updates

  };


  saveProducts(
    products
  );


  return products[
    productIndex
  ];

}


/* ============================================================
   PRODUCT DELETION
   ============================================================ */

function deleteProduct(
  productId
) {

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
   CATALOG RESET
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
