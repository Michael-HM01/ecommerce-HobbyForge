/* ============================================================
   cart.js

   Responsibility:
   - Cart storage
   - Cart reconciliation
   - Add/remove products
   - Quantity controls
   - Current price synchronization
   - Discount-aware totals
   - Cart drawer rendering
   - Cart count badge
============================================================ */


/* ============================================================
   CART STORAGE
============================================================ */

function getCart() {

  return getFromStorage(
    STORAGE_KEYS.CART,
    []
  );

}


function saveCart(cart) {

  setToStorage(
    STORAGE_KEYS.CART,
    cart
  );

}


/* ============================================================
   PRICE HELPERS

   The catalog remains the source of truth.

   Cart items only store:
   - Product ID
   - Quantity

   Prices are always retrieved from the
   current product data.
============================================================ */

function getCartEffectivePrice(product) {

  if (
    typeof getEffectivePrice ===
    "function"
  ) {

    return Number(
      getEffectivePrice(
        product
      )
    );

  }


  const regularPrice =
    Number(
      product.price
    );


  const discountPrice =
    Number(
      product.discountPrice
    );


  if (

    product.discountPrice !==
      null &&

    product.discountPrice !==
      undefined &&

    Number.isFinite(
      discountPrice
    ) &&

    discountPrice > 0 &&

    discountPrice <
      regularPrice

  ) {

    return discountPrice;

  }


  return regularPrice;

}


function cartProductHasDiscount(product) {

  if (
    typeof hasValidDiscount ===
    "function"
  ) {

    return hasValidDiscount(
      product
    );

  }


  const regularPrice =
    Number(
      product.price
    );


  const discountPrice =
    Number(
      product.discountPrice
    );


  return (

    product.discountPrice !==
      null &&

    product.discountPrice !==
      undefined &&

    Number.isFinite(
      discountPrice
    ) &&

    discountPrice > 0 &&

    discountPrice <
      regularPrice

  );

}


/* ============================================================
   CART INTEGRITY
============================================================ */

function reconcileCart() {

  const cart =
    getCart();


  const products =
    getProducts();


  const cleanedCart =
    [];


  cart.forEach(
    function (
      item
    ) {

      if (
        !item ||
        !item.id
      ) {

        return;

      }


      const product =
        products.find(
          function (
            p
          ) {

            return (
              p.id ===
              item.id
            );

          }
        );


      /* Product no longer exists */

      if (
        !product
      ) {

        return;

      }


      /* Product is out of stock */

      if (

        typeof product.stock !==
          "number" ||

        product.stock <= 0

      ) {

        return;

      }


      let quantity =
        Number(
          item.quantity
        );


      /* Invalid quantity */

      if (

        !Number.isFinite(
          quantity
        ) ||

        quantity <= 0

      ) {

        return;

      }


      quantity =
        Math.floor(
          quantity
        );


      /*
         Quantity cannot exceed
         current stock.
      */

      quantity =
        Math.min(
          quantity,
          product.stock
        );


      if (
        quantity <= 0
      ) {

        return;

      }


      /*
         Only ID and quantity are
         retained in the cart.
      */

      cleanedCart.push({

        id:
          product.id,

        quantity:
          quantity

      });

    }
  );


  saveCart(
    cleanedCart
  );


  updateCartCount();


  return cleanedCart;

}


/* ============================================================
   ADD TO CART
============================================================ */

function addToCart(
  productId,
  quantity
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


  if (
    product.stock <= 0
  ) {

    return;

  }


  const requestedQuantity =
    Number(
      quantity
    );


  const qtyToAdd =

    Number.isFinite(
      requestedQuantity
    ) &&

    requestedQuantity > 0

      ? Math.floor(
          requestedQuantity
        )

      : 1;


  const cart =
    reconcileCart();


  const existingItem =
    cart.find(
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
    existingItem
  ) {

    const newQuantity =
      existingItem.quantity +
      qtyToAdd;


    existingItem.quantity =
      Math.min(
        newQuantity,
        product.stock
      );

  } else {

    cart.push({

      id:
        product.id,

      quantity:
        Math.min(
          qtyToAdd,
          product.stock
        )

    });

  }


  saveCart(
    cart
  );


  updateCartCount();


  renderCartDrawer();

}


/* ============================================================
   REMOVE FROM CART
============================================================ */

function removeFromCart(
  productId
) {

  let cart =
    getCart();


  cart =
    cart.filter(
      function (
        item
      ) {

        return (
          item.id !==
          productId
        );

      }
    );


  saveCart(
    cart
  );


  updateCartCount();


  renderCartDrawer();

}


/* ============================================================
   UPDATE CART QUANTITY
============================================================ */

function updateCartItemQuantity(
  productId,
  newQuantity
) {

  const product =
    getProductById(
      productId
    );


  /*
     Product may have been deleted
     or gone out of stock.
  */

  if (

    !product ||

    product.stock <= 0

  ) {

    removeFromCart(
      productId
    );

    return;

  }


  const cart =
    reconcileCart();


  const item =
    cart.find(
      function (
        i
      ) {

        return (
          i.id ===
          productId
        );

      }
    );


  if (
    !item
  ) {

    return;

  }


  let quantity =
    Number(
      newQuantity
    );


  if (
    !Number.isFinite(
      quantity
    )
  ) {

    quantity =
      1;

  }


  quantity =
    Math.floor(
      quantity
    );


  /*
     Quantity lower than 1
     remains at 1.

     The remove button handles
     actual deletion.
  */

  if (
    quantity < 1
  ) {

    quantity =
      1;

  }


  if (
    quantity >
    product.stock
  ) {

    quantity =
      product.stock;

  }


  item.quantity =
    quantity;


  saveCart(
    cart
  );


  updateCartCount();


  renderCartDrawer();

}


/* ============================================================
   CART ITEM COUNT
============================================================ */

function getCartItemCount() {

  const cart =
    reconcileCart();


  return cart.reduce(
    function (
      sum,
      item
    ) {

      return (
        sum +
        item.quantity
      );

    },
    0
  );

}


/* ============================================================
   CART TOTAL

   Always uses the CURRENT
   effective catalog price.
============================================================ */

function getCartTotal() {

  const cart =
    reconcileCart();


  let total =
    0;


  cart.forEach(
    function (
      item
    ) {

      const product =
        getProductById(
          item.id
        );


      if (
        !product
      ) {

        return;

      }


      const effectivePrice =
        getCartEffectivePrice(
          product
        );


      total +=

        effectivePrice *

        item.quantity;

    }
  );


  return total;

}


/* ============================================================
   CART COUNT BADGE
============================================================ */

function updateCartCount() {

  const countEls =
    document.querySelectorAll(
      ".js-cart-count"
    );


  if (
    countEls.length ===
    0
  ) {

    return;

  }


  const cart =
    getCart();


  const count =
    cart.reduce(
      function (
        sum,
        item
      ) {

        return (

          sum +

          Number(
            item.quantity
          )

        );

      },
      0
    );


  countEls.forEach(
    function (
      element
    ) {

      element.textContent =
        count;

    }
  );

}


/* ============================================================
   CART PRICE DISPLAY
============================================================ */

function buildCartPriceHTML(
  product
) {

  const effectivePrice =
    getCartEffectivePrice(
      product
    );


  if (
    cartProductHasDiscount(
      product
    )
  ) {

    return `

      <span
        class="
          cart-item-original-price
        "
        style="
          text-decoration:
          line-through;

          opacity:0.6;

          font-size:0.85em;

          margin-right:6px;
        "
      >
        ${formatPrice(
          product.price
        )}
      </span>


      <span
        class="
          cart-item-discount-price
        "
      >
        ${formatPrice(
          effectivePrice
        )}
      </span>

    `;

  }


  return formatPrice(
    effectivePrice
  );

}


/* ============================================================
   CART DRAWER RENDERING
============================================================ */

function renderCartDrawer() {

  const cartItemsEl =
    document.getElementById(
      "cart-items"
    );


  const cartTotalEl =
    document.getElementById(
      "cart-total"
    );


  if (
    !cartItemsEl
  ) {

    return;

  }


  const cart =
    reconcileCart();


  cartItemsEl.innerHTML =
    "";


  if (
    cart.length ===
    0
  ) {

    const emptyMessage =
      document.createElement(
        "p"
      );


    emptyMessage.className =
      "cart-empty";


    emptyMessage.id =
      "cart-empty";


    emptyMessage.textContent =
      "Your cart is empty.";


    cartItemsEl.appendChild(
      emptyMessage
    );

  } else {

    cart.forEach(
      function (
        item
      ) {

        const product =
          getProductById(
            item.id
          );


        if (
          !product
        ) {

          return;

        }


        const row =
          document.createElement(
            "div"
          );


        row.className =
          "cart-item";


        const imagePath =
          product.image ||
          "assets/images/placeholder.png";


        row.innerHTML =

          '<img ' +

            'src="' +
            escapeCartAttribute(
              imagePath
            ) +
            '" ' +

            'alt="' +
            escapeCartAttribute(
              product.name
            ) +
            '" ' +

            'class="cart-item-img">' +


          '<div class="cart-item-info">' +


            '<p class="cart-item-name">' +

              escapeCartHTML(
                product.name
              ) +

            '</p>' +


            '<p class="cart-item-price">' +

              buildCartPriceHTML(
                product
              ) +

            '</p>' +


            '<div class="cart-qty-controls">' +


              '<button ' +

                'class="qty-btn js-cart-decrease" ' +

                'data-id="' +

                  escapeCartAttribute(
                    product.id
                  ) +

                '">' +

                '-' +

              '</button>' +


              '<span class="qty-value">' +

                item.quantity +

              '</span>' +


              '<button ' +

                'class="qty-btn js-cart-increase" ' +

                'data-id="' +

                  escapeCartAttribute(
                    product.id
                  ) +

                '">' +

                '+' +

              '</button>' +


            '</div>' +


          '</div>' +


          '<button ' +

            'class="cart-remove-btn js-cart-remove" ' +

            'data-id="' +

              escapeCartAttribute(
                product.id
              ) +

            '" ' +

            'aria-label="Remove item">' +

            '&times;' +

          '</button>';


        const productImage =
          row.querySelector(
            ".cart-item-img"
          );


        if (
          productImage
        ) {

          productImage.addEventListener(
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


        cartItemsEl.appendChild(
          row
        );

      }
    );

  }


  if (
    cartTotalEl
  ) {

    cartTotalEl.textContent =
      formatPrice(
        getCartTotal()
      );

  }


  attachCartItemListeners();

}


/* ============================================================
   CART ITEM LISTENERS
============================================================ */

function attachCartItemListeners() {

  document
    .querySelectorAll(
      ".js-cart-increase"
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


            const cart =
              reconcileCart();


            const item =
              cart.find(
                function (
                  i
                ) {

                  return (
                    i.id ===
                    id
                  );

                }
              );


            if (
              item
            ) {

              updateCartItemQuantity(
                id,
                item.quantity + 1
              );

            }

          }
        );

      }
    );


  document
    .querySelectorAll(
      ".js-cart-decrease"
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


            const cart =
              reconcileCart();


            const item =
              cart.find(
                function (
                  i
                ) {

                  return (
                    i.id ===
                    id
                  );

                }
              );


            if (
              item
            ) {

              updateCartItemQuantity(
                id,
                item.quantity - 1
              );

            }

          }
        );

      }
    );


  document
    .querySelectorAll(
      ".js-cart-remove"
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


            removeFromCart(
              id
            );

          }
        );

      }
    );

}


/* ============================================================
   CART DRAWER OPEN
============================================================ */

function openCartDrawer() {

  const drawer =
    document.getElementById(
      "cart-drawer"
    );


  const overlay =
    document.getElementById(
      "cart-overlay"
    );


  if (
    !drawer
  ) {

    return;

  }


  drawer.classList.add(
    "open"
  );


  if (
    overlay
  ) {

    overlay.classList.add(
      "open"
    );

  }


  renderCartDrawer();

}


/* ============================================================
   CART DRAWER CLOSE
============================================================ */

function closeCartDrawer() {

  const drawer =
    document.getElementById(
      "cart-drawer"
    );


  const overlay =
    document.getElementById(
      "cart-overlay"
    );


  if (
    !drawer
  ) {

    return;

  }


  drawer.classList.remove(
    "open"
  );


  if (
    overlay
  ) {

    overlay.classList.remove(
      "open"
    );

  }

}


/* ============================================================
   HTML SAFETY HELPERS
============================================================ */

function escapeCartHTML(
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


function escapeCartAttribute(
  value
) {

  return escapeCartHTML(
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

function initCart() {

  initStorage();


  reconcileCart();


  updateCartCount();


  renderCartDrawer();


  const cartButtons =
    document.querySelectorAll(
      ".js-open-cart"
    );


  cartButtons.forEach(
    function (
      button
    ) {

      button.addEventListener(
        "click",
        openCartDrawer
      );

    }
  );


  const closeBtn =
    document.getElementById(
      "cart-close-btn"
    );


  if (
    closeBtn
  ) {

    closeBtn.addEventListener(
      "click",
      closeCartDrawer
    );

  }


  const overlay =
    document.getElementById(
      "cart-overlay"
    );


  if (
    overlay
  ) {

    overlay.addEventListener(
      "click",
      closeCartDrawer
    );

  }


  /*
     Checkout implementation
     belongs to the next stage.
  */

  const checkoutBtn =
    document.getElementById(
      "checkout-btn"
    );


  if (
    checkoutBtn
  ) {

    checkoutBtn.addEventListener(
      "click",
      function () {

        alert(
          "Checkout functionality will be implemented in the next phase."
        );

      }
    );

  }

}


document.addEventListener(
  "DOMContentLoaded",
  function () {

    initCart();

  }
);
