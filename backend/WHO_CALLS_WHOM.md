# Service-to-Service: Who Calls Whom

This document defines **every** service-to-service interaction over **gRPC**: who calls whom, which RPCs, and **why** (business reason). Only calls that a service **actually needs** for its own operations are included. Aggregation for the UI (e.g. product + reviews, cart with product names) is done by the **BFF**; services do not call each other just to enrich data for the user.

**Contract source of truth:** the `.proto` files under [`./proto/`](./proto/). This document is the canonical human-readable specification of interactions.

---

## Principles

- **All backend-to-backend communication is gRPC.** No service calls another via REST or HTTP.
- **Frontends never call gRPC.** They use REST (or each service's HTTP API). A **BFF** may aggregate data from multiple services via REST for the UI.
- **Service-to-service = only what the service needs.** No calls solely to fetch data for display/aggregation to the user; that is the BFF's responsibility.
- **Payment Service does not call User Management.** Payment is Stripe-only; no stored payment methods.
- **IDs are strings** (e.g. `user_id`, `order_id`, `address_id`) for consistency across services.

---

## 1. Full call matrix (caller → callee, RPCs, and why)

| #   | Caller                  | Callee              | RPC(s)                                               | Why (business reason)                                                                                                                                                                                                                                                |
| --- | ----------------------- | ------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0   | **Product Catalog**    | Cart                | `AddCartItem`                                        | When frontend requests add-to-cart (e.g. POST /products/{id}/add-to-cart with user_id, quantity): Product Catalog calls Cart to add the item. Frontend does **not** call Cart directly for add-to-cart.                                                                 |
| 1   | **Cart**                | Product Catalog     | `ValidateProducts`                                   | When adding to cart (in AddCartItem handler) or at checkout: ensure product_ids exist and are active. Prevents invalid product_ids in cart and order intent. Cart does not fetch product names/images for display—BFF does that.                                    |
| 2   | **Cart**                | User Management     | `ValidateUser`                                       | Before creating or binding a cart (or at checkout): ensure user_id exists and is active. Avoids orphan carts and failed order intents.                                                                                                                               |
| 3   | **Cart**                | Order               | `CreateOrderIntent`                                  | At checkout: Cart sends user_id, items (product_id, quantity), optional cart_id. Order creates partial order (intent) and returns order_id; Cart returns this to frontend. No coupons—coupons are applied on order page.                                             |
| 4   | **Cart**                | Notification        | `SendNotification`                                   | (Optional.) Abandoned-cart or “items waiting” reminders. Cart (or a scheduled job) triggers notification when needed.                                                                                                                                                |
| 5   | **Order**               | Cart                | `InvalidateCart`                                     | After order is placed: Order calls Cart with cart_id, order_id, and the **exact product_ids** that were in this order. Cart removes only those items; remaining cart items stay.                                                                                     |
| 6   | **Order**               | User Management     | `GetUser`, `GetUserAddresses`, `ValidateUser`        | Resolve user for order; get address list for delivery (user selects address_id on order page); validate user before creating intent. Order stores address_id and may resolve via GetUserAddresses when building full order.                                          |
| 7   | **Order**               | Pricing & Promotion | `GetPrices`, `GetDiscounts`, `CalculateOrderPricing` | On order page: user applies coupons; Order sends items + coupon_codes and gets per-line pricing and total. Order stores product_id, quantity, unit_price, line_total, subtotal, total from Pricing—no need to call Product for names; BFF can aggregate for display. |
| 8   | **Order**               | Payment             | `CreatePaymentIntent`, `GetPaymentStatus`            | When user presses Pay: Order creates payment intent; Payment returns payment_id and client_secret. Order may poll GetPaymentStatus or receive NotifyPaymentResult from Payment after webhook.                                                                        |
| 9   | **Order**               | Shipping            | `CreateShipment`                                     | When admin presses “Shipped”: Order creates shipment with order_id, user_id, shipping_address_id, product_ids, carrier; Shipping returns shipment_id.                                                                                                                |
| 10  | **Order**               | Notification        | `SendNotification`                                   | Send order confirmation, status updates (e.g. “Order confirmed”, “Order paid”, “Preparing”, “Shipped”).                                                                                                                                                              |
| 11  | **Kitchen**             | Order               | `NotifyOrderPrepared`                                | When kitchen staff mark production as completed: Kitchen notifies Order so order status is set to “prepared”.                                                                                                                                                        |
| 12  | **Kitchen**             | Notification        | `SendNotification`                                   | (Optional.) Notify customer “Your order is being prepared” or staff alerts.                                                                                                                                                                                          |
| 13  | **Pricing & Promotion** | Product Catalog     | `ValidateProducts`                                   | Before applying prices or discounts: ensure product_ids exist and are active. Avoids pricing invalid or discontinued products.                                                                                                                                       |
| 14  | **Payment**             | Order               | `NotifyPaymentResult`                                | (Recommended.) After Stripe webhook: Payment calls Order so Order can set order status to “paid” or “to be paid” without polling.                                                                                                                                    |
| 15  | **Payment**             | Notification        | `SendNotification`                                   | Send payment confirmation / receipt after successful payment.                                                                                                                                                                                                        |
| 16  | **Shipping**            | Order               | `SetOrderShipping`                                   | When admin/driver submit shipping details or update status: Shipping notifies Order so order status is set to “shipping” or “shipped”.                                                                                                                               |
| 17  | **Shipping**            | User Management     | `GetUser`                                            | (Optional.) Resolve user_id to phone/contact for driver. Can be avoided if Order passes contact snapshot in CreateShipment.                                                                                                                                          |
| 18  | **Shipping**            | Notification        | `SendNotification`                                   | Send tracking updates (e.g. “Out for delivery”, “Delivered”).                                                                                                                                                                                                        |
| 19  | **Notification**        | User Management     | `GetUser`                                            | To send EMAIL or SMS: resolve user_id to email/phone. Notification fetches contact details from User; callers pass only user_id.                                                                                                                                     |
| 20  | **User Management**     | Notification        | `SendNotification`                                   | Send welcome email, password reset, email verification, account alerts.                                                                                                                                                                                              |
| 21  | **Review & Rating**     | Product Catalog     | `ValidateProducts`                                   | When user submits a review: ensure product_id exists and is active. Prevents reviews for invalid or deleted products.                                                                                                                                                |
| 22  | **Review & Rating**     | User Management     | `ValidateUser`                                       | When user submits a review: ensure user_id exists and is allowed to post. Prevents orphan or invalid user references.                                                                                                                                                |
| 23  | **Review & Rating**     | Notification        | `SendNotification`                                   | Notify “Your review was published”, or “Review needs moderation” to admins.                                                                                                                                                                                          |
| 24  | **Review & Rating**     | Order               | `ValidateOrderDeliveredForUser` (optional)           | (Optional.) Ensure user can only review after order is delivered. Not yet in proto; add if you enforce review-only-after-delivery.                                                                                                                                   |

**Removed (aggregation/UI-only):**

- **Order → Product Catalog:** Order does not call GetProducts; it stores product_id and quantity and gets pricing from Pricing. BFF aggregates product details for order display.
- **Cart → Product Catalog GetProduct/GetProducts:** Cart only validates product_ids (ValidateProducts). BFF fetches product names/images for cart display.
- **Frontend → Cart for add-to-cart:** Frontend does not call Cart (REST) to add items. Frontend calls Product Catalog (REST e.g. POST /products/{id}/add-to-cart); Product Catalog calls Cart via gRPC `AddCartItem`.
- **Product Catalog → Review:** No service calls Review for “product page with ratings”. BFF calls Review (via REST) and Product Catalog (via REST) and aggregates for the UI.

**Summary of optional/recommended:**

- **Pricing → Product:** recommended for consistent pricing.
- **Payment → Order (NotifyPaymentResult):** recommended so Order does not need to poll.
- **Notification → User:** required if Notification delivers by email/SMS and only receives user_id.
- **Shipping → User:** optional; can be avoided if Order passes contact in CreateShipment.
- **Kitchen → Notification:** optional.
- **Cart → Notification:** optional (abandoned cart).
- **Review → Order:** optional for “review only after delivery” policy.

---

## 2. By service: what I call (outgoing) vs what I expose (incoming)

| Service                 | I call (outgoing gRPC)                                                                                                                                                                                                                                                        | Why                                                                               | Others call me (incoming gRPC)                                                                                                                                     | Why they call                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| **Product Catalog**     | **Cart:** AddCartItem.                                                                                                                                                                                                                                                        | When frontend adds to cart: Product Catalog calls Cart to add item.               | **Cart:** ValidateProducts. **Pricing:** ValidateProducts. **Review:** ValidateProducts.                                                                           | Cart: reject invalid products. Pricing: validate before pricing. Review: validate before saving. |
| **Kitchen**             | **Order:** NotifyOrderPrepared. **Notification:** SendNotification (optional).                                                                                                                                                                                                | Tell Order production done; optionally notify.                                    | **Order:** CreateProductionOrder, GetProductionOrder, UpdateProductionPhase.                                                                                       | Order creates production job; staff updates phase via REST.                                      |
| **Pricing & Promotion** | **Product Catalog:** ValidateProducts (recommended).                                                                                                                                                                                                                          | Ensure product_ids exist before applying prices.                                  | **Order:** GetPrices, GetDiscounts, CalculatePrice, CalculateOrderPricing.                                                                                         | Order builds full order with pricing.                                                            |
| **Cart**                | **Product Catalog:** ValidateProducts. **User:** ValidateUser. **Order:** CreateOrderIntent. **Notification:** SendNotification (optional).                                                                                                                                   | Validate product and user; create order intent; optional reminders.               | **Product Catalog:** AddCartItem. **Order:** GetCart, GetCartForCheckout, InvalidateCart.                                                                          | Product Catalog adds item when frontend requests add-to-cart; Order needs cart for checkout; Order invalidates cart after order placed. |
| **Order**               | **Cart:** InvalidateCart. **User:** GetUser, GetUserAddresses, ValidateUser. **Pricing:** CalculateOrderPricing (and GetPrices/GetDiscounts if needed). **Payment:** CreatePaymentIntent, GetPaymentStatus. **Shipping:** CreateShipment. **Notification:** SendNotification. | Order lifecycle: cart, user/address, pricing, payment, shipment, notifications.   | **Cart:** CreateOrderIntent. **Kitchen:** NotifyOrderPrepared. **Shipping:** SetOrderShipping. **Payment:** NotifyPaymentResult. Others: GetOrder, GetOrderStatus. | Cart starts intent; Kitchen/Shipping report completion; Payment reports result.                  |
| **Payment**             | **Order:** NotifyPaymentResult (recommended). **Notification:** SendNotification.                                                                                                                                                                                             | Tell Order payment result; send receipt.                                          | **Order:** CreatePaymentIntent, GetPaymentIntent, GetPaymentStatus, ConfirmPayment.                                                                                | Order creates intent; Order may poll or receive callback.                                        |
| **Shipping**            | **Order:** SetOrderShipping. **Notification:** SendNotification. **User:** GetUser (optional).                                                                                                                                                                                | Sync order state; tracking; optionally driver contact.                            | **Order:** CreateShipment, GetShipmentStatus, UpdateShipmentStatus.                                                                                                | Order creates shipment; others may query status.                                                 |
| **Notification**        | **User Management:** GetUser.                                                                                                                                                                                                                                                 | Resolve user_id to email/phone for EMAIL/SMS.                                     | **Order, Payment, Shipping, User Management, Kitchen (optional), Cart (optional), Review:** SendNotification.                                                      | All send notifications for their domain events.                                                  |
| **Review & Rating**     | **Product Catalog:** ValidateProducts. **User:** ValidateUser. **Notification:** SendNotification. **Order:** ValidateOrderDeliveredForUser (optional).                                                                                                                       | Validate product and user; notify on publish/moderation; optional delivery check. | **BFF** (via REST) calls GetReviews, GetProductRating for product page. No other service calls Review via gRPC for aggregation.                                    | BFF aggregates reviews with product for UI.                                                      |
| **User Management**     | **Notification:** SendNotification.                                                                                                                                                                                                                                           | Trigger welcome, password reset, verification.                                    | **Order:** GetUser, GetUserAddresses, ValidateUser. **Cart:** ValidateUser. **Notification:** GetUser. **Shipping:** GetUser (optional). **Review:** ValidateUser. | Order needs user/addresses; Cart/Review validate user; Notification/Shipping need contact.       |

---

## 3. Business flows (end-to-end)

### 3.1 Add to cart

1. **Frontend** → Product Catalog (REST): add to cart (e.g. POST /products/{id}/add-to-cart with user_id, quantity). Frontend does **not** call Cart directly.
2. **Product Catalog** → Cart (gRPC): `AddCartItem`(user_id, product_id, quantity).
3. **Cart** → Product Catalog (gRPC): `ValidateProducts` only (ensure product exists).
4. **Cart** → User (gRPC): `ValidateUser` (if cart is user-bound).
5. Cart stores item and returns cart_id and updated cart to Product Catalog; Product Catalog returns result to frontend. BFF may call Product Catalog (REST) to enrich cart for display.

### 3.2 Checkout → Order intent → Full order

1. **Frontend** → Cart (REST): checkout (user_id, cart).
2. **Cart** → Order (gRPC): `CreateOrderIntent`(user_id, items, cart_id).
3. **Order** may call User (gRPC): `GetUserAddresses`(user_id).
4. **Order** returns order_id to Cart; Cart returns order_id to frontend.
5. **Order** may call Cart (gRPC): `InvalidateCart`(cart_id, order_id, product_ids) when order is placed (or after payment, per policy).
6. Frontend redirects to order page with order_id.
7. **Frontend** → Order (REST): get order; **Frontend** → User (REST): get addresses. User applies coupons and address_id.
8. **Frontend** → Order (REST): update order details (coupon_codes, address_id).
9. **Order** → User (gRPC): resolve address_id if needed.
10. **Order** → Pricing (gRPC): `CalculateOrderPricing`(user_id, items, coupon_codes). Order stores lines with product_id, quantity, unit_price, line_total, and total.
11. Order saves full order and returns it to frontend. BFF may call Product Catalog (REST) to enrich order lines for display.

### 3.3 Pay

1. **Frontend** → Order (REST): request payment (order_id).
2. **Order** → Payment (gRPC): `CreatePaymentIntent`(order_id, amount, currency, user_id, …).
3. Payment returns payment_id, client_secret to Order; Order returns to frontend.
4. Frontend uses Stripe with client_secret; user pays.
5. **Stripe webhook** → Payment (HTTP): success/failure.
6. **Payment** → Order (gRPC): `NotifyPaymentResult`(order_id, status) — recommended; or Order polls `GetPaymentStatus`.
7. Order sets status to “paid”; **Order** → **Notification** (gRPC): order confirmation.
8. **Payment** → Notification (gRPC): receipt.

### 3.4 Production (kitchen)

1. **Frontend** → Order (REST): admin triggers “Produce order”.
2. **Order** → Kitchen (gRPC): `CreateProductionOrder`(user_order_id, lines).
3. Kitchen returns production_order_id to Order; Order sets status “production”, returns production_order_id to frontend.
4. Kitchen staff update phase via Kitchen REST.
5. When done, **Kitchen** → Order (gRPC): `NotifyOrderPrepared`(production_order_id, user_order_id).
6. Order sets status “prepared”.
7. **Kitchen** → Notification (gRPC): optional “Your order is being prepared”.

### 3.5 Shipping

1. **Frontend** → Order (REST): admin triggers “Shipped”.
2. **Order** → Shipping (gRPC): `CreateShipment`(order_id, user_id, shipping_address_id, product_ids, carrier).
3. Shipping returns shipment_id to Order; Order returns to frontend.
4. Admin/driver update shipment via Shipping REST.
5. **Shipping** → Order (gRPC): `SetOrderShipping`(shipment_id, order_id, status).
6. Order sets status “shipping” or “shipped”.
7. **Shipping** → Notification (gRPC): tracking updates.
8. **Shipping** → User (gRPC): optional GetUser for driver contact.

### 3.6 Notifications

- **Notification** receives `SendNotification`(user_id, channel, template_id, template_data, …).
- For EMAIL/SMS, **Notification** → User (gRPC): `GetUser`(user_id) to get email/phone.
- Notification sends via template and logs result.

### 3.7 Reviews

1. **BFF** → Review (REST): `GetReviews`, `GetProductRating` for product page (aggregates with Product Catalog via REST for UI).
2. **Frontend** → Review (REST): submit review (product_id, user_id, rating, comment).
3. **Review** → Product Catalog (gRPC): `ValidateProducts`(product_ids).
4. **Review** → User (gRPC): `ValidateUser`(user_id).
5. **Review** → Order (gRPC): optional `ValidateOrderDeliveredForUser` if review-only-after-delivery is enforced.
6. **Review** → Notification (gRPC): `SendNotification` (e.g. review published, needs moderation).

### 3.8 Abandoned cart (optional)

- **Cart** (or scheduled job) → Notification (gRPC): `SendNotification`(user_id, template e.g. abandoned_cart, reference_type cart, reference_id cart_id).

---

## 4. Diagram (who calls whom)

```
Product Catalog ◄── Cart (ValidateProducts), Pricing (ValidateProducts), Review (ValidateProducts)
Product Catalog ──► Cart (AddCartItem when frontend requests add-to-cart)
                         │
Cart ◄── Product Catalog (AddCartItem)
Cart ──► User (ValidateUser), Order (CreateOrderIntent), Notification (optional)
Order ◄── Cart (CreateOrderIntent), Kitchen (NotifyOrderPrepared), Shipping (SetOrderShipping), Payment (NotifyPaymentResult)
Order ──► Cart (InvalidateCart), User (GetUser, GetUserAddresses, ValidateUser), Pricing (CalculateOrderPricing),
        Payment (CreatePaymentIntent, GetPaymentStatus), Shipping (CreateShipment), Notification (SendNotification)
Kitchen ──► Order (NotifyOrderPrepared), Notification (optional)
Pricing ──► Product Catalog (ValidateProducts)
Payment ──► Order (NotifyPaymentResult), Notification (SendNotification)
Shipping ──► Order (SetOrderShipping), User (GetUser optional), Notification (SendNotification)
Notification ──► User (GetUser for email/phone)
User Mgmt ──► Notification (SendNotification)
Review ──► Product Catalog (ValidateProducts), User (ValidateUser), Notification (SendNotification), Order (optional)
```

---

## 5. Proto package and service names (reference)

| Service             | Proto package             | Service name            |
| ------------------- | ------------------------- | ----------------------- |
| Product Catalog     | `bunmart.product.v1`      | `ProductCatalogService` |
| Kitchen             | `bunmart.kitchen.v1`      | `KitchenService`        |
| Pricing & Promotion | `bunmart.pricing.v1`      | `PricingService`        |
| Cart                | `bunmart.cart.v1`         | `CartService`           |
| Order               | `bunmart.order.v1`        | `OrderService`          |
| Payment             | `bunmart.payment.v1`      | `PaymentService`        |
| Shipping            | `bunmart.shipping.v1`     | `ShippingService`       |
| Notification        | `bunmart.notification.v1` | `NotificationService`   |
| Review & Rating     | `bunmart.review.v1`       | `ReviewService`         |
| User Management     | `bunmart.user.v1`         | `UserService`           |

See [`proto/`](./proto/) for exact RPC and message definitions. **GetProduct** and **GetProducts** remain in Product Catalog proto for use by BFF (via REST/gRPC from BFF) or by any service that needs product info for its own backend logic (e.g. server-side generation of slips); they are not used by Cart or Order for aggregation to the user.

---

## 6. Optional RPCs (defined in proto; implement as needed)

- **Order Service:** `NotifyPaymentResult` is defined in `order/v1/order.proto` — Payment calls it after Stripe webhook so Order sets status to paid/failed without polling.
- **Order Service (or Review):** `ValidateOrderDeliveredForUser` (or similar) — not yet in proto; add if you enforce review-only-after-delivery.
- **User Service:** `GetUser` is sufficient for Notification/Shipping to resolve email/phone.

Keep this document and the proto files in sync when adding new interactions.
