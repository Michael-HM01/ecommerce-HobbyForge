/* ============================================================
   checkout.js

   Responsibility:
   - Checkout page rendering
   - Cart reconciliation
   - Order summary display
   - Customer form UI handling

   Order creation will be implemented in the next checkout stage.
   ============================================================ */


/* ============================================================
   EFFECTIVE PRICE
============================================================ */

function getCheckoutEffectivePrice(product) {

  /*
     The project already uses getEffectivePrice()
     for products and order snapshots.

     This fallback prevents the checkout page from
     breaking if the pricing helper is unavailable.
  */

  if (
    typeof getEffectivePrice === "function"
  ) {

    return Number(
      getEffectivePrice(product)
    );

  }


  return Number(
    product.price
  );

}


/* ============================================================
   CHECKOUT ITEM COUNT
============================================================ */

function getCheckoutItemCount(cart) {

  return cart.reduce(
    function (
      total,
      item
    ) {

      return (
        total +
        Number(item.quantity)
      );

    },
    0
  );

}


/* ============================================================
   CHECKOUT RENDER
============================================================ */

function renderCheckout() {


  const layout =
    document.getElementById(
      "checkout-layout"
    );


  const emptyState =
    document.getElementById(
      "checkout-empty"
    );


  const itemsContainer =
    document.getElementById(
      "checkout-items"
    );


  const itemCountEl =
    document.getElementById(
      "checkout-item-count"
    );


  const subtotalEl =
    document.getElementById(
      "checkout-subtotal"
    );


  const totalEl =
    document.getElementById(
      "checkout-total"
    );


  if (
    !layout ||
    !emptyState ||
    !itemsContainer
  ) {

    return;

  }


  /*
     Reconcile the cart against
     the latest product data.
  */

  const cart =
    reconcileCart();


  /*
     Empty cart state.
  */

  if (
    !Array.isArray(cart) ||
    cart.length === 0
  ) {

    layout.style.display =
      "none";


    emptyState.style.display =
      "block";


    return;

  }


  /*
     Cart contains items.
  */

  layout.style.display =
    "grid";


  emptyState.style.display =
    "none";


  itemsContainer.innerHTML =
    "";


  let subtotal =
    0;


  cart.forEach(
    function (
      cartItem
    ) {


      const product =
        getProductById(
          cartItem.id
        );


      if (
        !product
      ) {

        return;

      }


      const quantity =
        Number(
          cartItem.quantity
        );


      const unitPrice =
        getCheckoutEffectivePrice(
          product
        );


      const itemSubtotal =
        unitPrice *
        quantity;


      subtotal +=
        itemSubtotal;


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "checkout-item";


      /*
         Image fallback.

         Products without images will
         not cause broken checkout layout.
      */

      const image =
        product.image &&
        String(
          product.image
        ).trim() !== ""

          ? product.image

          : "";


      item.innerHTML =
        '<div class="checkout-item-image-wrap">' +

          (
            image

              ?

                '<img ' +
                'src="' + image + '" ' +
                'alt="' + product.name + '" ' +
                'class="checkout-item-image">'

              :

                '<div class="checkout-item-image-placeholder">' +
                  'HF' +
                '</div>'

          ) +

        '</div>' +


        '<div class="checkout-item-details">' +

          '<p class="checkout-item-category">' +
            product.category +
          '</p>' +


          '<h3 class="checkout-item-name">' +
            product.name +
          '</h3>' +


          '<p class="checkout-item-quantity">' +
            'Quantity: ' +
            quantity +
          '</p>' +


          '<p class="checkout-item-unit-price">' +
            formatPrice(unitPrice) +
            ' each' +
          '</p>' +


        '</div>' +


        '<div class="checkout-item-subtotal">' +

          formatPrice(
            itemSubtotal
          ) +

        '</div>';


      itemsContainer.appendChild(
        item
      );


    }
  );


  /*
     Update totals.
  */

  if (
    subtotalEl
  ) {

    subtotalEl.textContent =
      formatPrice(
        subtotal
      );

  }


  if (
    totalEl
  ) {

    totalEl.textContent =
      formatPrice(
        subtotal
      );

  }


  /*
     Update item count.
  */

  if (
    itemCountEl
  ) {


    const itemCount =
      getCheckoutItemCount(
        cart
      );


    itemCountEl.textContent =
      itemCount +
      (
        itemCount === 1

          ? " Item"

          : " Items"
      );


  }


}


/* ============================================================
   CUSTOMER FORM UI

   Step 7.2 intentionally does not
   create an order yet.

   The next stage will perform full
   validation and call createOrder().
============================================================ */

function initCheckoutForm() {


  const form =
    document.getElementById(
      "checkout-form"
    );


  const message =
    document.getElementById(
      "checkout-form-message"
    );


  if (
    !form
  ) {

    return;

  }


  form.addEventListener(
    "submit",

    function (
      event
    ) {


      event.preventDefault();


      if (
        message
      ) {


        message.textContent =
          "Customer information validation will be completed in the next step.";


        message.className =
          "checkout-form-message checkout-form-message-info";


        message.style.display =
          "block";


      }


    }

  );


}


/* ============================================================
   INITIALIZATION
============================================================ */

function initCheckout() {

  initStorage();

  renderCheckout();

  initCheckoutForm();

}


document.addEventListener(
  "DOMContentLoaded",

  function () {

    initCheckout();

  }

);
