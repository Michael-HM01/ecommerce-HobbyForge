/* ============================================================
   admin.js

   Responsibility:
   - Admin dashboard rendering
   - Product statistics
   - Add product
   - Edit product
   - Delete product
   - Image preview
   - Discount management
   - Admin modal management

   Product data source:
   data.js → localStorage → getProducts() / saveProducts()
============================================================ */


/* ============================================================
   STATE
============================================================ */

let editingProductId = null;
let discountProductId = null;


/* ============================================================
   DOM REFERENCES
============================================================ */

const adminProductTableBody =
    document.getElementById("admin-product-table-body");


/* ---------- Statistics ---------- */

const statTotalProducts =
    document.getElementById("stat-total-products");

const statLowStock =
    document.getElementById("stat-low-stock");

const statOutOfStock =
    document.getElementById("stat-out-of-stock");

const statCartItems =
    document.getElementById("stat-cart-items");


/* ---------- Add Product ---------- */

const addProductForm =
    document.getElementById("add-product-form");

const newProductName =
    document.getElementById("new-product-name");

const newProductCategory =
    document.getElementById("new-product-category");

const newProductDescription =
    document.getElementById("new-product-description");

const newProductPrice =
    document.getElementById("new-product-price");

const newProductStock =
    document.getElementById("new-product-stock");

const newProductBadge =
    document.getElementById("new-product-badge");

const newProductImage =
    document.getElementById("new-product-image");


/* ---------- Edit Modal ---------- */

const editProductModal =
    document.getElementById("edit-product-modal");

const editModalOverlay =
    document.getElementById("edit-modal-overlay");

const editModalCloseButton =
    document.getElementById("edit-modal-close-btn");

const editProductName =
    document.getElementById("edit-product-name");

const editNameInput =
    document.getElementById("edit-name-input");

const editCategoryInput =
    document.getElementById("edit-category-input");

const editDescriptionInput =
    document.getElementById("edit-description-input");

const editPriceInput =
    document.getElementById("edit-price-input");

const editStockInput =
    document.getElementById("edit-stock-input");

const editBadgeInput =
    document.getElementById("edit-badge-input");

const editImageInput =
    document.getElementById("edit-image-input");

const editProductImagePreview =
    document.getElementById(
        "edit-product-image-preview"
    );

const editModalSaveButton =
    document.getElementById("edit-modal-save-btn");


/* ---------- Discount Modal ---------- */

const discountModal =
    document.getElementById("discount-modal");

const discountModalOverlay =
    document.getElementById(
        "discount-modal-overlay"
    );

const discountModalCloseButton =
    document.getElementById(
        "discount-modal-close-btn"
    );

const discountProductName =
    document.getElementById(
        "discount-product-name"
    );

const discountOriginalPrice =
    document.getElementById(
        "discount-original-price"
    );

const discountPriceInput =
    document.getElementById(
        "discount-price-input"
    );

const discountModalSaveButton =
    document.getElementById(
        "discount-modal-save-btn"
    );


/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initStorage();

        if (
            typeof reconcileCart ===
            "function"
        ) {

            reconcileCart();

        }

        renderAdmin();

        initializeAdminEvents();

    }
);


/* ============================================================
   MASTER RENDER
============================================================ */

function renderAdmin() {

    renderAdminStatistics();

    renderAdminProductTable();
}


/* ============================================================
   ADMIN STATISTICS
============================================================ */

function renderAdminStatistics() {

    const products =
        getProducts();


    let cart = [];


    if (
        typeof getCart ===
        "function"
    ) {

        cart =
            getCart();

    } else {

        cart =
            getFromStorage(
                STORAGE_KEYS.CART,
                []
            );

    }


    if (statTotalProducts) {

        statTotalProducts.textContent =
            products.length;

    }


    const lowStockProducts =
        products.filter(
            function (product) {

                return (
                    product.stock > 0 &&
                    product.stock <= 5
                );

            }
        );


    if (statLowStock) {

        statLowStock.textContent =
            lowStockProducts.length;

    }


    const outOfStockProducts =
        products.filter(
            function (product) {

                return (
                    product.stock <= 0
                );

            }
        );


    if (statOutOfStock) {

        statOutOfStock.textContent =
            outOfStockProducts.length;

    }


    const cartItemCount =
        cart.reduce(
            function (
                total,
                item
            ) {

                return (
                    total +
                    Number(
                        item.quantity || 0
                    )
                );

            },
            0
        );


    if (statCartItems) {

        statCartItems.textContent =
            cartItemCount;

    }
}


/* ============================================================
   PRODUCT TABLE
============================================================ */

function renderAdminProductTable() {

    if (
        !adminProductTableBody
    ) {

        return;

    }


    const products =
        getProducts();


    if (
        products.length === 0
    ) {

        adminProductTableBody.innerHTML =
            `
            <tr>
                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >
                    No products found.
                </td>
            </tr>
            `;

        return;

    }


    adminProductTableBody.innerHTML =
        products
            .map(
                function (
                    product
                ) {

                    const isDiscounted =
                        hasValidDiscount(
                            product
                        );


                    let displayPrice;


                    if (
                        isDiscounted
                    ) {

                        displayPrice =
                            `
                            <div>

                                <span
                                    style="
                                        text-decoration:
                                        line-through;

                                        color:#888;

                                        font-size:13px;
                                    "
                                >
                                    ${formatPrice(
                                        product.price
                                    )}
                                </span>

                                <br>

                                <strong>
                                    ${formatPrice(
                                        product.discountPrice
                                    )}
                                </strong>

                            </div>
                            `;

                    } else {

                        displayPrice =
                            formatPrice(
                                product.price
                            );

                    }


                    const badgeDisplay =
                        product.badge
                            ? product.badge
                            : "—";


                    const discountButton =
                        isDiscounted
                            ? `
                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-secondary
                                        admin-remove-discount-btn
                                    "
                                    data-product-id="${escapeAttribute(
                                        product.id
                                    )}"
                                >
                                    Remove Discount
                                </button>
                            `
                            : `
                                <button
                                    type="button"
                                    class="
                                        btn
                                        btn-secondary
                                        admin-discount-btn
                                    "
                                    data-product-id="${escapeAttribute(
                                        product.id
                                    )}"
                                >
                                    Discount
                                </button>
                            `;


                    return `
                        <tr>

                            <td>
                                ${escapeHTML(
                                    product.id
                                )}
                            </td>


                            <td>

                                <img
                                    src="${escapeAttribute(
                                        product.image
                                    )}"
                                    alt="${escapeAttribute(
                                        product.name
                                    )}"
                                    class="admin-product-image"
                                    data-fallback="true"
                                    style="
                                        width:55px;
                                        height:55px;
                                        object-fit:cover;
                                        border-radius:6px;
                                    "
                                >

                            </td>


                            <td>
                                ${escapeHTML(
                                    product.name
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    product.category
                                )}
                            </td>


                            <td>
                                ${displayPrice}
                            </td>


                            <td>
                                ${product.stock}
                            </td>


                            <td>
                                ${escapeHTML(
                                    badgeDisplay
                                )}
                            </td>


                            <td>

                                <div
                                    style="
                                        display:flex;
                                        flex-wrap:wrap;
                                        gap:6px;
                                    "
                                >

                                    <button
                                        type="button"
                                        class="
                                            btn
                                            btn-primary
                                            admin-edit-btn
                                        "
                                        data-product-id="${escapeAttribute(
                                            product.id
                                        )}"
                                    >
                                        Edit
                                    </button>


                                    ${discountButton}


                                    <button
                                        type="button"
                                        class="
                                            btn
                                            btn-danger
                                            admin-delete-btn
                                        "
                                        data-product-id="${escapeAttribute(
                                            product.id
                                        )}"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;

                }
            )
            .join("");


    initializeTableImages();

    bindProductTableEvents();
}


/* ============================================================
   SAFE IMAGE FALLBACK
============================================================ */

function initializeTableImages() {

    document
        .querySelectorAll(
            ".admin-product-image"
        )
        .forEach(
            function (
                image
            ) {

                image.addEventListener(
                    "error",
                    function () {

                        /*
                           Remove the handler first.

                           This prevents an endless
                           fallback loop if the
                           placeholder itself is missing.
                        */

                        this.onerror =
                            null;


                        this.src =
                            "assets/images/placeholder.png";

                    },
                    {
                        once: true
                    }
                );

            }
        );
}


/* ============================================================
   PRODUCT TABLE EVENTS
============================================================ */

function bindProductTableEvents() {


    document
        .querySelectorAll(
            ".admin-edit-btn"
        )
        .forEach(
            function (
                button
            ) {

                button.addEventListener(
                    "click",
                    function () {

                        openEditModal(
                            this.dataset
                                .productId
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".admin-discount-btn"
        )
        .forEach(
            function (
                button
            ) {

                button.addEventListener(
                    "click",
                    function () {

                        openDiscountModal(
                            this.dataset
                                .productId
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".admin-remove-discount-btn"
        )
        .forEach(
            function (
                button
            ) {

                button.addEventListener(
                    "click",
                    function () {

                        removeDiscount(
                            this.dataset
                                .productId
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".admin-delete-btn"
        )
        .forEach(
            function (
                button
            ) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteProduct(
                            this.dataset
                                .productId
                        );

                    }
                );

            }
        );
}


/* ============================================================
   ADD PRODUCT
============================================================ */

function handleAddProduct(
    event
) {

    event.preventDefault();


    const name =
        newProductName
            .value
            .trim();


    const category =
        newProductCategory
            .value
            .trim();


    const description =
        newProductDescription
            .value
            .trim();


    const price =
        Number(
            newProductPrice
                .value
        );


    const stock =
        Number(
            newProductStock
                .value
        );


    const badge =
        newProductBadge
            .value
            .trim();


    const image =
        newProductImage
            .value
            .trim();


    if (
        !name ||
        !category ||
        !description ||
        !image
    ) {

        alert(
            "Please complete all required product fields."
        );

        return;

    }


    if (
        !Number.isFinite(
            price
        ) ||
        price < 0
    ) {

        alert(
            "Please enter a valid regular price."
        );

        return;

    }


    if (
        !Number.isFinite(
            stock
        ) ||
        stock < 0
    ) {

        alert(
            "Please enter a valid stock quantity."
        );

        return;

    }


    const newProduct = {

        id:
            generateProductId(),

        name:
            name,

        category:
            category,

        description:
            description,

        price:
            price,

        discountPrice:
            null,

        stock:
            Math.floor(
                stock
            ),

        badge:
            badge,

        previousBadge:
            "",

        image:
            image

    };


    const products =
        getProducts();


    products.push(
        newProduct
    );


    saveProducts(
        products
    );


    if (
        typeof reconcileCart ===
        "function"
    ) {

        reconcileCart();

    }


    addProductForm.reset();


    renderAdmin();


    alert(
        "Product added successfully."
    );
}


/* ============================================================
   EDIT PRODUCT MODAL
============================================================ */

function openEditModal(
    productId
) {

    const product =
        getProductById(
            productId
        );


    if (
        !product
    ) {

        alert(
            "Product could not be found."
        );

        return;

    }


    editingProductId =
        product.id;


    editProductName.textContent =
        "Edit Product: " +
        product.name;


    editNameInput.value =
        product.name || "";


    editCategoryInput.value =
        product.category || "";


    editDescriptionInput.value =
        product.description || "";


    editPriceInput.value =
        product.price;


    editStockInput.value =
        product.stock;


    editBadgeInput.value =
        product.badge || "";


    editImageInput.value =
        product.image || "";


    updateEditImagePreview();


    openModal(
        editProductModal,
        editModalOverlay
    );
}


/* ============================================================
   SAVE EDITED PRODUCT
============================================================ */

function saveEditedProduct() {

    if (
        !editingProductId
    ) {

        return;

    }


    const name =
        editNameInput
            .value
            .trim();


    const category =
        editCategoryInput
            .value
            .trim();


    const description =
        editDescriptionInput
            .value
            .trim();


    const price =
        Number(
            editPriceInput
                .value
        );


    const stock =
        Number(
            editStockInput
                .value
        );


    const badge =
        editBadgeInput
            .value
            .trim();


    const image =
        editImageInput
            .value
            .trim();


    if (
        !name ||
        !category ||
        !description ||
        !image
    ) {

        alert(
            "Please complete all product fields."
        );

        return;

    }


    if (
        !Number.isFinite(
            price
        ) ||
        price < 0
    ) {

        alert(
            "Please enter a valid regular price."
        );

        return;

    }


    if (
        !Number.isFinite(
            stock
        ) ||
        stock < 0
    ) {

        alert(
            "Please enter a valid stock quantity."
        );

        return;

    }


    const products =
        getProducts();


    const productIndex =
        products.findIndex(
            function (
                product
            ) {

                return (
                    product.id ===
                    editingProductId
                );

            }
        );


    if (
        productIndex === -1
    ) {

        alert(
            "Product could not be found."
        );

        closeEditModal();

        return;

    }


    const currentProduct =
        products[
            productIndex
        ];


    products[
        productIndex
    ] = {

        ...currentProduct,

        name:
            name,

        category:
            category,

        description:
            description,

        price:
            price,

        stock:
            Math.floor(
                stock
            ),

        badge:
            badge,

        image:
            image

    };


    /*
       If editing the regular price
       makes the discount invalid,
       safely remove it.
    */

    if (
        !hasValidDiscount(
            products[
                productIndex
            ]
        )
    ) {

        if (
            products[
                productIndex
            ]
                .discountPrice !==
            null
        ) {

            products[
                productIndex
            ]
                .discountPrice =
                null;


            if (
                products[
                    productIndex
                ]
                    .badge ===
                "Discount"
            ) {

                products[
                    productIndex
                ]
                    .badge =
                    products[
                        productIndex
                    ]
                        .previousBadge || "";


                products[
                    productIndex
                ]
                    .previousBadge =
                    "";

            }

        }

    }


    saveProducts(
        products
    );


    if (
        typeof reconcileCart ===
        "function"
    ) {

        reconcileCart();

    }


    closeEditModal();

    renderAdmin();


    alert(
        "Product updated successfully."
    );
}


/* ============================================================
   DELETE PRODUCT
============================================================ */

function deleteProduct(
    productId
) {

    const product =
        getProductById(
            productId
        );


    if (
        !product
    ) {

        return;

    }


    const confirmed =
        confirm(
            `Delete "${product.name}"?`
        );


    if (
        !confirmed
    ) {

        return;

    }


    const products =
        getProducts();


    const updatedProducts =
        products.filter(
            function (
                item
            ) {

                return (
                    item.id !==
                    productId
                );

            }
        );


    saveProducts(
        updatedProducts
    );


    if (
        typeof reconcileCart ===
        "function"
    ) {

        reconcileCart();

    }


    renderAdmin();


    alert(
        "Product deleted successfully."
    );
}


/* ============================================================
   DISCOUNT MODAL
============================================================ */

function openDiscountModal(
    productId
) {

    const product =
        getProductById(
            productId
        );


    if (
        !product
    ) {

        alert(
            "Product could not be found."
        );

        return;

    }


    discountProductId =
        product.id;


    discountProductName.textContent =
        product.name;


    discountOriginalPrice.textContent =
        formatPrice(
            product.price
        );


    discountPriceInput.value =
        "";


    openModal(
        discountModal,
        discountModalOverlay
    );
}


/* ============================================================
   APPLY DISCOUNT
============================================================ */

function applyDiscount() {

    if (
        !discountProductId
    ) {

        return;

    }


    const discountedPrice =
        Number(
            discountPriceInput
                .value
        );


    const products =
        getProducts();


    const productIndex =
        products.findIndex(
            function (
                product
            ) {

                return (
                    product.id ===
                    discountProductId
                );

            }
        );


    if (
        productIndex === -1
    ) {

        alert(
            "Product could not be found."
        );

        closeDiscountModal();

        return;

    }


    const product =
        products[
            productIndex
        ];


    if (
        !Number.isFinite(
            discountedPrice
        ) ||
        discountedPrice <= 0
    ) {

        alert(
            "Please enter a valid discounted price."
        );

        return;

    }


    if (
        discountedPrice >=
        Number(
            product.price
        )
    ) {

        alert(
            "The discounted price must be lower than the regular price."
        );

        return;

    }


    if (
        product.badge !==
        "Discount"
    ) {

        product.previousBadge =
            product.badge || "";

    }


    product.discountPrice =
        discountedPrice;


    product.badge =
        "Discount";


    saveProducts(
        products
    );


    closeDiscountModal();

    renderAdmin();


    alert(
        "Discount applied successfully."
    );
}


/* ============================================================
   REMOVE DISCOUNT
============================================================ */

function removeDiscount(
    productId
) {

    const product =
        getProductById(
            productId
        );


    if (
        !product
    ) {

        return;

    }


    const confirmed =
        confirm(
            `Remove discount from "${product.name}"?`
        );


    if (
        !confirmed
    ) {

        return;

    }


    const products =
        getProducts();


    const productIndex =
        products.findIndex(
            function (
                item
            ) {

                return (
                    item.id ===
                    productId
                );

            }
        );


    if (
        productIndex === -1
    ) {

        return;

    }


    const targetProduct =
        products[
            productIndex
        ];


    targetProduct.discountPrice =
        null;


    if (
        targetProduct.badge ===
        "Discount"
    ) {

        targetProduct.badge =
            targetProduct.previousBadge ||
            "";

    }


    targetProduct.previousBadge =
        "";


    saveProducts(
        products
    );


    renderAdmin();


    alert(
        "Discount removed successfully."
    );
}


/* ============================================================
   EDIT IMAGE PREVIEW
============================================================ */

function updateEditImagePreview() {

    if (
        !editProductImagePreview
    ) {

        return;

    }


    const imagePath =
        editImageInput
            .value
            .trim();


    editProductImagePreview.src =
        imagePath ||
        "assets/images/placeholder.png";
}


/* ============================================================
   MODAL HELPERS

   IMPORTANT:
   Existing CSS uses the "open"
   class for modal visibility.
============================================================ */

function openModal(
    modal,
    overlay
) {

    if (
        !modal ||
        !overlay
    ) {

        return;

    }


    modal.classList.add(
        "open"
    );

    overlay.classList.add(
        "open"
    );


    document.body.style.overflow =
        "hidden";
}


function closeModal(
    modal,
    overlay
) {

    if (
        !modal ||
        !overlay
    ) {

        return;

    }


    modal.classList.remove(
        "open"
    );

    overlay.classList.remove(
        "open"
    );


    document.body.style.overflow =
        "";
}


/* ============================================================
   EDIT MODAL CLOSE
============================================================ */

function closeEditModal() {

    closeModal(
        editProductModal,
        editModalOverlay
    );


    editingProductId =
        null;


    editProductName.textContent =
        "Edit Product";


    editNameInput.value =
        "";

    editCategoryInput.value =
        "";

    editDescriptionInput.value =
        "";

    editPriceInput.value =
        "";

    editStockInput.value =
        "";

    editBadgeInput.value =
        "";

    editImageInput.value =
        "";


    editProductImagePreview.src =
        "assets/images/placeholder.png";
}


/* ============================================================
   DISCOUNT MODAL CLOSE
============================================================ */

function closeDiscountModal() {

    closeModal(
        discountModal,
        discountModalOverlay
    );


    discountProductId =
        null;


    discountProductName.textContent =
        "";


    discountOriginalPrice.textContent =
        "";


    discountPriceInput.value =
        "";
}


/* ============================================================
   EVENT INITIALIZATION
============================================================ */

function initializeAdminEvents() {


    if (
        addProductForm
    ) {

        addProductForm.addEventListener(
            "submit",
            handleAddProduct
        );

    }


    if (
        editModalSaveButton
    ) {

        editModalSaveButton.addEventListener(
            "click",
            saveEditedProduct
        );

    }


    if (
        editModalCloseButton
    ) {

        editModalCloseButton.addEventListener(
            "click",
            closeEditModal
        );

    }


    if (
        editModalOverlay
    ) {

        editModalOverlay.addEventListener(
            "click",
            closeEditModal
        );

    }


    if (
        editImageInput
    ) {

        editImageInput.addEventListener(
            "input",
            updateEditImagePreview
        );

    }


    if (
        editProductImagePreview
    ) {

        editProductImagePreview.addEventListener(
            "error",
            function () {

                this.onerror =
                    null;

                this.src =
                    "assets/images/placeholder.png";

            }
        );

    }


    if (
        discountModalSaveButton
    ) {

        discountModalSaveButton.addEventListener(
            "click",
            applyDiscount
        );

    }


    if (
        discountModalCloseButton
    ) {

        discountModalCloseButton.addEventListener(
            "click",
            closeDiscountModal
        );

    }


    if (
        discountModalOverlay
    ) {

        discountModalOverlay.addEventListener(
            "click",
            closeDiscountModal
        );

    }
}


/* ============================================================
   HTML ESCAPING HELPERS
============================================================ */

function escapeHTML(
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


function escapeAttribute(
    value
) {

    return escapeHTML(
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
