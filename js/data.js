/* ============================================================
   data.js

   Responsibility:
   - Default product data (central product structure)
   - localStorage keys
   - Generic localStorage read/write helpers
   - Storage initialization
   - Product normalization / backward compatibility
   - Shared product lookup helpers
   - Product pricing helpers
============================================================ */


/* ============================================================
   LOCALSTORAGE KEYS
============================================================ */

const STORAGE_KEYS = {
    PRODUCTS: "hobbyshop_products",
    CART: "hobbyshop_cart",
    ORDERS: "hobbyshop_orders"
};


/* ============================================================
   DEFAULT PRODUCT DATA
============================================================ */

const DEFAULT_PRODUCTS = [
    {
        id: "p1",
        name: "Charizard Holo Card",
        category: "Trading Cards",
        price: 89.99,
        discountPrice: null,
        stock: 12,
        image: "assets/images/placeholder.png",
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
        image: "assets/images/placeholder.png",
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
        image: "assets/images/placeholder.png",
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
        image: "assets/images/placeholder.png",
        description:
            "A space-themed building set featuring an explorer ship and minifigures.",
        badge: "Sold Out",
        previousBadge: ""
    },

    {
        id: "p5",
        name: "Hot Wheels Speed Racer Pack",
        category: "Die-Cast",
        price: 19.99,
        discountPrice: null,
        stock: 25,
        image: "assets/images/placeholder.png",
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
        image: "assets/images/placeholder.png",
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
        image: "assets/images/placeholder.png",
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
        image: "assets/images/placeholder.png",
        description:
            "A detailed Zaku II mobile suit model kit for hobbyist builders.",
        badge: "",
        previousBadge: ""
    },

    {
        id: "p9",
        name: "Limited Edition Collector Figure",
        category: "Collectibles",
        price: 74.99,
        discountPrice: null,
        stock: 2,
        image: "assets/images/placeholder.png",
        description:
            "A limited run collectible figure with premium detailing.",
        badge: "Limited",
        previousBadge: ""
    },

    {
        id: "p10",
        name: "Vintage Comic Statue",
        category: "Collectibles",
        price: 149.99,
        discountPrice: null,
        stock: 10,
        image: "assets/images/placeholder.png",
        description:
            "A hand-painted statue inspired by classic vintage comic art.",
        badge: "",
        previousBadge: ""
    },

    {
        id: "p11",
        name: "Hobby Paint & Tool Set",
        category: "Hobby Accessories",
        price: 24.99,
        discountPrice: null,
        stock: 20,
        image: "assets/images/placeholder.png",
        description:
            "A starter set of paints, brushes, and tools for model building.",
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
        image: "assets/images/placeholder.png",
        description:
            "A clear acrylic display case to protect and showcase your collectibles.",
        badge: "",
        previousBadge: ""
    }
];


/* ============================================================
   PRODUCT NORMALIZATION

   Ensures older products stored in localStorage remain compatible
   with the current product structure.

   This does NOT delete existing product data.
============================================================ */

function normalizeProduct(product) {

    product = product || {};

    return {
        id: product.id || generateFallbackProductId(),

        name:
            typeof product.name === "string"
                ? product.name
                : "",

        category:
            typeof product.category === "string"
                ? product.category
                : "",

        price:
            Number.isFinite(Number(product.price))
                ? Number(product.price)
                : 0,

        discountPrice:
            product.discountPrice !== null &&
            product.discountPrice !== undefined &&
            product.discountPrice !== "" &&
            Number.isFinite(Number(product.discountPrice))
                ? Number(product.discountPrice)
                : null,

        stock:
            Number.isFinite(Number(product.stock))
                ? Math.max(0, Math.floor(Number(product.stock)))
                : 0,

        image:
            typeof product.image === "string" &&
            product.image.trim() !== ""
                ? product.image.trim()
                : "assets/images/placeholder.png",

        description:
            typeof product.description === "string"
                ? product.description
                : "",

        badge:
            typeof product.badge === "string"
                ? product.badge
                : "",

        previousBadge:
            typeof product.previousBadge === "string"
                ? product.previousBadge
                : ""
    };
}


/* ============================================================
   PRODUCT ARRAY NORMALIZATION
============================================================ */

function normalizeProducts(products) {

    if (!Array.isArray(products)) {
        return [];
    }

    return products.map(function (product) {
        return normalizeProduct(product);
    });
}


/* ============================================================
   FALLBACK PRODUCT ID

   Used only when an unexpected legacy product does not have an ID.
============================================================ */

function generateFallbackProductId() {

    return (
        "product_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 8)
    );
}


/* ============================================================
   GENERIC LOCALSTORAGE HELPERS
============================================================ */

function getFromStorage(key, fallbackValue) {

    try {

        const raw = localStorage.getItem(key);

        if (raw === null) {
            return fallbackValue;
        }

        return JSON.parse(raw);

    } catch (err) {

        console.error(
            "Error reading storage key:",
            key,
            err
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

    } catch (err) {

        console.error(
            "Error writing storage key:",
            key,
            err
        );

        alert(
            "Unable to save data. The browser storage may be full."
        );
    }
}


/* ============================================================
   STORAGE INITIALIZATION
============================================================ */

function initStorage() {

    /* ---------- Products ---------- */

    if (localStorage.getItem(STORAGE_KEYS.PRODUCTS) === null) {

        const defaultProducts = normalizeProducts(
            DEFAULT_PRODUCTS
        );

        setToStorage(
            STORAGE_KEYS.PRODUCTS,
            defaultProducts
        );

    } else {

        /*
           Normalize existing stored products.

           This safely upgrades products created by older versions
           without deleting user-created products.
        */

        const storedProducts = getFromStorage(
            STORAGE_KEYS.PRODUCTS,
            []
        );

        const normalizedProducts = normalizeProducts(
            storedProducts
        );

        setToStorage(
            STORAGE_KEYS.PRODUCTS,
            normalizedProducts
        );
    }


    /* ---------- Cart ---------- */

    if (localStorage.getItem(STORAGE_KEYS.CART) === null) {

        setToStorage(
            STORAGE_KEYS.CART,
            []
        );
    }


    /* ---------- Orders ---------- */

    if (localStorage.getItem(STORAGE_KEYS.ORDERS) === null) {

        setToStorage(
            STORAGE_KEYS.ORDERS,
            []
        );
    }
}


/* ============================================================
   PRODUCT HELPERS
============================================================ */

function getProducts() {

    const products = getFromStorage(
        STORAGE_KEYS.PRODUCTS,
        DEFAULT_PRODUCTS
    );

    return normalizeProducts(products);
}


function saveProducts(products) {

    const normalizedProducts = normalizeProducts(
        products
    );

    setToStorage(
        STORAGE_KEYS.PRODUCTS,
        normalizedProducts
    );
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

        const category = product.category;

        if (
            category &&
            categories.indexOf(category) === -1
        ) {

            categories.push(category);

        }

    });

    return categories;
}


/* ============================================================
   PRODUCT ID HELPER

   Used by Admin when creating new products.
============================================================ */

function generateProductId() {

    const products = getProducts();

    let highestNumber = 0;

    products.forEach(function (product) {

        const match = String(product.id).match(
            /^p(\d+)$/
        );

        if (match) {

            const number = Number(match[1]);

            if (number > highestNumber) {
                highestNumber = number;
            }
        }

    });

    return "p" + (highestNumber + 1);
}


/* ============================================================
   PRICING HELPERS
============================================================ */

/*
   A discount is valid only when:

   - discountPrice is a valid number
   - discountPrice is greater than zero
   - discountPrice is lower than the regular price
*/

function hasValidDiscount(product) {

    if (!product) {
        return false;
    }

    const regularPrice = Number(
        product.price
    );

    const discountPrice = Number(
        product.discountPrice
    );

    return (
        product.discountPrice !== null &&
        product.discountPrice !== undefined &&
        product.discountPrice !== "" &&
        Number.isFinite(discountPrice) &&
        discountPrice > 0 &&
        discountPrice < regularPrice
    );
}


/*
   Returns the price customers should actually pay.

   Cart and storefront should use this helper.
*/

function getEffectivePrice(product) {

    if (hasValidDiscount(product)) {

        return Number(
            product.discountPrice
        );
    }

    return Number(
        product.price
    );
}


/* ============================================================
   PRICE FORMATTING
============================================================ */

function formatPrice(price) {

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
        return "$0.00";
    }

    return "$" + numericPrice.toFixed(2);
}
