# BunMart Backend — Microservices

Backend for the BunMart e-commerce platform. Ten microservices handle product catalog, inventory, pricing, cart, orders, payment, shipping, notifications, reviews, and user management. Each service supports **full CRUD** on its entities, exposes **gRPC** for service-to-service communication, and provides **REST** for clients (web/mobile).

---

## Table of Contents

- [Overview](#overview)
- [API Policy: REST vs gRPC](#api-policy-rest-vs-grpc)
- [gRPC Data Format Conventions](#grpc-data-format-conventions)
- [Services and CRUD Operations](#services-and-crud-operations)
- [gRPC Contracts by Service](#grpc-contracts-by-service)
- [Basic REST Endpoints by Service](#basic-rest-endpoints-by-service)
- [Service-to-Service Interactions](#service-to-service-interactions)
- [Project Structure](#project-structure)

---

## Overview

| Service                | Responsibility                                                                                    | CRUD focus                               |
| ---------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1. Product Catalog     | Products, categories (flat), images, tags                                                         | Products, categories, tags, images       |
| 2. Inventory           | Stock, warehouses, locations                                                                      | Stock entries, warehouses, locations     |
| 3. Pricing & Promotion | Prices, discounts, campaigns, **coupons**; **calculates price for product + quantity**            | Price rules, campaigns, banners, coupons |
| 4. Shopping Cart       | Temporary carts, items; **only keeps** product_id, quantity, optional coupon (no address/pricing) | Carts, cart items, notes                 |
| 5. Order               | Orders, status, notes (created when Cart calls CreateOrderIntent)                                 | Orders, order items, notes               |
| 6. Payment             | Payments, methods, billing, **payment preferences**                                               | Payments, methods, billing info          |
| 7. Shipping            | Shipments, drivers, delivery                                                                      | Shipments, drivers, vehicles, docs       |
| 8. Notification        | Email, SMS, in-app                                                                                | Notifications, templates, rules          |
| 9. Review & Rating     | Product feedback, moderation                                                                      | Reviews, moderation logs                 |
| 10. User Management    | Profiles, addresses, roles (payment preferences are in Payment service)                           | Users, addresses, roles                  |

---

## API Policy: REST vs gRPC

- **REST APIs**
  - Used by frontends and external clients.
  - **Basic** endpoints listed below are a **recommended minimum**.
  - Each service’s developers **may add extra REST APIs** and **may change URL structure, query params, or request/response bodies** to fit their frontend and product needs.
  - REST is **flexible per service** as long as the service still fulfils its gRPC contract.

- **gRPC contracts**
  - Used **only** for **service-to-service** communication.
  - **Must be implemented as specified.**
  - **Do not change** message names, field numbers, or RPC signatures without a shared contract update and agreement across consuming services.
  - This keeps integrations between Cart, Order, Pricing, Inventory, etc. stable and predictable.

---

## gRPC Data Format Conventions

- **Protocol**: Protocol Buffers 3 (proto3).
- **Naming**:
  - Messages: `PascalCase` (e.g. `ProductInfo`, `CartItem`).
  - Fields: `snake_case` (e.g. `product_id`, `unit_price`).
  - RPCs: `PascalCase` (e.g. `GetProduct`, `ReserveStock`).
- **Identifiers**: Use `string` for IDs (e.g. `product_id`, `user_id`) to allow UUIDs or other schemes.
- **Money**: Use a **decimal representation** (e.g. `string` like `"19.99"` or a `Money` message with `units` + `nanos`).
- **Timestamps**: Use `google.protobuf.Timestamp` for `created_at`, `updated_at`, etc.
- **Errors**: Use standard gRPC status codes; optional: small `ErrorDetails` message for extra context.
- **Pagination**: When listing, use `page_token` (or `cursor`) and `page_size`; response includes `next_page_token` and list of items.

---

## Services and CRUD Operations

### 1. Product Catalog Service

- **CREATE**: Products, categories (flat set), tags, product images.
- **READ**: Products (by id, list, search), categories, tags, images.
- **UPDATE**: Product details, category assignment, tag assignments, image metadata.
- **DELETE**: Products, categories, tags, images (with any soft-delete policy you define).

Feeds: Cart, Order, Pricing, Review (product identity and metadata).

---

### 2. Inventory Service

- **CREATE**: Stock entries, warehouses, storage locations.
- **READ**: Stock levels (by product, warehouse, location), warehouse/location info.
- **UPDATE**: Quantities (restock, deductions), warehouse/location details.
- **DELETE**: Obsolete stock records, warehouses, locations.

Feeds: Cart (availability), Order (reservation/deduction), Shipping (pick location).

---

### 3. Pricing & Promotion Service

This service is **responsible for calculating the price** for a given product and its quantity (with optional coupon). It owns all price rules, discounts, campaigns, and **coupons**. **Actual pricing calculations are performed only when placing an order**: the Order service calls this service at checkout; the cart does not request pricing.

- **CREATE**: Price rules, discount rules, campaigns, banners, **coupons**, scheduled promotions.
- **READ**: Current price(s) for product(s), applicable discounts, active campaigns, coupons; **calculated price for product + quantity** (and optional coupon).
- **UPDATE**: Prices, discount rules, campaign metadata, coupons, schedules.
- **DELETE**: Price rules, campaigns, banners, coupons, scheduled promotions.

Feeds: **Order** (final pricing at checkout when order is placed).

---

### 4. Shopping Cart Service

The cart stores **only cart data**: **product_id**, **quantity**, and optional **applied coupon code** (reference). It does **not** provide user address or pricing. When creating an order, the Order service calls Cart to get this cart data only; Order gets user location/address from **User Management** and pricing from **Pricing & Promotion**. **Cart service** calls **Order.CreateOrderIntent** when the user initiates checkout; Order then creates the order object and the frontend can fetch it via GET /orders/{id}.

- **CREATE**: Cart, cart items, cart notes; applied coupon code (reference only).
- **READ**: Cart by user/session, cart items, notes, applied coupon code (reference).
- **UPDATE**: Quantities, notes, applied coupon code (reference).
- **DELETE**: Cart, cart items, notes, applied coupon reference.

Interacts with: **Order** (Cart calls **Order.CreateOrderIntent** with **user_id, items (product_id, quantity), optional coupon_codes**; Order may call **Cart.InvalidateCart** after creating the order if cart_id was provided).

---

### 5. Order Service

- **CREATE**: Orders (created when **Cart** calls **CreateOrderIntent**), order lines, order notes, special instructions.
- **READ**: Order by id (frontend fetches after CreateOrderIntent), list by user, order status, notes.
- **UPDATE**: Order status (e.g. processing, shipped, delivered), notes.
- **DELETE**: Archive/cancel orders (policy defined by service).

Interacts with: **Cart** (Cart calls Order.CreateOrderIntent with **user_id, items, optional coupon_codes**; Order may call Cart.InvalidateCart after creating order), **User Management** (Order calls **GetUserAddresses(user_id)** to get user **shipping location**), **Pricing & Promotion** (Order calls **CalculateOrderPricing(user_id, items, coupon_codes)** with product_id, quantity, optional coupon codes to get pricing), Payment, Shipping, Notification.

---

### 6. Payment Service

- **CREATE**: Payment records, payment methods, billing info, **payment preferences** (saved methods).
- **READ**: Payment status, payment history, methods, billing details, preferences.
- **UPDATE**: Payment lifecycle (pending → success/failed), method defaults.
- **DELETE**: Archive old payments, remove payment methods (per policy).

Interacts with: Order, Notification (payment confirmations).

---

### 7. Shipping Service

- **CREATE**: Shipments, driver profiles, vehicle info, delivery docs, shipment images.
- **READ**: Shipment status, driver/vehicle info, docs, images.
- **UPDATE**: Delivery progress, driver/vehicle details, docs.
- **DELETE**: Archive shipments, remove drivers/vehicles/docs (per policy).

Interacts with: Order, Notification (tracking updates).

---

### 8. Notification Service

- **CREATE**: Notifications (email/SMS/in-app), templates, delivery rules.
- **READ**: Notification logs, templates, rules, delivery status.
- **UPDATE**: Templates, rules, retry/status.
- **DELETE**: Old messages, templates, rules.

Called by: Order, Payment, Shipping, User Management (and others as needed).

---

### 9. Review & Rating Service

- **CREATE**: Reviews, ratings, moderation logs, feedback metadata.
- **READ**: Reviews by product, average rating, moderation logs.
- **UPDATE**: Review content, moderation notes, flags.
- **DELETE**: Reviews, moderation records (per policy).

Interacts with: Product Catalog (product identity).

---

### 10. User Management Service

Payment preferences (e.g. saved payment methods) are handled by the **Payment** service; User Management does not own them.

- **CREATE**: Users, profiles, addresses, roles, contact info.
- **READ**: User/profile, addresses, roles.
- **UPDATE**: Profile, addresses, roles.
- **DELETE**: Users, addresses (per policy).

Interacts with: Cart, Order, Payment, Notification (user identity and contact).

---

## gRPC Contracts by Service

Each service **must** implement the following gRPC contract exactly.

---

### 1. Product Catalog Service — gRPC contract

**Package**: `bunmart.product.v1`

**Messages:**

```protobuf
message ProductInfo {
  string product_id = 1;
  string name = 2;
  string description = 3;
  string category_id = 4;
  repeated string tag_ids = 5;
  string image_url = 6;
  repeated string image_urls = 7;
  google.protobuf.Timestamp created_at = 8;
  google.protobuf.Timestamp updated_at = 9;
}

message CategoryInfo {
  string category_id = 1;
  string name = 2;
  int32 sort_order = 3;  // display order in flat list (no hierarchy)
}

message GetProductRequest { string product_id = 1; }
message GetProductResponse { ProductInfo product = 1; }

message GetProductsRequest { repeated string product_ids = 1; }
message GetProductsResponse { repeated ProductInfo products = 1; }

message ValidateProductsRequest { repeated string product_ids = 1; }
message ValidateProductsResponse { repeated string valid_product_ids = 1; }
```

**Service:** `ProductCatalogService` — `GetProduct`, `GetProducts`, `ValidateProducts`

**Message and RPC use cases**

| Message / RPC        | Use case                                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **ProductInfo**      | Returned by GetProduct/GetProducts; carries product identity, name, description, category, tags, images for display or line items. |
| **CategoryInfo**     | Flat set of categories (no hierarchy). Used when callers need category list for filters or product grouping.                       |
| **GetProduct**       | Single product lookup (e.g. Cart or product-detail UI needs one product’s name, image, description).                               |
| **GetProducts**      | Batch product lookup (e.g. Order needs names/images for many product IDs when building order confirmation).                        |
| **ValidateProducts** | Ensure product IDs exist and are active before adding to cart or creating order; response is subset that are valid.                |

**Consumers**: Cart, Order, Review, Pricing (product id for price lookup).

---

### 2. Inventory Service — gRPC contract

**Package**: `bunmart.inventory.v1`

**Messages:**

```protobuf
message CheckStockRequest {
  string product_id = 1;
  int32 quantity = 2;
  string warehouse_id = 3;
}

message CheckStockResponse {
  bool available = 1;
  int32 available_quantity = 2;
  string warehouse_id = 3;
}

message CheckStocksRequest {
  message Item { string product_id = 1; int32 quantity = 2; }
  repeated Item items = 1;
  string warehouse_id = 2;
}

message CheckStocksResponse {
  message ItemResult {
    string product_id = 1;
    bool available = 2;
    int32 available_quantity = 3;
  }
  repeated ItemResult results = 1;
}

message ReserveStockRequest {
  string reservation_id = 1;
  string product_id = 2;
  string warehouse_id = 3;
  int32 quantity = 4;
  google.protobuf.Timestamp expires_at = 5;
}

message ReserveStockResponse { bool success = 1; string reservation_id = 2; }

message ReleaseReservationRequest { string reservation_id = 1; }
message ReleaseReservationResponse { bool released = 1; }

message ConfirmDeductionRequest { string reservation_id = 1; string order_id = 2; }
message ConfirmDeductionResponse { bool success = 1; }
```

**Service:** `InventoryService` — `CheckStock`, `CheckStocks`, `ReserveStock`, `ReleaseReservation`, `ConfirmDeduction`

**Message and RPC use cases**

| Message / RPC          | Use case                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **CheckStock**         | Check if one product has enough quantity (e.g. before adding to cart or at checkout). |
| **CheckStocks**        | Batch availability for multiple products/quantities (e.g. full cart at checkout).     |
| **ReserveStock**       | Hold stock at checkout; Order calls with reservation_id, product, quantity, expiry.   |
| **ReleaseReservation** | Cancel a reservation (e.g. order abandoned or payment failed).                        |
| **ConfirmDeduction**   | After payment success, convert reservation into real deduction.                       |

**Consumers**: Cart (availability), Order (reserve on checkout, confirm on payment, release on cancel).

---

### 3. Pricing & Promotion Service — gRPC contract

**Package**: `bunmart.pricing.v1`

**Messages:**

```protobuf
message PriceInfo {
  string product_id = 1;
  string unit_price = 2;
  string currency_code = 3;
}

message DiscountInfo {
  string discount_id = 1;
  string product_id = 2;
  string type = 3;
  string value = 4;
  string description = 5;
}

message GetPricesRequest { repeated string product_ids = 1; }
message GetPricesResponse { repeated PriceInfo prices = 1; }

message GetDiscountsRequest {
  repeated string product_ids = 1;
  string user_id = 2;
  string coupon_code = 3;
}

message GetDiscountsResponse { repeated DiscountInfo discounts = 1; }

message CalculatePriceRequest {
  string product_id = 1;
  int32 quantity = 2;
  string coupon_code = 3;
  string user_id = 4;
}

message CalculatePriceResponse {
  string product_id = 1;
  int32 quantity = 2;
  string unit_price = 3;
  string subtotal = 4;
  string discount_amount = 5;
  string discount_description = 6;
  string total = 7;
  string currency_code = 8;
  bool coupon_applied = 9;
}

// Batch: Order sends product_id, quantity per line + optional coupon codes; Pricing returns line-level and total.
message CalculateOrderPricingRequest {
  string user_id = 1;
  message LineItem { string product_id = 1; int32 quantity = 2; }
  repeated LineItem items = 2;
  repeated string coupon_codes = 3;   // optional
}

message CalculateOrderPricingResponse {
  message LineResult {
    string product_id = 1;
    int32 quantity = 2;
    string unit_price = 3;
    string line_total = 4;
  }
  repeated LineResult lines = 1;
  string subtotal = 2;
  string discount_total = 3;
  string total = 4;
  string currency_code = 5;
}
```

**Service:** `PricingService` — `GetPrices`, `GetDiscounts`, `CalculatePrice`, `CalculateOrderPricing`

**Message and RPC use cases**

| Message / RPC | Use case |
|---------------|----------|
| **PriceInfo** | Unit price per product; Order uses at checkout for base prices. |
| **DiscountInfo** | Describes discount (product- or cart-level); returned by GetDiscounts. |
| **GetPrices** | Fetch current unit prices for a list of product IDs (Order at checkout). |
| **GetDiscounts** | Fetch applicable discounts for products and optional coupon/user. |
| **CalculatePrice** | Compute final price for **one** product and quantity (and optional coupon). |
| **CalculateOrderPricing** | **Use case:** Order sends **product_id, quantity** per line and optional **coupon_codes**; Pricing returns per-line pricing (unit_price, line_total) and **subtotal, discount_total, total, currency_code**. Order calls this when creating order from CreateOrderIntent (cart data). |

**Consumers**: **Order** (actual pricing **when placing the order** at checkout).

---

### 4. Shopping Cart Service — gRPC contract

**Package**: `bunmart.cart.v1`

**Messages:**

```protobuf
message CartItemInfo {
  string cart_item_id = 1;
  string product_id = 2;
  int32 quantity = 3;
  string unit_price = 4;   // optional; display-only
  string line_total = 5;   // optional; display-only
}

message CartInfo {
  string cart_id = 1;
  string user_id = 2;
  repeated CartItemInfo items = 3;
  string subtotal = 4;
  string discount_total = 5;
  string total = 6;
  string currency_code = 7;
  string applied_coupon_code = 8;  // reference only
}

message GetCartRequest { string user_id = 1; string session_id = 2; }
message GetCartResponse { CartInfo cart = 1; }

message GetCartForCheckoutRequest { string user_id = 1; string session_id = 2; }
message GetCartForCheckoutResponse {
  CartInfo cart = 1;
  bool valid = 2;
  repeated string errors = 3;
}

message InvalidateCartRequest { string cart_id = 1; string order_id = 2; }
message InvalidateCartResponse { bool invalidated = 1; }
```

**Service:** `CartService` — `GetCart`, `GetCartForCheckout`, `InvalidateCart`

**Message and RPC use cases**

| Message / RPC          | Use case                                                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CartItemInfo**       | One line: **product_id, quantity** (and optional display unit_price/line_total). Cart provides **only** this cart data — no address, no pricing.                            |
| **CartInfo**           | Cart data only: items (product_id, quantity), **applied_coupon_code**. No user location or address (Order gets from User Management); no pricing (Order gets from Pricing). |
| **GetCart**            | Load cart for display (cart page, mini-cart); gets items and applied coupon code.                                                                                           |
| **GetCartForCheckout** | Optional: load cart by user/session. For **CreateOrderIntent**, Cart **passes** user_id, items (product_id, quantity), coupon_codes **in the request**; Order does not call GetCartForCheckout in that flow. |
| **InvalidateCart**     | Order calls after order is created to clear or lock the cart.                                                                                                               |

**Consumers**: Order (InvalidateCart after order created; GetCartForCheckout optional for other flows). **Cart calls**: **Order.CreateOrderIntent** with **user_id, items (product_id, quantity), optional coupon_codes** — Cart does **not** send session_id or shipping_address_id; Order fetches shipping from User Management and pricing from Pricing.

---

### 5. Order Service — gRPC contract

**Package**: `bunmart.order.v1`

**Messages:**

```protobuf
message OrderLineInfo {
  string product_id = 1;
  int32 quantity = 2;
  string unit_price = 3;
  string line_total = 4;
}

message OrderInfo {
  string order_id = 1;
  string user_id = 2;
  string status = 3;
  repeated OrderLineInfo lines = 4;
  string subtotal = 5;
  string discount_total = 6;
  string shipping_total = 7;
  string total = 8;
  string currency_code = 9;
  string shipping_address_id = 10;
  google.protobuf.Timestamp created_at = 11;
  google.protobuf.Timestamp updated_at = 12;
}

message GetOrderRequest { string order_id = 1; }
message GetOrderResponse { OrderInfo order = 1; }

message GetOrderStatusRequest { string order_id = 1; }
message GetOrderStatusResponse {
  string order_id = 1;
  string status = 2;
  google.protobuf.Timestamp updated_at = 3;
}

// Cart service calls this with only the data it has: user_id, items (product_id, quantity), optional coupon codes.
// user_id is required so Order can call User Management (e.g. GetUserAddresses(user_id)) to get the user's shipping location.
// No session_id, no shipping_address_id — Order fetches shipping address from User Management and pricing from Pricing.
message CreateOrderIntentRequest {
  string user_id = 1;   // required; Order uses this to call User Management for shipping address
  message CartLine {
    string product_id = 1;
    int32 quantity = 2;
  }
  repeated CartLine items = 2;
  repeated string coupon_codes = 3;   // optional; coupon code(s) applied to the cart
  string cart_id = 4;                 // optional; so Order can call Cart.InvalidateCart after creating the order
}

message CreateOrderIntentResponse {
  string order_id = 1;   // frontend fetches full order via GetOrder / GET /orders/{id}
}
```

**Service:** `OrderService` — `CreateOrderIntent`, `GetOrder`, `GetOrderStatus`

**CreateOrderIntent flow**

- **Cart service** calls Order.CreateOrderIntent with **only** the data Cart has: **user_id** (so Order can call User Management with it), **items** (product_id, quantity per line), optional **coupon_codes**, and optional **cart_id**. Cart does **not** send session_id or shipping_address_id.
- **Order service** then: (1) calls **User Management** with the **user_id** from the request (e.g. **GetUserAddresses(user_id)**) to get the user’s **shipping location/address**; (2) calls **Pricing & Promotion** (e.g. **CalculateOrderPricing(user_id, items, coupon_codes)**) with **product_id, quantity** and optional **coupon codes** to calculate the price; (3) optionally Inventory (CheckStocks, ReserveStock); (4) creates the order object (e.g. PENDING); (5) if cart_id was provided, may call **Cart.InvalidateCart(cart_id)**.
- Response: **order_id** only; frontend fetches full order via **GetOrder** or REST **GET /orders/{id}**.

**Message and RPC use cases**

| Message / RPC         | Use case                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **OrderLineInfo**     | One order line: product_id, quantity, unit_price, line_total.                                                                            |
| **OrderInfo**         | Full order; returned by GetOrder (CreateOrderIntent returns only order_id).                                                               |
| **CreateOrderIntent** | Cart calls Order with **user_id, items, optional coupon_codes**. Order calls User Management (GetUserAddresses) for shipping and Pricing (CalculateOrderPricing) for pricing, then creates order. Response: **order_id** only; frontend fetches full order via GetOrder / GET /orders/{id}. |
| **GetOrder**          | Fetch full order by id (frontend after CreateOrderIntent; Payment, Shipping, Notification for their flows).                              |
| **GetOrderStatus**    | Lightweight status check (status and updated_at only).                                                                                   |

**Consumers**: **Cart** (calls CreateOrderIntent); Payment; Shipping; Notification.

---

### 6. Payment Service — gRPC contract

**Package**: `bunmart.payment.v1`

**Messages:**

```protobuf
message CreatePaymentIntentRequest {
  string order_id = 1;
  string amount = 2;
  string currency_code = 3;
  string user_id = 4;
}

message CreatePaymentIntentResponse {
  string payment_id = 1;
  string client_secret = 2;
  string status = 3;
}

message GetPaymentStatusRequest { string payment_id = 1; }
message GetPaymentStatusResponse {
  string payment_id = 1;
  string status = 2;
  string order_id = 3;
  google.protobuf.Timestamp updated_at = 4;
}

message ConfirmPaymentRequest { string payment_id = 1; }
message ConfirmPaymentResponse { bool success = 1; string status = 2; }
```

**Service:** `PaymentService` — `CreatePaymentIntent`, `GetPaymentStatus`, `ConfirmPayment`

**Message and RPC use cases**

| Message / RPC           | Use case                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **CreatePaymentIntent** | Start payment for an order; Order calls with order_id, amount, currency, user_id; returns payment_id and client_secret for frontend. |
| **GetPaymentStatus**    | Poll or webhook follow-up for payment outcome (PENDING/SUCCEEDED/FAILED).                                                            |
| **ConfirmPayment**      | Mark payment as confirmed after successful charge; Order calls after frontend confirms success.                                      |

**Consumers**: Order; Notification (payment confirmation).

---

### 7. Shipping Service — gRPC contract

**Package**: `bunmart.shipping.v1`

**Messages:**

```protobuf
message CreateShipmentRequest {
  string order_id = 1;
  string user_id = 2;
  string shipping_address_id = 3;
  repeated string product_ids = 4;
  string carrier = 5;
}

message CreateShipmentResponse {
  string shipment_id = 1;
  string tracking_number = 2;
  string status = 3;
}

message GetShipmentStatusRequest { string shipment_id = 1; }
message GetShipmentStatusResponse {
  string shipment_id = 1;
  string order_id = 2;
  string tracking_number = 3;
  string status = 4;
  google.protobuf.Timestamp estimated_delivery = 5;
  google.protobuf.Timestamp updated_at = 6;
}

message UpdateShipmentStatusRequest { string shipment_id = 1; string status = 2; }
message UpdateShipmentStatusResponse { bool updated = 1; }
```

**Service:** `ShippingService` — `CreateShipment`, `GetShipmentStatus`, `UpdateShipmentStatus`

**Message and RPC use cases**

| Message / RPC            | Use case                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| **CreateShipment**       | Create a shipment for a paid order; Order calls with order_id, user_id, shipping_address_id, product_ids. |
| **GetShipmentStatus**    | Get current shipment status and ETA (frontend, Order, Notification).                                      |
| **UpdateShipmentStatus** | Update status from logistics (carrier webhook or admin).                                                  |

**Consumers**: Order; Notification (tracking updates).

---

### 8. Notification Service — gRPC contract

**Package**: `bunmart.notification.v1`

**Messages:**

```protobuf
message SendNotificationRequest {
  string user_id = 1;
  string channel = 2;       // EMAIL, SMS, IN_APP
  string template_id = 3;
  map<string, string> template_data = 4;
  string subject = 5;
  string reference_type = 6;
  string reference_id = 7;
}

message SendNotificationResponse {
  string notification_id = 1;
  string status = 2;       // SENT, QUEUED, FAILED
}
```

**Service:** `NotificationService` — `SendNotification`

**Message and RPC use cases**

| Message / RPC        | Use case                                                                                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SendNotification** | Send one notification to a user. Caller provides user_id, channel, template_id, template_data; reference_type and reference_id link to order/payment/shipment. Used by Order (order confirm, status), Payment (receipt), Shipping (tracking), User Management (welcome, password reset). |

**Consumers**: Order, Payment, Shipping, User Management.

---

### 9. Review & Rating Service — gRPC contract

**Package**: `bunmart.review.v1`

**Messages:**

```protobuf
message ReviewInfo {
  string review_id = 1;
  string product_id = 2;
  string user_id = 3;
  int32 rating = 4;
  string comment = 5;
  string status = 6;
  google.protobuf.Timestamp created_at = 7;
}

message GetReviewsRequest {
  string product_id = 1;
  int32 page_size = 2;
  string page_token = 3;
}

message GetReviewsResponse {
  repeated ReviewInfo reviews = 1;
  string next_page_token = 2;
}

message GetProductRatingRequest { string product_id = 1; }
message GetProductRatingResponse {
  string product_id = 1;
  double average_rating = 2;
  int32 total_count = 3;
}
```

**Service:** `ReviewService` — `GetReviews`, `GetProductRating`

**Message and RPC use cases**

| Message / RPC        | Use case                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **GetReviews**       | Paginated list of reviews for a product (Product Catalog or frontend for product page).       |
| **GetProductRating** | Aggregate rating for a product (average_rating, total_count) for product card or detail page. |

**Consumers**: Product Catalog (or frontend).

---

### 10. User Management Service — gRPC contract

**Package**: `bunmart.user.v1`

**Messages:**

```protobuf
message UserInfo {
  string user_id = 1;
  string email = 2;
  string display_name = 3;
  repeated string roles = 4;
}

message AddressInfo {
  string address_id = 1;
  string user_id = 2;
  string line1 = 3;
  string line2 = 4;
  string city = 5;
  string state = 6;
  string postal_code = 7;
  string country = 8;
  string type = 9;   // SHIPPING, BILLING
}

message GetUserRequest { string user_id = 1; }
message GetUserResponse { UserInfo user = 1; }

message GetUserAddressesRequest { string user_id = 1; }
message GetUserAddressesResponse { repeated AddressInfo addresses = 1; }

message ValidateUserRequest { string user_id = 1; }
message ValidateUserResponse { bool valid = 1; UserInfo user = 2; }
```

**Service:** `UserService` — `GetUser`, `GetUserAddresses`, `ValidateUser`

**Message and RPC use cases**

| Message / RPC        | Use case                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| **GetUser**          | Fetch user profile by id (Order, Cart, Payment, Notification for user identity).               |
| **GetUserAddresses** | Fetch user’s addresses; Order calls when placing order to get shipping address for Shipping.   |
| **ValidateUser**     | Check that user_id exists and is active (Order or Cart before creating order or binding cart). |

**Consumers**: Cart, Order, Payment, Notification, Shipping.

---

## Basic REST Endpoints by Service

Recommended baseline REST endpoints. Each team may add or change paths/request bodies; the **gRPC contract must remain as defined above**.

| Service                 | CREATE                                                                           | READ                                                                                          | UPDATE                                                                                | DELETE                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Product Catalog**     | `POST /products`, `POST /categories`, `POST /tags`, `POST /products/{id}/images` | `GET /products`, `GET /products/{id}`, `GET /categories`, `GET /tags`                         | `PUT /products/{id}`, `PUT /categories/{id}`, `PUT /tags/{id}`                        | `DELETE /products/{id}`, `DELETE /categories/{id}`, `DELETE /tags/{id}`                           |
| **Inventory**           | `POST /stock`, `POST /warehouses`, `POST /locations`                             | `GET /stock`, `GET /stock/product/{id}`, `GET /warehouses`, `GET /locations`                  | `PUT /stock/{id}`, `PUT /warehouses/{id}`, `PUT /locations/{id}`                      | `DELETE /stock/{id}`, `DELETE /warehouses/{id}`, `DELETE /locations/{id}`                         |
| **Pricing & Promotion** | `POST /prices`, `POST /campaigns`, `POST /discounts`, `POST /coupons`            | `GET /prices`, `GET /prices/product/{id}`, `GET /campaigns`, `GET /discounts`, `GET /coupons` | `PUT /prices/{id}`, `PUT /campaigns/{id}`, `PUT /discounts/{id}`, `PUT /coupons/{id}` | `DELETE /prices/{id}`, `DELETE /campaigns/{id}`, `DELETE /discounts/{id}`, `DELETE /coupons/{id}` |
| **Shopping Cart**       | `POST /carts`, `POST /carts/{id}/items`                                          | `GET /carts/{id}`, `GET /carts/user/{userId}`                                                 | `PUT /carts/{id}/items/{itemId}`, `PUT /carts/{id}`                                   | `DELETE /carts/{id}`, `DELETE /carts/{id}/items/{itemId}`                                         |
| **Order**               | `POST /orders` (or CreateOrderIntent flow)                                       | `GET /orders/{id}`, `GET /orders/user/{userId}`                                               | `PUT /orders/{id}/status`                                                             | `DELETE /orders/{id}` (or archive)                                                                |
| **Payment**             | `POST /payments`, `POST /payment-methods`                                        | `GET /payments/{id}`, `GET /payments/order/{orderId}`, `GET /payment-methods`                 | `PUT /payments/{id}/status`, `PUT /payment-methods/{id}`                              | `DELETE /payments/{id}` (archive), `DELETE /payment-methods/{id}`                                 |
| **Shipping**            | `POST /shipments`, `POST /drivers`, `POST /vehicles`                             | `GET /shipments/{id}`, `GET /shipments/order/{orderId}`, `GET /drivers`, `GET /vehicles`      | `PUT /shipments/{id}`, `PUT /drivers/{id}`, `PUT /vehicles/{id}`                      | `DELETE /shipments/{id}`, `DELETE /drivers/{id}`, `DELETE /vehicles/{id}`                         |
| **Notification**        | `POST /notifications`, `POST /templates`, `POST /rules`                          | `GET /notifications`, `GET /templates`, `GET /rules`                                          | `PUT /templates/{id}`, `PUT /rules/{id}`                                              | `DELETE /notifications/{id}`, `DELETE /templates/{id}`, `DELETE /rules/{id}`                      |
| **Review & Rating**     | `POST /reviews`, `POST /moderation-logs`                                         | `GET /reviews`, `GET /reviews/product/{productId}`, `GET /moderation-logs`                    | `PUT /reviews/{id}`, `PUT /moderation-logs/{id}`                                      | `DELETE /reviews/{id}`, `DELETE /moderation-logs/{id}`                                            |
| **User Management**     | `POST /users`, `POST /users/{id}/addresses`, `POST /roles`                       | `GET /users/{id}`, `GET /users/{id}/addresses`, `GET /roles`                                  | `PUT /users/{id}`, `PUT /users/{id}/addresses/{addrId}`, `PUT /roles/{id}`            | `DELETE /users/{id}`, `DELETE /users/{id}/addresses/{addrId}`, `DELETE /roles/{id}`               |

---

## Service-to-Service Interactions

Who calls whom over **gRPC**:

```
User Management  ◄── Order (user, address), Cart (user), Payment (user), Notification (recipient)
Product Catalog  ◄── Cart, Order, Review, Pricing
Inventory        ◄── Cart (availability), Order (reserve → confirm or release)
Pricing & Promo  ◄── Order only (at checkout: GetPrices, GetDiscounts, CalculatePrice, CalculateOrderPricing)
Cart Service     ◄── Order (InvalidateCart after order; GetCartForCheckout optional)
Order Service    ◄── Cart (CreateOrderIntent), Payment, Shipping, Notification
Payment          ◄── Order; Notification (payment confirm)
Shipping         ◄── Order; Notification (tracking)
Review & Rating  ◄── Product Catalog (or frontend): GetReviews, GetProductRating
```

**Summary**

| Caller                       | Callee          | gRPC usage                                                                                                                                     |
| ---------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Cart                         | Product Catalog | GetProduct(s), ValidateProducts                                                                                                                |
| Cart                         | Inventory       | CheckStock(s) (optional)                                                                                                                       |
| Cart                         | Order           | **CreateOrderIntent** (Cart passes **user_id, items (product_id, quantity), optional coupon_codes**; no session_id/shipping_address_id; Order gets address from User, pricing from Pricing) |
| Order                        | Cart            | InvalidateCart (after order created; GetCartForCheckout optional for other flows)                                                              |
| Order                        | User            | GetUser, **GetUserAddresses** (shipping location), ValidateUser                                                                                |
| Order                        | Product Catalog | GetProducts (line item details)                                                                                                                |
| Order                        | Inventory       | ReserveStock, ReleaseReservation, ConfirmDeduction                                                                                             |
| Order                        | Pricing         | GetPrices, GetDiscounts, CalculatePrice, **CalculateOrderPricing** (product_id, quantity, coupon_codes)                                        |
| Order                        | Payment         | CreatePaymentIntent, GetPaymentStatus, ConfirmPayment                                                                                          |
| Order                        | Shipping        | CreateShipment                                                                                                                                 |
| Order                        | Notification    | SendNotification (order confirm, status)                                                                                                       |
| Payment                      | Notification    | SendNotification (payment confirm)                                                                                                             |
| Shipping                     | Notification    | SendNotification (tracking)                                                                                                                    |
| (Frontend / Product Catalog) | Review          | GetReviews, GetProductRating                                                                                                                   |

---

## Project Structure

```
backend/
├── README.md                 # This file
├── base/                     # Shared template (optional)
├── cartService/
├── productCatalogService/    # to be added
├── inventoryService/
├── pricingService/
├── orderService/
├── paymentService/
├── shippingService/
├── notificationService/
├── reviewService/
└── userService/
```

Each service is a separate deployable unit with its own database (or schema). Shared gRPC **proto files** should live in a common module (e.g. `proto/` or `contracts/`) and be compiled into each service that implements or calls the RPCs.

---

**Reminder**: REST is owned by each team; gRPC contracts are shared and must be followed as-is for reliable service-to-service communication.
