/* ============================================================
   cart.js
   Responsibility:
   - Cart storage
   - Cart reconciliation
   - Add/remove items
   - Quantity controls
   - Cart totals
   - Cart drawer rendering
   - Cart count badge
   ============================================================ */


/* ---------- Cart storage ---------- */

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


      /*
         Product no longer exists.
      */

      if (
        !product
      ) {

        return;

      }


      /*
         Product out of stock.
      */

      if (
        typeof product.stock !==
        "number" ||

        product.stock <=
        0
      ) {

        return;

      }


      let quantity =
        Number(
          item.quantity
        );


      /*
         Invalid quantity.
      */

      if (
        !Number.isFinite(
          quantity
        ) ||

        quantity <=
        0
      ) {

        return;

      }


      quantity =
        Math.floor(
          quantity
        );


      /*
         Quantity cannot exceed stock.
      */

      quantity =
        Math.min(
          quantity,
          product.stock
        );


      if (
        quantity <=
        0
      ) {

        return;

      }


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
   CART OPERATIONS
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
    product.stock <=
    0
  ) {

    return;

  }


  const qtyToAdd =

    quantity &&
    quantity >
    0

      ? quantity

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


    const newQty =

      existingItem.quantity +
      qtyToAdd;


    existingItem.quantity =
      Math.min(
        newQty,
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


function updateCartItemQuantity(
  productId,
  newQuantity
) {


  const product =
    getProductById(
      productId
    );


  /*
     Product deleted or unavailable.
  */

  if (
    !product ||

    product.stock <=
    0
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


  if (
    quantity <
    1
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
   TOTALS
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
        product
      ) {


        total +=

          product.price *
          item.quantity;


      }


    }
  );


  return total;

}


/* ============================================================
   CART COUNT
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
          item.quantity
        );

      },
      0
    );


  countEls.forEach(
    function (
      el
    ) {

      el.textContent =
        count;

    }
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


  /*
     Empty cart.
  */

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


        row.innerHTML =

          '<img ' +
          'src="' + product.image + '" ' +
          'alt="' + product.name + '" ' +
          'class="cart-item-img">' +


          '<div class="cart-item-info">' +


            '<p class="cart-item-name">' +

              product.name +

            '</p>' +


            '<p class="cart-item-price">' +

              formatPrice(
                product.price
              ) +

            '</p>' +


            '<div class="cart-qty-controls">' +


              '<button ' +
              'class="qty-btn js-cart-decrease" ' +
              'data-id="' + product.id + '">' +

                '-' +

              '</button>' +


              '<span class="qty-value">' +

                item.quantity +

              '</span>' +


              '<button ' +
              'class="qty-btn js-cart-increase" ' +
              'data-id="' + product.id + '">' +

                '+' +

              '</button>' +


            '</div>' +


          '</div>' +


          '<button ' +
          'class="cart-remove-btn js-cart-remove" ' +
          'data-id="' + product.id + '" ' +
          'aria-label="Remove item">' +

            '&times;' +

          '</button>';


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
        btn
      ) {


        btn.addEventListener(
          "click",

          function () {


            const id =
              btn.getAttribute(
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
                item.quantity +
                1
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
        btn
      ) {


        btn.addEventListener(
          "click",

          function () {


            const id =
              btn.getAttribute(
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
                item.quantity -
                1
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
        btn
      ) {


        btn.addEventListener(
          "click",

          function () {


            const id =
              btn.getAttribute(
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
   CART DRAWER OPEN/CLOSE
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
      btn
    ) {


      btn.addEventListener(
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


        /*
           Do not allow navigation
           to checkout with an
           empty cart.
        */

        const cart =
          reconcileCart();


        if (
          cart.length ===
          0
        ) {

          return;

        }


        window.location.href =
          "checkout.html";


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
