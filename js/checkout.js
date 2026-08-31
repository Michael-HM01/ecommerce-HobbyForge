/* ============================================================
checkout.js

Responsibility:

* Checkout page rendering
* Cart reconciliation
* Order summary display
* Delivery selection
* Payment selection
* Customer validation
* Order creation
* Order receipt display
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
DELIVERY HELPERS
============================================================ */

function getSelectedDeliveryOption() {

return document.querySelector(
'input[name="delivery-method"]:checked'
);

}

function getSelectedDeliveryDetails() {

const selectedOption =
getSelectedDeliveryOption();

if (
!selectedOption
) {


return {

  value:
    "standard",

  method:
    "Standard Delivery",

  fee:
    100

};


}

const value =
selectedOption.value;

const fee =
Number(
selectedOption.dataset.fee
);

return {


value:
  value,


method:

  value === "express"

    ? "Express Delivery"

    : "Standard Delivery",


fee:

  Number.isFinite(
    fee
  )

    ? fee

    : 100


};

}

/* ============================================================
PAYMENT HELPERS
============================================================ */

function getSelectedPaymentOption() {

return document.querySelector(
'input[name="payment-method"]:checked'
);

}

function getSelectedPaymentDetails() {

const selectedOption =
getSelectedPaymentOption();

const value =
selectedOption


  ? selectedOption.value

  : "cod";


let method =
"Cash on Delivery";

if (
value === "gcash"
) {


method =
  "GCash";


}

else if (
value === "maya"
) {


method =
  "Maya";


}

else if (
value === "mari"
) {


method =
  "Mari";


}

return {


value:
  value,

method:
  method


};

}

/* ============================================================
PAYMENT PLACEHOLDER
============================================================ */

function updatePaymentPlaceholder() {

const placeholder =
document.getElementById(
"payment-placeholder"
);

if (
!placeholder
) {


return;


}

const payment =
getSelectedPaymentDetails();

if (
payment.value ===
"cod"
) {


placeholder.style.display =
  "none";


}

else {


placeholder.style.display =
  "block";


}

}

/* ============================================================
CHECKOUT TOTALS

Calculates:

Product Subtotal
+
Delivery Fee
=
Final Total
============================================================ */

function updateCheckoutTotals(
subtotal
) {

const deliveryFeeEl =
document.getElementById(
"checkout-delivery-fee"
);

const deliveryMethodEl =
document.getElementById(
"checkout-delivery-method"
);

const totalEl =
document.getElementById(
"checkout-total"
);

const delivery =
getSelectedDeliveryDetails();

const total =
Number(
subtotal
) +


Number(
  delivery.fee
);


if (
deliveryFeeEl
) {


deliveryFeeEl.textContent =
  formatPrice(
    delivery.fee
  );


}

if (
deliveryMethodEl
) {


deliveryMethodEl.textContent =
  delivery.method;


}

if (
totalEl
) {


totalEl.textContent =
  formatPrice(
    total
  );


}

}

/* ============================================================
DELIVERY EVENT LISTENERS
============================================================ */

function initDeliveryOptions() {

const deliveryOptions =
document.querySelectorAll(
'input[name="delivery-method"]'
);

deliveryOptions.forEach(
function (
option
) {


  option.addEventListener(
    "change",

    function () {

      renderCheckout();

    }

  );

}


);

}

/* ============================================================
PAYMENT EVENT LISTENERS
============================================================ */

function initPaymentOptions() {

const paymentOptions =
document.querySelectorAll(
'input[name="payment-method"]'
);

paymentOptions.forEach(
function (
option
) {


  option.addEventListener(
    "change",

    function () {

      updatePaymentPlaceholder();

    }

  );

}


);

updatePaymentPlaceholder();

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
!Array.isArray(
cart
) ||


cart.length ===
0


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
Update subtotal.
*/

if (
subtotalEl
) {


subtotalEl.textContent =
  formatPrice(
    subtotal
  );


}

/*
Update final total.


 This includes the currently
 selected delivery fee.


*/

updateCheckoutTotals(
subtotal
);

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
CUSTOMER VALIDATION
============================================================ */

function getCheckoutCustomer() {

const nameInput =
document.getElementById(
"checkout-name"
);

const emailInput =
document.getElementById(
"checkout-email"
);

const phoneInput =
document.getElementById(
"checkout-phone"
);

const addressInput =
document.getElementById(
"checkout-address"
);

return {


name:

  nameInput

    ? nameInput.value.trim()

    : "",


email:

  emailInput

    ? emailInput.value.trim()

    : "",


phone:

  phoneInput

    ? phoneInput.value.trim()

    : "",


address:

  addressInput

    ? addressInput.value.trim()

    : ""


};

}

function validateCheckoutCustomer(
customer
) {

if (
!customer.name
) {


return {
  valid: false,
  message: "Please enter your full name."
};


}

if (
!customer.email
) {


return {
  valid: false,
  message: "Please enter your email address."
};


}

/*
Basic email validation.


 This is intentionally simple
 because this project does not
 use real account verification.


*/

const emailPattern =
/^[^\s@]+@[^\s@]+.[^\s@]+$/;

if (
!emailPattern.test(
customer.email
)
) {


return {
  valid: false,
  message: "Please enter a valid email address."
};


}

if (
!customer.phone
) {


return {
  valid: false,
  message: "Please enter your phone number."
};


}

if (
!customer.address
) {


return {
  valid: false,
  message: "Please enter your delivery address."
};


}

return {
valid: true
};

}

/* ============================================================
FORM MESSAGE HELPERS
============================================================ */

function showCheckoutMessage(
message,
type
) {

const messageEl =
document.getElementById(
"checkout-form-message"
);

if (
!messageEl
) {


return;


}

messageEl.textContent =
message;

messageEl.className =
"checkout-form-message checkout-form-message-" +
type;

messageEl.style.display =
"block";

}

function clearCheckoutMessage() {

const messageEl =
document.getElementById(
"checkout-form-message"
);

if (
!messageEl
) {


return;


}

messageEl.textContent =
"";

messageEl.style.display =
"none";

}

/* ============================================================
RECEIPT PAYMENT INFORMATION

Simulated account information.

User input in the optional
payment field is intentionally
ignored.
============================================================ */

function getReceiptPaymentInfo(
paymentMethod
) {

if (
paymentMethod ===
"GCash"
) {


return {

  label:
    "GCash Account",

  value:
    "**** **** **** 4827",

  status:
    "Payment simulation selected"

};


}

if (
paymentMethod ===
"Maya"
) {


return {

  label:
    "Maya Account",

  value:
    "**** **** **** 7391",

  status:
    "Payment simulation selected"

};


}

if (
paymentMethod ===
"Mari"
) {


return {

  label:
    "Mari Account",

  value:
    "**** **** **** 6154",

  status:
    "Payment simulation selected"

};


}

return {


label:
  "Payment Status",

value:
  "Cash on Delivery",

status:
  "Pay upon delivery"


};

}

/* ============================================================
DATE FORMATTER
============================================================ */

function formatOrderDate(
isoDate
) {

const date =
new Date(
isoDate
);

if (
Number.isNaN(
date.getTime()
)
) {


return "";


}

return date.toLocaleString(
"en-PH",
{


  year:
    "numeric",

  month:
    "long",

  day:
    "numeric",

  hour:
    "numeric",

  minute:
    "2-digit"

}


);

}

/* ============================================================
RECEIPT DISPLAY
============================================================ */

function showOrderReceipt(
order
) {

const checkoutLayout =
document.getElementById(
"checkout-layout"
);

const emptyState =
document.getElementById(
"checkout-empty"
);

if (
!checkoutLayout
) {


return;


}

/*
Hide empty state if visible.
*/

if (
emptyState
) {


emptyState.style.display =
  "none";


}

const paymentInfo =
getReceiptPaymentInfo(
order.paymentMethod
);

let itemsHtml =
"";

order.items.forEach(
function (
item
) {


  itemsHtml +=

    '<div class="receipt-item">' +

      '<div>' +

        '<strong>' +
          item.productName +
        '</strong>' +

        '<br>' +

        '<span>' +
          'Qty: ' +
          item.quantity +
          ' × ' +
          formatPrice(
            item.unitPrice
          ) +
        '</span>' +

      '</div>' +


      '<strong>' +

        formatPrice(
          item.subtotal
        ) +

      '</strong>' +

    '</div>';

}


);

checkoutLayout.style.display =
"block";

checkoutLayout.innerHTML =


'<div class="order-receipt">' +


  '<div class="order-receipt-header">' +

    '<h2>HobbyForge</h2>' +

    '<p>Order Confirmation</p>' +

  '</div>' +


  '<div class="receipt-section">' +

    '<p><strong>Order ID:</strong> ' +
      order.id +
    '</p>' +


    '<p><strong>Date:</strong> ' +
      formatOrderDate(
        order.createdAt
      ) +
    '</p>' +


    '<p><strong>Status:</strong> ' +
      order.status +
    '</p>' +

  '</div>' +


  '<div class="receipt-section">' +

    '<h3>Customer Information</h3>' +

    '<p>' +
      order.customer.name +
    '</p>' +


    '<p>' +
      order.customer.email +
    '</p>' +


    '<p>' +
      order.customer.phone +
    '</p>' +


    '<p>' +
      order.customer.address +
    '</p>' +

  '</div>' +


  '<div class="receipt-section">' +

    '<h3>Order Items</h3>' +

    itemsHtml +

  '</div>' +


  '<div class="receipt-totals">' +

    '<div>' +

      '<span>Subtotal</span>' +

      '<span>' +
        formatPrice(
          order.subtotal
        ) +
      '</span>' +

    '</div>' +


    '<div>' +

      '<span>' +
        order.deliveryMethod +
      '</span>' +

      '<span>' +
        formatPrice(
          order.deliveryFee
        ) +
      '</span>' +

    '</div>' +


    '<div>' +

      '<strong>Total</strong>' +

      '<strong>' +
        formatPrice(
          order.total
        ) +
      '</strong>' +

    '</div>' +

  '</div>' +


  '<div class="receipt-section">' +

    '<h3>Payment Information</h3>' +


    '<p><strong>Method:</strong> ' +
      order.paymentMethod +
    '</p>' +


    '<p><strong>' +
      paymentInfo.label +
    ':</strong> ' +
      paymentInfo.value +
    '</p>' +


    '<p><strong>Status:</strong> ' +
      paymentInfo.status +
    '</p>' +

  '</div>' +


  '<div class="order-receipt-footer">' +

    '<p>' +
      'Thank you for shopping with HobbyForge!' +
    '</p>' +


    '<a ' +
      'href="index.html" ' +
      'class="btn btn-primary btn-full">' +

      'Continue Shopping' +

    '</a>' +

  '</div>' +


'</div>';


/*
Move the user to the receipt.
*/

window.scrollTo(
{
top: 0,
behavior: "smooth"
}
);

}

/* ============================================================
CUSTOMER FORM + ORDER CREATION
============================================================ */

function initCheckoutForm() {

const form =
document.getElementById(
"checkout-form"
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


  clearCheckoutMessage();


  /*
     STEP 1

     Validate customer.
  */

  const customer =
    getCheckoutCustomer();


  const customerValidation =
    validateCheckoutCustomer(
      customer
    );


  if (
    !customerValidation.valid
  ) {

    showCheckoutMessage(

      customerValidation.message,

      "error"

    );


    return;

  }


  /*
     STEP 2

     Get delivery details.
  */

  const delivery =
    getSelectedDeliveryDetails();


  /*
     STEP 3

     Get payment details.

     The optional payment input
     is intentionally ignored.
  */

  const payment =
    getSelectedPaymentDetails();


  const checkoutDetails = {

    deliveryMethod:
      delivery.method,


    deliveryFee:
      delivery.fee,


    paymentMethod:
      payment.method

  };


  /*
     STEP 4

     Lock the button to prevent
     duplicate order submissions.
  */

  const submitButton =
    document.getElementById(
      "place-order-btn"
    );


  if (
    submitButton
  ) {

    submitButton.disabled =
      true;


    submitButton.textContent =
      "Processing Order...";

  }


  /*
     STEP 5

     Create order using the
     existing transaction engine.
  */

  const result =
    createOrder(

      customer,

      checkoutDetails

    );


  /*
     Restore button if the order
     was rejected.
  */

  if (
    !result.success
  ) {

    if (
      submitButton
    ) {

      submitButton.disabled =
        false;


      submitButton.textContent =
        "Place Order";

    }


    showCheckoutMessage(

      result.message ||
      "Unable to place your order.",

      "error"

    );


    /*
       Product stock may have
       changed during validation.
       Refresh checkout.
    */

    renderCheckout();


    return;

  }


  /*
     STEP 6

     Display the receipt.

     At this point the order has
     already been saved, stock has
     been deducted, and the cart
     has been cleared.
  */

  showOrderReceipt(
    result.order
  );


}


);

}

/* ============================================================
INITIALIZATION
============================================================ */

function initCheckout() {

initStorage();

initDeliveryOptions();

initPaymentOptions();

renderCheckout();

initCheckoutForm();

}

document.addEventListener(
"DOMContentLoaded",

function () {


initCheckout();


}

);
