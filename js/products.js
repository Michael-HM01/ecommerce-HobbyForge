/* ============================================================
   products.js

   Responsibility:
   - Product cards
   - Featured products
   - Search
   - Filters
   - Sorting
   - Product modal
   ============================================================ */


let currentModalProductId =
  null;


let currentModalQuantity =
  1;


/* ============================================================
   IMAGE HELPERS
============================================================ */

function getProductImageSource(product) {

  if (
    product &&
    typeof product.image === "string" &&
    product.image.trim() !== ""
  ) {

    return product.image.trim();

  }


  return (
    "assets/images/placeholder.png"
  );

}


function applyImageFallback(
  imageElement
) {

  if (!imageElement) {
    return;
  }


  imageElement.addEventListener(
    "error",
    function () {

      if (
        imageElement.dataset.fallbackApplied ===
        "true"
      ) {
        return;
      }


      imageElement.dataset.fallbackApplied =
        "true";


      imageElement.src =
        "assets/images/placeholder.png";

    }
  );

}


/* ============================================================
   PRODUCT CARD
============================================================ */

function buildProductCard(product) {

  const card =
    document.createElement(
      "div"
    );


  card.className =
    "product-card";


  let stockLabel =
    "";


  let stockClass =
    "";


  let addToCartDisabled =
    "";


  if (
    product.stock <= 0
  ) {

    stockLabel =
      "Out of Stock";


    stockClass =
      "stock-out";


    addToCartDisabled =
      "disabled";

  } else if (
    product.stock <= 5
  ) {

    stockLabel =
      "Low Stock (" +
      product.stock +
      " left)";


    stockClass =
      "stock-low";

  } else {

    stockLabel =
      "In Stock";


    stockClass =
      "stock-ok";

  }


  const badgeHtml =
    product.badge

      ? '<span class="product-badge">' +
        product.badge +
        '</span>'

      : "";


  const imageSource =
    getProductImageSource(
      product
    );


  const effectivePrice =
    typeof getEffectivePrice ===
    "function"

      ? getEffectivePrice(product)

      : product.price;


  card.innerHTML =

    '<div ' +

      'class="product-img-wrap js-view-details" ' +

      'data-id="' +
      product.id +
      '">' +


      badgeHtml +


      '<img ' +

        'src="' +
        imageSource +
        '" ' +

        'alt="' +
        product.name +
        '" ' +

        'class="product-img">' +


    '</div>' +


    '<div class="product-card-body">' +


      '<p class="product-category">' +

        product.category +

      '</p>' +


      '<h3 class="product-name">' +

        product.name +

      '</h3>' +


      '<p class="product-price">' +

        formatPrice(
          effectivePrice
        ) +

      '</p>' +


      '<p class="stock-status ' +

        stockClass +

        '">' +

        stockLabel +

      '</p>' +


      '<div class="product-card-actions">' +


        '<button ' +

          'class="btn btn-outline js-view-details" ' +

          'data-id="' +
          product.id +
          '">' +

          'View Details' +

        '</button>' +


        '<button ' +

          'class="btn btn-primary js-add-to-cart" ' +

          'data-id="' +
          product.id +
          '" ' +

          addToCartDisabled +
          '>' +

          'Add to Cart' +

        '</button>' +


      '</div>' +


    '</div>';


  applyImageFallback(
    card.querySelector(
      ".product-img"
    )
  );


  return card;
}


/* ============================================================
   FEATURED PRODUCTS
============================================================ */

function renderFeaturedProducts() {

  const container =
    document.getElementById(
      "featured-products"
    );


  if (!container) {
    return;
  }


  const products =
    getProducts()
      .slice(0, 6);


  container.innerHTML =
    "";


  products.forEach(
    function (product) {

      container.appendChild(
        buildProductCard(
          product
        )
      );

    }
  );


  attachProductCardListeners();
}


/* ============================================================
   FILTER STATE
============================================================ */

function getActiveFilters() {

  const searchInput =
    document.getElementById(
      "search-input"
    );


  const sortSelect =
    document.getElementById(
      "sort-select"
    );


  const activeFilterButton =
    document.querySelector(
      ".filter-btn.active"
    );


  return {

    search:

      searchInput

        ? searchInput.value
            .trim()
            .toLowerCase()

        : "",


    category:

      activeFilterButton

        ? activeFilterButton.getAttribute(
            "data-category"
          )

        : "All",


    sort:

      sortSelect

        ? sortSelect.value

        : "default"

  };

}


/* ============================================================
   FILTER + RENDER
============================================================ */

function applyFiltersAndRender() {

  const grid =
    document.getElementById(
      "product-grid"
    );


  if (!grid) {
    return;
  }


  const filters =
    getActiveFilters();


  let products =
    getProducts();


  if (
    filters.category &&
    filters.category !== "All"
  ) {

    products =
      products.filter(
        function (product) {

          return (
            product.category ===
            filters.category
          );

        }
      );

  }


  if (
    filters.search
  ) {

    products =
      products.filter(
        function (product) {

          return (

            product.name
              .toLowerCase()
              .indexOf(
                filters.search
              ) !== -1 ||

            product.category
              .toLowerCase()
              .indexOf(
                filters.search
              ) !== -1

          );

        }
      );

  }


  if (
    filters.sort ===
    "price-asc"
  ) {

    products =
      products
        .slice()
        .sort(
          function (
            first,
            second
          ) {

            return (
              getEffectivePrice(first) -
              getEffectivePrice(second)
            );

          }
        );

  }


  if (
    filters.sort ===
    "price-desc"
  ) {

    products =
      products
        .slice()
        .sort(
          function (
            first,
            second
          ) {

            return (
              getEffectivePrice(second) -
              getEffectivePrice(first)
            );

          }
        );

  }


  if (
    filters.sort ===
    "name-asc"
  ) {

    products =
      products
        .slice()
        .sort(
          function (
            first,
            second
          ) {

            return (
              first.name.localeCompare(
                second.name
              )
            );

          }
        );

  }


  grid.innerHTML =
    "";


  const noResultsElement =
    document.getElementById(
      "no-results"
    );


  if (
    products.length === 0
  ) {

    if (
      noResultsElement
    ) {

      noResultsElement.style.display =
        "block";

    }

  } else {

    if (
      noResultsElement
    ) {

      noResultsElement.style.display =
        "none";

    }

  }


  products.forEach(
    function (product) {

      grid.appendChild(
        buildProductCard(
          product
        )
      );

    }
  );


  attachProductCardListeners();
}


/* ============================================================
   CATEGORY FILTERS
============================================================ */

function renderCategoryFilters() {

  const filterContainer =
    document.getElementById(
      "category-filters"
    );


  if (!filterContainer) {
    return;
  }


  const categories =
    ["All"].concat(
      getAllCategories()
    );


  filterContainer.innerHTML =
    "";


  categories.forEach(
    function (category) {

      const button =
        document.createElement(
          "button"
        );


      button.className =
        "filter-btn";


      button.textContent =
        category;


      button.setAttribute(
        "data-category",
        category
      );


      filterContainer.appendChild(
        button
      );

    }
  );


  const urlParameters =
    new URLSearchParams(
      window.location.search
    );


  let preselectedCategory =
    urlParameters.get(
      "category"
    );


  if (
    !preselectedCategory
  ) {

    preselectedCategory =
      localStorage.getItem(
        "hobbyshop_selected_category"
      );

  }


  localStorage.removeItem(
    "hobbyshop_selected_category"
  );


  const buttons =
    filterContainer.querySelectorAll(
      ".filter-btn"
    );


  let matched =
    false;


  buttons.forEach(
    function (button) {

      if (
        preselectedCategory &&
        button.getAttribute(
          "data-category"
        ) ===
        preselectedCategory
      ) {

        button.classList.add(
          "active"
        );


        matched =
          true;

      }

    }
  );


  if (
    !matched &&
    buttons.length > 0
  ) {

    buttons[0].classList.add(
      "active"
    );

  }


  buttons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          filterContainer
            .querySelectorAll(
              ".filter-btn"
            )
            .forEach(
              function (
                filterButton
              ) {

                filterButton
                  .classList
                  .remove(
                    "active"
                  );

              }
            );


          button.classList.add(
            "active"
          );


          applyFiltersAndRender();

        }
      );

    }
  );

}


/* ============================================================
   HOME CATEGORY CARDS
============================================================ */

function initHomeCategoryCards() {

  const cards =
    document.querySelectorAll(
      ".js-category-card"
    );


  cards.forEach(
    function (card) {

      card.addEventListener(
        "click",
        function () {

          const category =
            card.getAttribute(
              "data-category"
            );


          localStorage.setItem(
            "hobbyshop_selected_category",
            category
          );


          window.location.href =
            "products.html?category=" +
            encodeURIComponent(
              category
            );

        }
      );

    }
  );

}


/* ============================================================
   SEARCH + SORT
============================================================ */

function initProductControls() {

  const searchInput =
    document.getElementById(
      "search-input"
    );


  const sortSelect =
    document.getElementById(
      "sort-select"
    );


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      applyFiltersAndRender
    );

  }


  if (sortSelect) {

    sortSelect.addEventListener(
      "change",
      applyFiltersAndRender
    );

  }

}


/* ============================================================
   PRODUCT CARD LISTENERS
============================================================ */

function attachProductCardListeners() {

  document
    .querySelectorAll(
      ".js-view-details"
    )
    .forEach(
      function (element) {

        element.addEventListener(
          "click",
          function () {

            const id =
              element.getAttribute(
                "data-id"
              );


            openProductModal(
              id
            );

          }
        );

      }
    );


  document
    .querySelectorAll(
      ".js-add-to-cart"
    )
    .forEach(
      function (button) {

        button.addEventListener(
          "click",
          function () {

            const id =
              button.getAttribute(
                "data-id"
              );


            addToCart(
              id,
              1
            );

          }
        );

      }
    );

}


/* ============================================================
   PRODUCT MODAL
============================================================ */

function openProductModal(
  productId
) {

  const modal =
    document.getElementById(
      "product-modal"
    );


  const overlay =
    document.getElementById(
      "modal-overlay"
    );


  if (!modal) {
    return;
  }


  const product =
    getProductById(
      productId
    );


  if (!product) {
    return;
  }


  currentModalProductId =
    productId;


  currentModalQuantity =
    1;


  const image =
    document.getElementById(
      "modal-img"
    );


  if (image) {

    image.dataset.fallbackApplied =
      "false";


    image.src =
      getProductImageSource(
        product
      );


    image.alt =
      product.name;


    applyImageFallback(
      image
    );

  }


  document
    .getElementById(
      "modal-name"
    )
    .textContent =
      product.name;


  document
    .getElementById(
      "modal-category"
    )
    .textContent =
      product.category;


  document
    .getElementById(
      "modal-price"
    )
    .textContent =
      formatPrice(
        getEffectivePrice(
          product
        )
      );


  document
    .getElementById(
      "modal-description"
    )
    .textContent =
      product.description;


  const stockElement =
    document.getElementById(
      "modal-stock"
    );


  const addButton =
    document.getElementById(
      "modal-add-to-cart"
    );


  const quantityValueElement =
    document.getElementById(
      "modal-qty-value"
    );


  if (
    quantityValueElement
  ) {

    quantityValueElement.textContent =
      currentModalQuantity;

  }


  if (
    product.stock <= 0
  ) {

    stockElement.textContent =
      "Out of Stock";


    stockElement.className =
      "stock-status stock-out";


    addButton.disabled =
      true;

  } else if (
    product.stock <= 5
  ) {

    stockElement.textContent =
      "Low Stock (" +
      product.stock +
      " left)";


    stockElement.className =
      "stock-status stock-low";


    addButton.disabled =
      false;

  } else {

    stockElement.textContent =
      "In Stock (" +
      product.stock +
      " available)";


    stockElement.className =
      "stock-status stock-ok";


    addButton.disabled =
      false;

  }


  modal.classList.add(
    "open"
  );


  if (overlay) {

    overlay.classList.add(
      "open"
    );

  }


  document.body.style.overflow =
    "hidden";

}


function closeProductModal() {

  const modal =
    document.getElementById(
      "product-modal"
    );


  const overlay =
    document.getElementById(
      "modal-overlay"
    );


  if (modal) {

    modal.classList.remove(
      "open"
    );

  }


  if (overlay) {

    overlay.classList.remove(
      "open"
    );

  }


  currentModalProductId =
    null;


  currentModalQuantity =
    1;


  document.body.style.overflow =
    "";

}


/* ============================================================
   MODAL QUANTITY
============================================================ */

function changeModalQuantity(
  delta
) {

  const product =
    getProductById(
      currentModalProductId
    );


  if (!product) {
    return;
  }


  let newQuantity =
    currentModalQuantity +
    delta;


  if (
    newQuantity < 1
  ) {

    newQuantity = 1;

  }


  if (
    newQuantity >
    product.stock
  ) {

    newQuantity =
      product.stock;

  }


  currentModalQuantity =
    newQuantity;


  const quantityValueElement =
    document.getElementById(
      "modal-qty-value"
    );


  if (
    quantityValueElement
  ) {

    quantityValueElement.textContent =
      currentModalQuantity;

  }

}


/* ============================================================
   MODAL INITIALIZATION
============================================================ */

function initProductModal() {

  const modal =
    document.getElementById(
      "product-modal"
    );


  if (!modal) {
    return;
  }


  const closeButton =
    document.getElementById(
      "modal-close-btn"
    );


  const overlay =
    document.getElementById(
      "modal-overlay"
    );


  const increaseButton =
    document.getElementById(
      "modal-qty-increase"
    );


  const decreaseButton =
    document.getElementById(
      "modal-qty-decrease"
    );


  const addButton =
    document.getElementById(
      "modal-add-to-cart"
    );


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeProductModal
    );

  }


  if (overlay) {

    overlay.addEventListener(
      "click",
      closeProductModal
    );

  }


  if (increaseButton) {

    increaseButton.addEventListener(
      "click",
      function () {

        changeModalQuantity(
          1
        );

      }
    );

  }


  if (decreaseButton) {

    decreaseButton.addEventListener(
      "click",
      function () {

        changeModalQuantity(
          -1
        );

      }
    );

  }


  if (addButton) {

    addButton.addEventListener(
      "click",
      function () {

        if (
          !currentModalProductId
        ) {
          return;
        }


        const productId =
          currentModalProductId;


        const quantity =
          currentModalQuantity;


        addToCart(
          productId,
          quantity
        );


        closeProductModal();


        openCartDrawer();

      }
    );

  }


  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        const activeModal =
          document.getElementById(
            "product-modal"
          );


        if (
          activeModal &&
          activeModal.classList.contains(
            "open"
          )
        ) {

          closeProductModal();

        }

      }

    }
  );

}


/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initStorage();

    renderFeaturedProducts();

    initHomeCategoryCards();

    renderCategoryFilters();

    initProductControls();

    applyFiltersAndRender();

    initProductModal();

  }
);
