/* ============================================================
   products.js

   Responsibility:
   - Render product cards
   - Render featured products
   - Render full product grid
   - Search
   - Category filters
   - Sorting
   - Product Details Modal
   - Product image fallback
   - Discount price rendering

   Product source:
   data.js → localStorage → getProducts()
============================================================ */


/* ============================================================
   STATE
============================================================ */

let currentModalProductId = null;

let currentModalQuantity = 1;


/* ============================================================
   PRICE HELPERS
============================================================ */

/*
   data.js provides getEffectivePrice()
   in the upgraded product architecture.

   This fallback keeps products.js safe
   even if older data exists temporarily.
*/

function getStorefrontEffectivePrice(product) {

    if (
        typeof getEffectivePrice ===
        "function"
    ) {

        return getEffectivePrice(product);

    }


    if (
        product.discountPrice !== null &&
        product.discountPrice !== undefined &&
        Number(product.discountPrice) > 0 &&
        Number(product.discountPrice) <
        Number(product.price)
    ) {

        return Number(
            product.discountPrice
        );

    }


    return Number(
        product.price
    );
}


function productHasDiscount(product) {

    if (
        typeof hasValidDiscount ===
        "function"
    ) {

        return hasValidDiscount(product);

    }


    return (
        product.discountPrice !== null &&
        product.discountPrice !== undefined &&
        Number(product.discountPrice) > 0 &&
        Number(product.discountPrice) <
        Number(product.price)
    );
}


function buildProductPriceHTML(product) {

    const effectivePrice =
        getStorefrontEffectivePrice(
            product
        );


    if (
        productHasDiscount(product)
    ) {

        return `
            <div class="product-price">

                <span
                    class="product-original-price"
                    style="
                        text-decoration:line-through;
                        opacity:0.6;
                        font-size:0.85em;
                        margin-right:6px;
                    "
                >
                    ${formatPrice(product.price)}
                </span>

                <span
                    class="product-discount-price"
                >
                    ${formatPrice(
                        effectivePrice
                    )}
                </span>

            </div>
        `;

    }


    return `
        <p class="product-price">
            ${formatPrice(
                effectivePrice
            )}
        </p>
    `;
}


/* ============================================================
   IMAGE HELPERS
============================================================ */

function createProductImage(
    product,
    className
) {

    const image =
        document.createElement(
            "img"
        );


    image.src =
        product.image ||
        "assets/images/placeholder.png";


    image.alt =
        product.name ||
        "Product Image";


    image.className =
        className;


    image.addEventListener(
        "error",
        function () {

            /*
               Prevent repeated fallback loops.
            */

            if (
                this.dataset.fallbackApplied ===
                "true"
            ) {

                return;

            }


            this.dataset.fallbackApplied =
                "true";


            this.src =
                "assets/images/placeholder.png";

        }
    );


    return image;
}


/* ============================================================
   PRODUCT CARD BUILDER
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
        false;


    if (
        Number(product.stock) <= 0
    ) {

        stockLabel =
            "Out of Stock";

        stockClass =
            "stock-out";

        addToCartDisabled =
            true;

    } else if (
        Number(product.stock) <= 5
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


    const badgeHTML =
        product.badge
            ? `
                <span class="product-badge">
                    ${escapeStorefrontHTML(
                        product.badge
                    )}
                </span>
            `
            : "";


    /*
       Build the card structure first.
       Images are inserted through DOM
       rather than raw inline HTML.
    */

    card.innerHTML =
        `

        <div
            class="product-img-wrap js-view-details"
            data-id="${escapeStorefrontAttribute(
                product.id
            )}"
        >

            ${badgeHTML}

        </div>


        <div class="product-card-body">

            <p class="product-category">
                ${escapeStorefrontHTML(
                    product.category
                )}
            </p>


            <h3 class="product-name">
                ${escapeStorefrontHTML(
                    product.name
                )}
            </h3>


            ${buildProductPriceHTML(
                product
            )}


            <p
                class="
                    stock-status
                    ${stockClass}
                "
            >
                ${stockLabel}
            </p>


            <div class="product-card-actions">

                <button
                    type="button"
                    class="
                        btn
                        btn-outline
                        js-view-details
                    "
                    data-id="${escapeStorefrontAttribute(
                        product.id
                    )}"
                >
                    View Details
                </button>


                <button
                    type="button"
                    class="
                        btn
                        btn-primary
                        js-add-to-cart
                    "
                    data-id="${escapeStorefrontAttribute(
                        product.id
                    )}"
                    ${
                        addToCartDisabled
                            ? "disabled"
                            : ""
                    }
                >
                    Add to Cart
                </button>

            </div>

        </div>

        `;


    const imageWrapper =
        card.querySelector(
            ".product-img-wrap"
        );


    const image =
        createProductImage(
            product,
            "product-img"
        );


    imageWrapper.appendChild(
        image
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


    if (
        !container
    ) {

        return;

    }


    const products =
        getProducts()
            .slice(
                0,
                6
            );


    container.innerHTML =
        "";


    products.forEach(
        function (
            product
        ) {

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
   ACTIVE FILTERS
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
                ? searchInput
                    .value
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
   PRODUCT GRID
============================================================ */

function applyFiltersAndRender() {

    const grid =
        document.getElementById(
            "product-grid"
        );


    if (
        !grid
    ) {

        return;

    }


    const filters =
        getActiveFilters();


    let products =
        getProducts();


    /* ---------- Category ---------- */

    if (
        filters.category &&
        filters.category !==
        "All"
    ) {

        products =
            products.filter(
                function (
                    product
                ) {

                    return (
                        product.category ===
                        filters.category
                    );

                }
            );

    }


    /* ---------- Search ---------- */

    if (
        filters.search
    ) {

        products =
            products.filter(
                function (
                    product
                ) {

                    const name =
                        String(
                            product.name || ""
                        )
                            .toLowerCase();


                    const category =
                        String(
                            product.category || ""
                        )
                            .toLowerCase();


                    const description =
                        String(
                            product.description || ""
                        )
                            .toLowerCase();


                    return (

                        name.indexOf(
                            filters.search
                        ) !== -1 ||

                        category.indexOf(
                            filters.search
                        ) !== -1 ||

                        description.indexOf(
                            filters.search
                        ) !== -1

                    );

                }
            );

    }


    /* ---------- Sorting ---------- */

    if (
        filters.sort ===
        "price-asc"
    ) {

        products =
            products
                .slice()
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            getStorefrontEffectivePrice(
                                a
                            ) -
                            getStorefrontEffectivePrice(
                                b
                            )
                        );

                    }
                );

    } else if (
        filters.sort ===
        "price-desc"
    ) {

        products =
            products
                .slice()
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            getStorefrontEffectivePrice(
                                b
                            ) -
                            getStorefrontEffectivePrice(
                                a
                            )
                        );

                    }
                );

    } else if (
        filters.sort ===
        "name-asc"
    ) {

        products =
            products
                .slice()
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return String(
                            a.name || ""
                        )
                            .localeCompare(
                                String(
                                    b.name || ""
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
        function (
            product
        ) {

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


    if (
        !filterContainer
    ) {

        return;

    }


    const categories =
        [
            "All"
        ].concat(
            getAllCategories()
        );


    filterContainer.innerHTML =
        "";


    categories.forEach(
        function (
            category
        ) {

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
        function (
            button
        ) {

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
        function (
            button
        ) {

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

                                filterButton.classList.remove(
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
        function (
            card
        ) {

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


    if (
        searchInput
    ) {

        searchInput.addEventListener(
            "input",
            applyFiltersAndRender
        );

    }


    if (
        sortSelect
    ) {

        sortSelect.addEventListener(
            "change",
            applyFiltersAndRender
        );

    }
}


/* ============================================================
   PRODUCT CARD EVENTS
============================================================ */

function attachProductCardListeners() {

    document
        .querySelectorAll(
            ".js-view-details"
        )
        .forEach(
            function (
                element
            ) {

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
            function (
                button
            ) {

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
   PRODUCT DETAILS MODAL
============================================================ */

function openProductModal(
    productId
) {

    const modal =
        document.getElementById(
            "product-modal"
        );


    if (
        !modal
    ) {

        return;

    }


    const product =
        getProductById(
            productId
        );


    if (
        !product
    ) {

        return;

    }


    currentModalProductId =
        productId;


    currentModalQuantity =
        1;


    /* ---------- Image ---------- */

    const modalImage =
        document.getElementById(
            "modal-img"
        );


    if (
        modalImage
    ) {

        modalImage.dataset
            .fallbackApplied =
            "false";


        modalImage.src =
            product.image ||
            "assets/images/placeholder.png";


        modalImage.alt =
            product.name;


    }


    /* ---------- Name ---------- */

    const modalName =
        document.getElementById(
            "modal-name"
        );


    if (
        modalName
    ) {

        modalName.textContent =
            product.name;

    }


    /* ---------- Category ---------- */

    const modalCategory =
        document.getElementById(
            "modal-category"
        );


    if (
        modalCategory
    ) {

        modalCategory.textContent =
            product.category;

    }


    /* ---------- Price ---------- */

    renderModalPrice(
        product
    );


    /* ---------- Description ---------- */

    const modalDescription =
        document.getElementById(
            "modal-description"
        );


    if (
        modalDescription
    ) {

        modalDescription.textContent =
            product.description ||
            "";

    }


    /* ---------- Stock ---------- */

    renderModalStock(
        product
    );


    /* ---------- Quantity ---------- */

    updateModalQuantity();


    /* ---------- Button ---------- */

    updateModalAddButton(
        product
    );


    /* ---------- Show Modal ---------- */

    modal.classList.add(
        "open"
    );


    document.body.style.overflow =
        "hidden";
}


/* ============================================================
   MODAL PRICE
============================================================ */

function renderModalPrice(
    product
) {

    const modalPrice =
        document.getElementById(
            "modal-price"
        );


    if (
        !modalPrice
    ) {

        return;

    }


    const effectivePrice =
        getStorefrontEffectivePrice(
            product
        );


    if (
        productHasDiscount(
            product
        )
    ) {

        modalPrice.innerHTML =
            `
            <span
                style="
                    text-decoration:line-through;
                    opacity:0.6;
                    margin-right:8px;
                "
            >
                ${formatPrice(
                    product.price
                )}
            </span>

            <strong>
                ${formatPrice(
                    effectivePrice
                )}
            </strong>
            `;

    } else {

        modalPrice.textContent =
            formatPrice(
                effectivePrice
            );

    }
}


/* ============================================================
   MODAL STOCK
============================================================ */

function renderModalStock(
    product
) {

    const stockElement =
        document.getElementById(
            "modal-stock"
        );


    if (
        !stockElement
    ) {

        return;

    }


    const stock =
        Number(
            product.stock
        );


    stockElement.className =
        "stock-status";


    if (
        stock <= 0
    ) {

        stockElement.textContent =
            "Out of Stock";


        stockElement.classList.add(
            "stock-out"
        );

    } else if (
        stock <= 5
    ) {

        stockElement.textContent =
            "Low Stock (" +
            stock +
            " left)";


        stockElement.classList.add(
            "stock-low"
        );

    } else {

        stockElement.textContent =
            "In Stock";


        stockElement.classList.add(
            "stock-ok"
        );

    }
}


/* ============================================================
   MODAL QUANTITY
============================================================ */

function updateModalQuantity() {

    const quantityElement =
        document.getElementById(
            "modal-qty"
        );


    if (
        quantityElement
    ) {

        quantityElement.textContent =
            currentModalQuantity;

    }
}


/* ============================================================
   MODAL ADD BUTTON
============================================================ */

function updateModalAddButton(
    product
) {

    const addButton =
        document.getElementById(
            "modal-add-btn"
        );


    if (
        !addButton
    ) {

        return;

    }


    if (
        Number(product.stock) <= 0
    ) {

        addButton.disabled =
            true;


        addButton.textContent =
            "Out of Stock";

    } else {

        addButton.disabled =
            false;


        addButton.textContent =
            "Add to Cart";

    }
}


/* ============================================================
   MODAL IMAGE FALLBACK
============================================================ */

function initializeModalImageFallback() {

    const modalImage =
        document.getElementById(
            "modal-img"
        );


    if (
        !modalImage
    ) {

        return;

    }


    modalImage.addEventListener(
        "error",
        function () {

            if (
                this.dataset
                    .fallbackApplied ===
                "true"
            ) {

                return;

            }


            this.dataset
                .fallbackApplied =
                "true";


            this.src =
                "assets/images/placeholder.png";

        }
    );
}


/* ============================================================
   PRODUCT MODAL CONTROLS
============================================================ */

function initializeProductModalControls() {

    const modal =
        document.getElementById(
            "product-modal"
        );


    if (
        !modal
    ) {

        return;

    }


    const closeButton =
        document.getElementById(
            "modal-close"
        );


    const quantityDecrease =
        document.getElementById(
            "modal-qty-decrease"
        );


    const quantityIncrease =
        document.getElementById(
            "modal-qty-increase"
        );


    const addButton =
        document.getElementById(
            "modal-add-btn"
        );


    if (
        closeButton
    ) {

        closeButton.addEventListener(
            "click",
            closeProductModal
        );

    }


    if (
        quantityDecrease
    ) {

        quantityDecrease.addEventListener(
            "click",
            function () {

                if (
                    currentModalQuantity >
                    1
                ) {

                    currentModalQuantity--;


                    updateModalQuantity();

                }

            }
        );

    }


    if (
        quantityIncrease
    ) {

        quantityIncrease.addEventListener(
            "click",
            function () {

                const product =
                    getProductById(
                        currentModalProductId
                    );


                if (
                    !product
                ) {

                    return;

                }


                if (
                    currentModalQuantity <
                    Number(
                        product.stock
                    )
                ) {

                    currentModalQuantity++;


                    updateModalQuantity();

                }

            }
        );

    }


    if (
        addButton
    ) {

        addButton.addEventListener(
            "click",
            function () {

                if (
                    !currentModalProductId
                ) {

                    return;

                }


                const product =
                    getProductById(
                        currentModalProductId
                    );


                if (
                    !product ||
                    Number(
                        product.stock
                    ) <= 0
                ) {

                    return;

                }


                addToCart(
                    currentModalProductId,
                    currentModalQuantity
                );


                closeProductModal();

            }
        );

    }


    modal.addEventListener(
        "click",
        function (
            event
        ) {

            if (
                event.target ===
                modal
            ) {

                closeProductModal();

            }

        }
    );
}


/* ============================================================
   CLOSE PRODUCT MODAL
============================================================ */

function closeProductModal() {

    const modal =
        document.getElementById(
            "product-modal"
        );


    if (
        modal
    ) {

        modal.classList.remove(
            "open"
        );

    }


    document.body.style.overflow =
        "";


    currentModalProductId =
        null;


    currentModalQuantity =
        1;
}


/* ============================================================
   HTML SAFETY HELPERS
============================================================ */

function escapeStorefrontHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(
                value
            );


    return div.innerHTML;
}


function escapeStorefrontAttribute(
    value
) {

    return escapeStorefrontHTML(
        value
    )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
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


        renderCategoryFilters();


        applyFiltersAndRender();


        initHomeCategoryCards();


        initProductControls();


        initializeProductModalControls();


        initializeModalImageFallback();

    }
);
