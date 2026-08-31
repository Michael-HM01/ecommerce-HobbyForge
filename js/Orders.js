/* ============================================================
Orders.js

Responsibility:

* Order storage
* Order ID generation
* Checkout/cart validation
* Order snapshot creation
* Stock deduction
* Order creation
  ============================================================ */

/* ============================================================
ORDER STATUS
============================================================ */

const ORDER_STATUS = {

```
PENDING:
    "Pending",

PROCESSING:
    "Processing",

COMPLETED:
    "Completed",

CANCELLED:
    "Cancelled"
```

};

/* ============================================================
ORDER STORAGE
============================================================ */

function getOrders() {

```
return getFromStorage(
    STORAGE_KEYS.ORDERS,
    []
);
```

}

function saveOrders(orders) {

```
setToStorage(
    STORAGE_KEYS.ORDERS,
    orders
);
```

}

/* ============================================================
ORDER ID GENERATION

Format:

ORD-000001
ORD-000002
ORD-000003
============================================================ */

function generateOrderId() {

```
const orders =
    getOrders();


let highestNumber =
    0;


orders.forEach(
    function (order) {

        if (
            !order ||
            !order.id
        ) {

            return;

        }


        const match =
            String(
                order.id
            ).match(
                /^ORD-(\d+)$/
            );


        if (
            !match
        ) {

            return;

        }


        const number =
            Number(
                match[1]
            );


        if (
            Number.isFinite(
                number
            ) &&
            number >
            highestNumber
        ) {

            highestNumber =
                number;

        }

    }
);


const nextNumber =
    highestNumber +
    1;


return (
    "ORD-" +
    String(
        nextNumber
    ).padStart(
        6,
        "0"
    )
);
```

}

/* ============================================================
CUSTOMER NORMALIZATION

Keeps the order data structure
consistent before it is saved.
============================================================ */

function normalizeCustomer(
customer
) {

```
customer =
    customer || {};


return {

    name:
        typeof customer.name ===
        "string"

            ? customer.name.trim()

            : "",


    email:
        typeof customer.email ===
        "string"

            ? customer.email.trim()

            : "",


    phone:
        typeof customer.phone ===
        "string"

            ? customer.phone.trim()

            : "",


    address:
        typeof customer.address ===
        "string"

            ? customer.address.trim()

            : ""

};
```

}

/* ============================================================
CHECKOUT DETAILS NORMALIZATION

Stores delivery and payment
information consistently.

The payment reference field is
intentionally not required and
does not affect order processing.
============================================================ */

function normalizeCheckoutDetails(
checkoutDetails
) {

```
checkoutDetails =
    checkoutDetails || {};


const deliveryMethod =
    typeof checkoutDetails.deliveryMethod ===
    "string" &&

    checkoutDetails.deliveryMethod.trim()

        ? checkoutDetails.deliveryMethod.trim()

        : "Standard Delivery";


let deliveryFee =
    Number(
        checkoutDetails.deliveryFee
    );


if (
    !Number.isFinite(
        deliveryFee
    ) ||

    deliveryFee <
    0
) {

    deliveryFee =
        100;

}


const paymentMethod =
    typeof checkoutDetails.paymentMethod ===
    "string" &&

    checkoutDetails.paymentMethod.trim()

        ? checkoutDetails.paymentMethod.trim()

        : "Cash on Delivery";


return {

    deliveryMethod:
        deliveryMethod,


    deliveryFee:
        deliveryFee,


    paymentMethod:
        paymentMethod

};
```

}

/* ============================================================
CHECKOUT VALIDATION

This validates the current cart
against the current product catalog.

Validation includes:

* Cart contains items
* Product still exists
* Product is in stock
* Quantity is valid
* Quantity does not exceed stock

Returns:

{
valid: true,
cart: [...],
products: [...]
}

OR

{
valid: false,
message: "..."
}
============================================================ */

function validateCheckoutCart() {

```
/*
   Reconcile first.

   This removes products that no
   longer exist and adjusts
   quantities to available stock.
*/

const cart =
    reconcileCart();


if (
    !Array.isArray(
        cart
    ) ||

    cart.length ===
    0
) {

    return {

        valid:
            false,

        message:
            "Your cart is empty."

    };

}


const validatedItems =
    [];


for (
    let index = 0;

    index <
    cart.length;

    index++
) {

    const cartItem =
        cart[index];


    const product =
        getProductById(
            cartItem.id
        );


    /* Product deleted */

    if (
        !product
    ) {

        return {

            valid:
                false,

            message:
                "A product in your cart is no longer available."

        };

    }


    /* Product out of stock */

    if (
        product.stock <=
        0
    ) {

        return {

            valid:
                false,

            message:
                product.name +
                " is currently out of stock."

        };

    }


    const quantity =
        Number(
            cartItem.quantity
        );


    if (

        !Number.isFinite(
            quantity
        ) ||

        quantity <=
        0

    ) {

        return {

            valid:
                false,

            message:
                "An invalid quantity was found in your cart."

        };

    }


    if (
        quantity >
        product.stock
    ) {

        return {

            valid:
                false,

            message:
                "There is not enough stock available for " +
                product.name +
                "."

        };

    }


    validatedItems.push({

        cartItem:
            cartItem,

        product:
            product,

        quantity:
            Math.floor(
                quantity
            )

    });

}


return {

    valid:
        true,

    items:
        validatedItems

};
```

}

/* ============================================================
ORDER ITEM SNAPSHOT

Creates permanent transaction data.

Historical orders must not change
when products are later edited.
============================================================ */

function createOrderItemSnapshot(
product,
quantity
) {

```
const unitPrice =
    Number(
        getEffectivePrice(
            product
        )
    );


const subtotal =
    unitPrice *
    quantity;


return {

    productId:
        product.id,


    productName:
        product.name,


    category:
        product.category,


    image:
        product.image,


    quantity:
        quantity,


    unitPrice:
        unitPrice,


    subtotal:
        subtotal

};
```

}

/* ============================================================
ORDER SNAPSHOT

Builds the complete order object.

Includes:

* Customer information
* Product snapshots
* Subtotal
* Delivery method
* Delivery fee
* Payment method
* Final total
  ============================================================ */

function createOrderSnapshot(
customer,
validatedItems,
checkoutDetails
) {

```
const orderItems =
    [];


let subtotal =
    0;


validatedItems.forEach(
    function (
        validatedItem
    ) {

        const orderItem =
            createOrderItemSnapshot(

                validatedItem.product,

                validatedItem.quantity

            );


        orderItems.push(
            orderItem
        );


        subtotal +=
            orderItem.subtotal;

    }
);


const normalizedCheckout =
    normalizeCheckoutDetails(
        checkoutDetails
    );


const deliveryFee =
    normalizedCheckout.deliveryFee;


const total =
    subtotal +
    deliveryFee;


return {

    id:
        generateOrderId(),


    createdAt:
        new Date()
            .toISOString(),


    customer:
        normalizeCustomer(
            customer
        ),


    items:
        orderItems,


    subtotal:
        subtotal,


    deliveryMethod:
        normalizedCheckout.deliveryMethod,


    deliveryFee:
        deliveryFee,


    paymentMethod:
        normalizedCheckout.paymentMethod,


    total:
        total,


    status:
        ORDER_STATUS.PENDING

};
```

}

/* ============================================================
STOCK DEDUCTION

Deducts stock only after the
entire checkout cart has passed
validation.
============================================================ */

function deductOrderStock(
validatedItems
) {

```
const products =
    getProducts();


validatedItems.forEach(
    function (
        validatedItem
    ) {

        const productIndex =
            products.findIndex(
                function (
                    product
                ) {

                    return (

                        product.id ===

                        validatedItem.product.id

                    );

                }
            );


        /*
           This should not happen
           because validation has
           already confirmed that
           the product exists.
        */

        if (
            productIndex ===
            -1
        ) {

            return;

        }


        const currentStock =
            Number(
                products[
                    productIndex
                ].stock
            );


        const quantity =
            Number(
                validatedItem.quantity
            );


        products[
            productIndex
        ].stock =
            Math.max(

                0,

                currentStock -
                quantity

            );

    }
);


saveProducts(
    products
);
```

}

/* ============================================================
CREATE ORDER

Transaction flow:

1. Validate cart
2. Create order snapshot
3. Deduct stock
4. Save order
5. Clear cart

Returns:

{
success: true,
order: {...}
}

OR

{
success: false,
message: "..."
}
============================================================ */

function createOrder(
customer,
checkoutDetails
) {

```
/*
   STEP 1

   Validate before modifying
   permanent data.
*/

const validation =
    validateCheckoutCart();


if (
    !validation.valid
) {

    return {

        success:
            false,

        message:
            validation.message

    };

}


/*
   STEP 2

   Create the permanent order
   snapshot while current
   product data is valid.
*/

const order =
    createOrderSnapshot(

        customer,

        validation.items,

        checkoutDetails

    );


/*
   STEP 3

   Deduct product stock.
*/

deductOrderStock(
    validation.items
);


/*
   STEP 4

   Save order.
*/

const orders =
    getOrders();


orders.push(
    order
);


saveOrders(
    orders
);


/*
   STEP 5

   Clear the cart only after
   the order has been created.
*/

saveCart(
    []
);


updateCartCount();


renderCartDrawer();


return {

    success:
        true,

    order:
        order

};
```

}

/* ============================================================
ORDER LOOKUP HELPERS

These will be used later by:

* Checkout confirmation
* Admin orders page
  ============================================================ */

function getOrderById(
orderId
) {

```
const orders =
    getOrders();


return orders.find(
    function (
        order
    ) {

        return (
            order.id ===
            orderId
        );

    }
);
```

}

/* ============================================================
INITIALIZATION

No DOM initialization is needed
yet.

This file currently provides
transaction logic only.
============================================================ */
