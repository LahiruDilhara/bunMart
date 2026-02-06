# BunMart Backend — Microservices

Backend for the BunMart e-commerce platform. Ten microservices handle product catalog, kitchen (production), pricing, cart, orders, payment, shipping, notifications, reviews, and user management. Each service supports **full CRUD** on its entities, exposes **gRPC** for service-to-service communication (only what each service needs for its own operations), and provides **REST** for clients. A **BFF** (Backend-for-Frontend) aggregates data from services via REST for the UI; services do not call each other solely to enrich or aggregate data for the user.

---

## Table of Contents

- [Overview](#overview)
- [API Policy: REST vs gRPC](#api-policy-rest-vs-grpc)
- [gRPC Data Format Conventions](#grpc-data-format-conventions)
- [Services and CRUD Operations](#services-and-crud-operations)
- [gRPC Contracts by Service](#grpc-contracts-by-service)
- [Basic REST Endpoints by Service](#basic-rest-endpoints-by-service)
- [Service-to-Service Interactions](#service-to-service-interactions)
- [Who calls whom](./WHO_CALLS_WHOM.md) (call matrix)
- [Proto definitions (proto-first)](./proto/README.md) — `./proto/` per-service `.proto` files
- [Checkout and payment flow (intent-driven)](#checkout-and-payment-flow-intent-driven)
- [How services handle business logic](#how-servicimage.pnges-handle-business-logic)
- [Project Structure](#project-structure)

---

## Overview

| Service                | Responsibility                                                                                                                                                                 | CRUD focus                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| 1. Product Catalog     | Products, categories, images, availability; purely informational (no kitchen/order/shipping)                                                                                   | Products, categories, images             |
| 2. Kitchen             | Production Orders (admin-created), phases (preparing, baking, completed), progress; notifies Order                                                                             | Production Orders, phases, images, notes |
| 3. Pricing & Promotion | Prices, discounts, coupons; used on **order page** (not cart) for full price and reductions                                                                                    | Price rules, campaigns, coupons          |
| 4. Shopping Cart       | Temporary carts, items only; add-to-cart is direct; at checkout Cart creates **order intent**                                                                                  | Carts, cart items, notes                 |
| 5. Order               | **Intent-driven**: partial order (intent) from Cart → full order (coupons, delivery) → payment intent                                                                          | Orders, order states, delivery, notes    |
| 6. Payment             | Payment intent (from Order); frontend uses **Stripe** only (e.g. Stripe Elements or Checkout); no stored payment methods; Stripe + webhook; order stays "to be paid" if failed | Payments, config, logs, refunds          |
| 7. Shipping            | Shipping Requests (intent) → Shipments; drivers, vehicles, delivery; notifies Order when done                                                                                  | Shipping Requests, Shipments, drivers    |
| 8. Notification        | Order updates, production alerts, shipping notifications; templates, channels, logs                                                                                            | Templates, logs, rules                   |
| 9. Review & Rating     | Product feedback after order completion; users CRUD reviews, admins moderate                                                                                                   | Reviews, moderation logs                 |
| 10. User Management    | Profiles, contact, **addresses** (delivery + billing); each has unique ID; frontend fetches and shows them; other services reference by **user_id**, **address_id**            | Users, addresses, preferences            |

---

## API Policy: REST vs gRPC

- **REST APIs**
  - Used **only** by frontends and external clients (web, mobile).
  - **The frontend never calls gRPC** — it talks to services exclusively via REST (or each service's HTTP API).
  - **Basic** endpoints listed below are a **recommended minimum**.
  - Each service's developers **may add extra REST APIs** and **may change URL structure, query params, or request/response bodies** to fit their frontend and product needs.
  - REST is **flexible per service** as long as the service still fulfils its gRPC contract when talking to other services.

- **gRPC contracts**
  - **Every** service-to-service communication is done **via gRPC**. Backend services **never** call each other via REST or HTTP; they use gRPC only.
  - Used **only** for **service-to-service** communication (backend to backend).
  - **Frontends do not use gRPC**; they use REST only. A **BFF** (Backend-for-Frontend) may aggregate data from multiple services via REST for the UI.
  - Service-to-service calls are **only for data and logic the service needs for its own operations**. No calls solely to enrich or aggregate data for the user—that is the BFF’s responsibility.
  - **Must be implemented as specified.**
  - **Do not change** message names, field numbers, or RPC signatures without a shared contract update and agreement across consuming services.
  - This keeps integrations between Cart, Order, Pricing, Kitchen, etc. stable and predictable.

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

The Product Catalog Service manages all bakery products offered by BunMart. It stores product names, descriptions, images, categories, and availability flags. Administrators can create new products, update product information, upload or delete images, and remove discontinued products. Users can read and browse product information. **Add-to-cart**: the frontend does **not** call the Cart Service directly when adding a product to the cart; instead, the frontend calls the **Product Catalog** **via REST** (e.g. POST /products/{id}/add-to-cart with user_id, quantity). The Product Catalog then calls the **Cart Service** **via gRPC** `AddCartItem` to add the item to the user's cart and returns the result to the frontend.

- **CREATE**: Products, categories, product images.
- **READ**: Products (by id, list, search), categories, images; users browse product information.
- **UPDATE**: Product details, category assignment, image metadata, availability flags.
- **DELETE**: Products, categories, images; remove discontinued products.

Feeds: Cart, Order, Pricing, Review (product identity and metadata). **Calls**: Cart (AddCartItem **via gRPC** when frontend requests add-to-cart).

---

### 2. Kitchen Service (Production Management)

The Kitchen Service manages all food preparation activities inside the bakery. When an admin triggers **Produce Order** on the frontend, the **Order Service** calls the Kitchen Service **via gRPC** `CreateProductionOrder` with the order_id and items; the Kitchen Service creates a kitchen process intent (production order) and returns the **kitchen process intent id** to the Order Service. The frontend receives this id and redirects the admin to the admin panel Kitchen page for that job. Kitchen staff update preparation phases (preparing, baking, completed), progress percentages, preparation images, and notes via the Kitchen Service (REST). When the admin sets the kitchen job as finished, the Kitchen Service calls the Order Service **via gRPC** `NotifyOrderPrepared` so the order status is set to prepared. This service supports full CRUD on Production Orders, production phases, images, and kitchen notes.

- **CREATE**: Production Orders (created by Order Service **via gRPC** when admin triggers produce; reference user_order_id and lines), production phases, preparation images, kitchen notes.
- **READ**: Production Orders, phases, progress, images, notes.
- **UPDATE**: Production phases (preparing, baking, completed), progress percentages, images, notes (kitchen staff via REST).
- **DELETE**: Production Orders, phases, images, notes (per policy).

Interacts with: **Order** (Order calls Kitchen **via gRPC** CreateProductionOrder when admin triggers produce; Kitchen returns production_order_id; Kitchen notifies Order **via gRPC** NotifyOrderPrepared when production is completed → order status set to prepared).

---

### 3. Pricing & Promotion Service

The Pricing & Promotion Service manages all product pricing rules, discounts, and promotional campaigns. Administrators can create, update, delete, and view price definitions, coupon rules, and campaign schedules. Users only read finalized pricing information. Coupons are applied on the **order page** (not the cart page); the Order Service calls this service to get full price and any reductions based on user-applied coupons and items. This service does not directly participate in order or kitchen workflows; it provides consistent pricing logic when the Order Service builds the full order, supporting full CRUD on pricing and promotion entities.

- **CREATE**: Price rules, discount rules, campaigns, coupons, scheduled promotions.
- **READ**: Current prices, applicable discounts, active campaigns, coupons; users read finalized pricing only.
- **UPDATE**: Prices, discount rules, campaign metadata, coupons, schedules.
- **DELETE**: Price rules, campaigns, coupons, scheduled promotions.

Feeds: **Order** (full price and reductions on order page when user has applied coupons and selected items).

---

### 4. Shopping Cart Service

The Shopping Cart Service manages temporary user carts. **Add-to-cart**: the frontend does **not** call the Cart Service directly; the frontend calls the **Product Catalog** **via REST**, and the Product Catalog calls the **Cart Service** **via gRPC** `AddCartItem` to add the item to the user's cart. When the user goes to **checkout**, the request goes to the Cart Service (frontend calls Cart **via REST**). The Cart Service prepares **order intent details** from the user's selected items (product_id, quantity only) and calls the Order Service with this order intent to create the order. The Cart Service responds to the frontend with the **order intent id**; the frontend then redirects the user to the order page with this intentId. When the order is placed, Order calls **Cart.InvalidateCart** **via gRPC** with **cart_id**, **order_id**, and the **exact product_id list** from the order; Cart removes only those items (user may have selected only a subset of cart items for this order). Coupon setup is on the **order/payment page**, not the cart. Administrators can manage cart policies and optional cart metadata. Full CRUD on cart items and cart notes.

- **CREATE**: Cart, cart items, cart notes.
- **READ**: Cart by user/session, cart items, notes.
- **UPDATE**: Quantities, notes; cart policies and metadata (admin).
- **DELETE**: Cart, cart items, notes.

Interacts with: **Product Catalog** (Cart is called **via gRPC** `AddCartItem` when Product Catalog receives add-to-cart from frontend); **Order** (at checkout Cart calls **Order.CreateOrderIntent** **via gRPC** with user_id and items; Cart returns **order intent id** to frontend; Order calls **Cart.InvalidateCart** **via gRPC** after order is placed with **cart_id**, **order_id**, and **product_ids** so only the ordered items are removed from the cart).

---

### 5. Order Service

The Order Service manages customer orders in an **intent-driven** way. The Cart Service creates a **partial order (order intent)** at checkout — items and quantities only — and returns the **order intent id** to the frontend. The frontend redirects to the order page and calls the Order Service **via REST** (e.g. GET /orders/{intentId}). The frontend fetches the user's **addresses** (delivery and billing) from the **User Management Service** and shows them on the order page; the user can use an existing address or add a new one. When the user proceeds, the frontend calls the Order Service **via REST** with **user_id** and the **address_id** (index into the User Management user's address list). The Order Service then talks with **Pricing & Promotion** to get the full price; the user applies **coupons on the order frontend**. The Order Service builds the order as a **full object**: user-applied coupons, all items with quantities, and the selected address (by **address_id**). Pricing and shipping logic can compute reductions; these details are shown on the frontend. When the user presses **Pay**, the request goes to the Order Service; it updates the order and calls the **Payment Service** with a **payment intent** (total price, order name, metadata, etc.). The Payment Service returns **payment_intent_id**; the Order Service returns this to the frontend and the frontend redirects the user to the payment page. Orders are eligible for production only after successful payment. When the admin triggers **Produce Order**, the frontend calls the Order Service **via REST**; the Order Service creates a kitchen intent and calls the **Kitchen Service** **via gRPC** CreateProductionOrder; Kitchen returns the kitchen process intent id; Order Service updates the order state to **production** and returns the kitchen job/intent id to the frontend (which redirects the admin to the Kitchen page). When the admin sets the kitchen job finished, the **Kitchen Service** calls the Order Service **via gRPC** NotifyOrderPrepared; Order updates state to **prepared**. The admin can then pack the order and update order state to **packed** via REST. When the admin presses **Shipped**, the frontend calls the Order Service **via REST**; the Order Service calls the **Shipping Service** **via gRPC** to create a shipping intent; Shipping returns the shipping intent id; Order Service returns it to the frontend (which redirects to the admin Shipping page). When admin/driver submit shipping details, the **Shipping Service** calls the Order Service **via gRPC** to set the order state to **shipping**. Order states: pending (to be paid), paid, production, prepared, packed, shipping, shipped, completed. Full CRUD is supported on orders, order states, and order notes.

- **CREATE**: Order intent (partial order from Cart), then full order (with coupons, delivery, pricing); order lines, order notes.
- **READ**: Order by id (intentId), list by user, order status, notes, delivery location.
- **UPDATE**: Order with coupons and delivery; order states (including packed via admin); notes.
- **DELETE**: Archive/cancel orders (policy defined by service).

Interacts with: **Cart** (receives order intent at checkout; returns intent id via Cart response; calls Cart.InvalidateCart **via gRPC** after order is placed with **cart_id**, **order_id**, and **product_ids** so only the ordered items are removed from the cart), **User Management** (GetUser, GetUserAddresses, ValidateUser **via gRPC** for shipping/address), **Pricing & Promotion** (CalculateOrderPricing **via gRPC** when building full order—Order stores product_id, quantity, unit_price, line_total; does not call Product Catalog; BFF enriches order for display), **Payment** (CreatePaymentIntent **via gRPC** when user presses Pay; orders eligible for production after success), **Kitchen** (Order calls Kitchen **via gRPC** CreateProductionOrder when admin triggers produce; Kitchen returns production_order_id; Kitchen notifies Order **via gRPC** NotifyOrderPrepared when production is completed), **Shipping** (Order calls Shipping **via gRPC** to create shipping intent when admin presses Shipped; Shipping returns shipping intent id; Shipping notifies Order **via gRPC** to set order state to shipping when admin/driver submit), **Notification** (SendNotification **via gRPC**). Order does **not** call Product Catalog; BFF aggregates product details for order display.

---

### 6. Payment Service

The Payment Service handles payment processing for orders. **Payment methods are not stored** — the Payment Service uses **Stripe only**. The Order Service creates a payment intent **via gRPC** when the user presses Pay; the Payment Service returns **payment_intent_id** and **client_secret** to the frontend. The frontend uses Stripe (e.g. Stripe Elements or Stripe Checkout) so the user enters card details directly with Stripe; no payment method is fetched from or saved in User Management. When the user completes payment, the **Stripe webhook** calls the Payment Service and sets the payment to **failed** or **success**. The payment intent has a **lifetime**; if the user does not complete payment within that time, the payment intent is automatically marked failed. **Even if payment fails, the order stays in a pending state** (e.g. "to be paid"); the user can try to pay again. Orders are only eligible for production after successful payment. Administrators can manage payment configurations, payment logs, and refund metadata. Full CRUD on payment records and config.

- **CREATE**: Payment intent (from Order), payment records, payment configurations.
- **READ**: Payment intent details (for payment page), payment status, payment history, payment logs.
- **UPDATE**: Payment lifecycle (pending → success/failed via Stripe webhook), payment config, refund metadata.
- **DELETE**: Archive old payments (per policy).

Interacts with: **Order** (receives CreatePaymentIntent **via gRPC** from Order; communicates payment result **via gRPC**); **Notification** (SendNotification **via gRPC** for payment confirmations). Does **not** call User Management; payment is handled entirely via Stripe.

---

### 7. Shipping Service

The Shipping Service manages deliveries using an intent-based approach. When the admin presses **Shipped** on the frontend, the **Order Service** calls the Shipping Service **via gRPC** (e.g. CreateShippingIntent or CreateShipment) with order_id, user, address, etc.; the Shipping Service creates a shipping intent and returns the **shipping intent id** to the Order Service, which returns it to the frontend. The frontend redirects the admin to the admin panel Shipping page for that shipping job. The admin (or delivering driver) fills shipping details (driver, vehicle, tracking, etc.) and submits via REST to the Shipping Service. When shipping details are submitted (or shipping job state is updated), the Shipping Service calls the Order Service **via gRPC** (e.g. SetOrderShipping or MarkOrderShipping) so the order state is set to **shipping**. The delivering driver updates the Shipping Service's shipping job state (e.g. out for delivery, delivered) via REST or admin UI. Full CRUD is supported on Shipping Requests, Shipments, drivers, vehicles, and delivery assets.

- **CREATE**: Shipping intents (created by Order Service **via gRPC** when admin presses Shipped; reference order, address, user), Shipments, drivers, vehicles, delivery images.
- **READ**: Shipping Request status, Shipment status, driver/vehicle info, delivery progress, images.
- **UPDATE**: Shipping job details (admin/driver fill and submit via REST), delivery progress, driver/vehicle details.
- **DELETE**: Archive Shipping Requests/Shipments, remove drivers/vehicles (per policy).

Interacts with: **Order** (Order calls Shipping **via gRPC** to create shipping intent when admin presses Shipped; Shipping returns shipping intent id; Shipping calls Order **via gRPC** to set order state to shipping when admin/driver submit); **Notification** (SendNotification **via gRPC** for tracking updates).

---

### 8. Notification Service

The Notification Service manages all system communications, including order updates, production completion alerts, and shipping notifications. Notifications are triggered by order state changes and shipping events. Administrators can manage notification templates, channels, and logs. Users receive read-only notifications. Full CRUD is supported for templates, logs, and notification rules.

- **CREATE**: Notifications (email/SMS/in-app), templates, channels, delivery rules.
- **READ**: Notification logs, templates, rules, delivery status; users read-only.
- **UPDATE**: Templates, rules, channels, retry/status.
- **DELETE**: Old messages, templates, rules.

Called by **via gRPC**: Order, Payment, Shipping, Kitchen, User Management (and others as needed).

---

### 9. Review & Rating Service

The Review & Rating Service allows users to submit feedback on products after order completion. Users can create, update, read, and delete their reviews. Administrators can moderate, flag, and remove inappropriate content. The service supports full CRUD on reviews, moderation logs, and feedback metadata, operating independently from order processing.

- **CREATE**: Reviews, ratings, moderation logs, feedback metadata.
- **READ**: Reviews by product, average rating, moderation logs.
- **UPDATE**: Review content, moderation notes, flags.
- **DELETE**: Reviews, moderation records (per policy).

Interacts with: Product Catalog (product identity).

---

### 10. User Management Service

The User Management Service manages user profiles, contact details, **addresses** (delivery and billing), and preferences. **Payment methods are not stored** — payment is handled by the Payment Service using Stripe only. The frontend fetches **addresses** from User Management and shows them (e.g. on the order page); the user can add new addresses or use existing ones; when proceeding, the frontend sends the **address_id** (into the user's address list) to the Order Service. Other services reference users by user ID (and by address_id when needed). Full CRUD is supported for user profiles, addresses, and preference data.

- **CREATE**: Users, profiles, addresses (delivery, billing), contact info, preferences.
- **READ**: User/profile, addresses, preferences; frontend fetches these to show on order page.
- **UPDATE**: Profile, addresses, preferences.
- **DELETE**: Users, addresses (per policy).

Interacts with: Cart, Order, Shipping, Notification (user identity, addresses; reference by user_id, address_id when needed). Payment Service does **not** call User Management.

---

## gRPC Contracts by Service

**gRPC is for service-to-service communication only.** Every backend-to-backend call is done **via gRPC**; services never call each other via REST or HTTP. The frontend never calls gRPC; it uses REST (or each service's HTTP API) to talk to services. Every service-to-service call is done **via gRPC**; backend services never call each other via REST or HTTP. The contracts below define how backend services call each other via gRPC; each service exposes REST (or equivalent) for the frontend separately.

Each service **must** implement the following gRPC contract exactly for backend callers.

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
| **GetProduct**       | Single product lookup for callers that need product info for their own logic (e.g. server-side slips). BFF uses REST to get product details for UI. |
| **GetProducts**      | Batch product lookup for callers that need product info for their own logic. Not used by Order or Cart for display—BFF aggregates. |
| **ValidateProducts** | Ensure product IDs exist and are active; response is subset that are valid. Used by Cart (add to cart, checkout), Pricing (before pricing), Review (before saving review). |

**Consumers (gRPC)**: Cart (ValidateProducts when Cart adds item or at checkout), Pricing (ValidateProducts), Review (ValidateProducts). Order does not call Product—it stores product_id and quantity and gets pricing from Pricing; BFF enriches order for display. **Product Catalog calls** Cart (AddCartItem **via gRPC** when frontend requests add-to-cart).

---

### 2. Kitchen Service — gRPC contract

**Package**: `bunmart.kitchen.v1`

**Messages:**

```protobuf
message ProductionOrderLine {
  string product_id = 1;
  int32 quantity = 2;
}

message ProductionOrderInfo {
  string production_order_id = 1;
  string user_order_id = 2;   // reference to Order Service order
  repeated ProductionOrderLine lines = 3;
  string phase = 4;           // PREPARING, BAKING, COMPLETED
  int32 progress_percent = 5;
  repeated string preparation_image_urls = 6;
  string notes = 7;
  google.protobuf.Timestamp created_at = 8;
  google.protobuf.Timestamp updated_at = 9;
}

message CreateProductionOrderRequest {
  string user_order_id = 1;
  repeated ProductionOrderLine lines = 2;
}

message CreateProductionOrderResponse {
  string production_order_id = 1;
}

message GetProductionOrderRequest { string production_order_id = 1; }
message GetProductionOrderResponse { ProductionOrderInfo order = 1; }

message UpdateProductionPhaseRequest {
  string production_order_id = 1;
  string phase = 2;           // PREPARING, BAKING, COMPLETED
  int32 progress_percent = 3;
  repeated string preparation_image_urls = 4;
  string notes = 5;
}

message UpdateProductionPhaseResponse { bool updated = 1; }

// Kitchen calls Order when production is completed.
message NotifyOrderPreparedRequest {
  string production_order_id = 1;
  string user_order_id = 2;
}

message NotifyOrderPreparedResponse { bool acknowledged = 1; }
```

**Service:** `KitchenService` — `CreateProductionOrder`, `GetProductionOrder`, `UpdateProductionPhase`, `NotifyOrderPrepared` (Kitchen → Order)

**Message and RPC use cases**

| Message / RPC             | Use case                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ProductionOrderInfo**   | Production order with user_order_id, lines, phase (preparing, baking, completed), progress %.                                                                 |
| **CreateProductionOrder** | **Order Service** calls **via gRPC** when admin triggers Produce Order; accepts user_order_id and lines; returns production_order_id (kitchen job/intent id). |
| **GetProductionOrder**    | Fetch Production Order by id (admin, kitchen staff, Order for status).                                                                                        |
| **UpdateProductionPhase** | Kitchen staff update phase, progress %, preparation images, notes.                                                                                            |
| **NotifyOrderPrepared**   | Kitchen calls Order Service **via gRPC** when production is completed; Order updates order status to prepared.                                                |

**Consumers**: **Order** (receives NotifyOrderPrepared callback). **Callers**: **Order** (CreateProductionOrder when admin triggers produce); Kitchen staff (UpdateProductionPhase via REST).

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

| Message / RPC             | Use case                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PriceInfo**             | Unit price per product; Order uses at checkout for base prices.                                                                                                                                                                                                                                                                         |
| **DiscountInfo**          | Describes discount (product- or cart-level); returned by GetDiscounts.                                                                                                                                                                                                                                                                  |
| **GetPrices**             | Fetch current unit prices for a list of product IDs (Order at checkout).                                                                                                                                                                                                                                                                |
| **GetDiscounts**          | Fetch applicable discounts for products and optional coupon/user.                                                                                                                                                                                                                                                                       |
| **CalculatePrice**        | Compute final price for **one** product and quantity (and optional coupon).                                                                                                                                                                                                                                                             |
| **CalculateOrderPricing** | **Use case:** Order sends **product_id, quantity** per line and **coupon_codes** (user-applied on order page); Pricing returns per-line pricing (unit_price, line_total) and **subtotal, discount_total, total, currency_code**. Order calls this **via gRPC** when building the full order on the order page (UpdateOrderWithDetails). |

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
  // No coupon in cart; coupons are applied on the order/payment page.
  string subtotal = 4;   // optional; display-only
  string discount_total = 5;
  string total = 6;
  string currency_code = 7;
}

message GetCartRequest { string user_id = 1; string session_id = 2; }
message GetCartResponse { CartInfo cart = 1; }

// Product Catalog calls this when frontend requests add-to-cart (frontend does not call Cart directly).
message AddCartItemRequest {
  string user_id = 1;
  string product_id = 2;
  int32 quantity = 3;
  string cart_id = 4;      // optional; if provided, add to this cart; otherwise create or use session cart
  string session_id = 5;   // optional; for anonymous/session-based cart
}
message AddCartItemResponse {
  string cart_id = 1;
  CartInfo cart = 2;       // updated cart after add
}

message GetCartForCheckoutRequest { string user_id = 1; string session_id = 2; }
message GetCartForCheckoutResponse {
  CartInfo cart = 1;
  bool valid = 2;
  repeated string errors = 3;
}

// When order is placed, Order calls Cart with the exact product_id list that was in the order.
// User may select only a subset of cart items for this order; only those items are removed from the cart.
message InvalidateCartRequest {
  string cart_id = 1;
  string order_id = 2;
  repeated string product_ids = 3;   // exact product_ids that were in the order; only these are removed from the cart
}
message InvalidateCartResponse { bool invalidated = 1; }
```

**Service:** `CartService` — `GetCart`, `AddCartItem`, `GetCartForCheckout`, `InvalidateCart`

**Message and RPC use cases**

| Message / RPC          | Use case                                                                                                                                                                                                                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CartItemInfo**       | One line: **product_id, quantity** (and optional display unit_price/line_total). Cart provides **only** this cart data — no coupons, no address, no pricing. Coupons are applied on the order page.                                                                                                |
| **CartInfo**           | Cart data only: items (product_id, quantity). No coupons, no user location or address.                                                                                                                                                                                                             |
| **GetCart**            | **gRPC:** Service-to-service only (if another service needs cart data). Frontend loads cart **via REST** (e.g. GET /carts/{id}); BFF may enrich with product details from Product Catalog.                                                                                                         |
| **AddCartItem**        | **gRPC:** **Product Catalog** calls Cart when the frontend requests add-to-cart. Frontend does **not** call Cart Service directly for adding items — it calls Product Catalog **via REST** (e.g. POST /products/{id}/add-to-cart); Product Catalog then calls **Cart.AddCartItem** **via gRPC** with user_id, product_id, quantity. Cart may call **Product Catalog.ValidateProducts** to ensure product exists, then creates/updates cart and returns cart_id and updated cart. |
| **GetCartForCheckout** | At checkout, frontend calls Cart **via REST**; Cart service then calls **Order.CreateOrderIntent** **via gRPC** (user_id, items only) and returns order intent id to frontend; frontend redirects to order page.                                                                                   |
| **InvalidateCart**     | **gRPC:** Order calls Cart after order is created with **cart_id**, **order_id**, and **product_ids** (the exact product_id list that was in the order). Cart removes only those items from the cart; other cart items remain.                                                                     |

**Consumers**: **Product Catalog** (AddCartItem **via gRPC** when frontend requests add-to-cart); Order (InvalidateCart **via gRPC** after order created). **Cart calls** (via gRPC): **Product Catalog** (ValidateProducts when adding item or at checkout), **User** (ValidateUser), **Order** (CreateOrderIntent), and optionally **Notification** (SendNotification for abandoned cart). Cart responds to frontend with **order intent id** at checkout; frontend redirects to order page with this id.

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

// Cart service calls this at checkout with user_id and items only (no coupons — coupons applied on order page).
// Response order_id is the "order intent id"; frontend redirects to order page and calls GetOrder(order_id).
// Order page: user applies coupons and selects/adds delivery address; Order calls Pricing for full price and builds full order.
message CreateOrderIntentRequest {
  string user_id = 1;   // required; Order uses this to call User Management for shipping address options
  message CartLine {
    string product_id = 1;
    int32 quantity = 2;
  }
  repeated CartLine items = 2;
  string cart_id = 3;   // optional; so Order can call Cart.InvalidateCart after creating the order (with product_ids from this order)
}

message CreateOrderIntentResponse {
  string order_id = 1;   // order intent id; frontend redirects to order page and calls GetOrder(order_id)
}

// Frontend sends coupon_codes and address_id (unique ID of selected address in User Management) from order page; Order calls Pricing and builds full order.
message UpdateOrderWithDetailsRequest {
  string order_id = 1;
  repeated string coupon_codes = 2;   // user-applied coupons on order page
  string address_id = 3;              // unique ID of selected address in User Management (user selects existing or adds new; frontend sends this id)
}

message UpdateOrderWithDetailsResponse { OrderInfo order = 1; }

// When user presses Pay: Order calls Payment.CreatePaymentIntent and returns payment_intent_id to frontend.
message RequestPaymentIntentRequest { string order_id = 1; }
message RequestPaymentIntentResponse {
  string payment_intent_id = 1;   // frontend redirects to payment page with this
}
```

**Service:** `OrderService` — `CreateOrderIntent`, `GetOrder`, `GetOrderStatus`, `UpdateOrderWithDetails`, `RequestPaymentIntent`

**CreateOrderIntent flow (intent-driven)**

- **Cart service** calls Order.CreateOrderIntent at checkout with **user_id**, **items** (product_id, quantity per line), and optional **cart_id**. Cart does **not** send coupon_codes (coupons are applied on the order page). Cart responds to the frontend with **order_id** (order intent id).
- **Order service** creates a **partial order** (intent): stores user_id and items; may call User Management **via gRPC** (GetUserAddresses) for address options; does **not** call Pricing yet (no coupons at this step). Returns **order_id** to Cart; Cart returns this to frontend. If cart_id was provided, Order calls **Cart.InvalidateCart** **via gRPC** with **cart_id**, **order_id**, and **product_ids** (the exact product_id list from the order) so Cart removes only those items; remaining cart items stay (user may have selected only a subset for this order).
- **Frontend** redirects the user to the order page with **intentId** (order_id). Frontend calls the Order Service **via REST** (e.g. GET /orders/{id}) to load the order. Frontend fetches the user's **addresses** (delivery and billing) from **User Management** **via REST** and shows them; the user selects an existing address (by address_id) or adds a new one. Frontend sends **user_id**, **coupon_codes**, and **address_id** (unique ID in User Management's user address list) **via REST** (e.g. PUT /orders/{id}/details); Order Service may call User Management **via gRPC** to get address by address_id, calls **Pricing.CalculateOrderPricing** **via gRPC**, and stores the full order (pricing, coupons, address). Pricing details are shown on the frontend. When the user presses **Pay**, frontend calls the Order Service **via REST**; Order Service calls **Payment.CreatePaymentIntent** **via gRPC** and returns **payment_intent_id** to frontend; frontend redirects to payment page. Orders become eligible for production after successful payment; Kitchen notifies Order when production is completed.

**Message and RPC use cases**

| Message / RPC              | Use case                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OrderLineInfo**          | One order line: product_id, quantity, unit_price, line_total.                                                                                                                                                                                                                                                                                                       |
| **OrderInfo**              | Full order; returned by GetOrder. CreateOrderIntent returns only order_id (intent id).                                                                                                                                                                                                                                                                              |
| **CreateOrderIntent**      | **gRPC:** Cart calls Order with **user_id, items, cart_id** (no coupons). Order creates partial order (intent); returns **order_id** (intent id). Frontend then uses **REST** (e.g. GET /orders/{id}) on the order page. User applies coupons and delivery; frontend uses REST (e.g. PUT /orders/{id}/details); Order calls Pricing via gRPC and builds full order. |
| **GetOrder**               | **gRPC:** Used by other services (e.g. Payment, Shipping, Notification). Frontend fetches order **via REST** (e.g. GET /orders/{id}), not gRPC.                                                                                                                                                                                                                     |
| **GetOrderStatus**         | **gRPC:** Lightweight status check (status and updated_at only); service-to-service only.                                                                                                                                                                                                                                                                           |
| **UpdateOrderWithDetails** | **gRPC:** Used by Order Service internally or by other services. Frontend sends **user_id**, **coupon_codes**, and **address_id** (unique ID in User Management's address list) **via REST**; Order Service may call User Management **via gRPC** to get address by address_id, calls Pricing **via gRPC**, and updates full order.                                 |
| **RequestPaymentIntent**   | Frontend calls Order **via REST** when user presses Pay; Order calls Payment.CreatePaymentIntent **via gRPC**; returns payment_intent_id to frontend for redirect to payment page.                                                                                                                                                                                  |

**Consumers**: **Cart** (calls CreateOrderIntent); Payment; Shipping; Notification. **Order Service also implements** RPCs that other services call: **Kitchen** calls `NotifyOrderPrepared` (when production is completed → order status set to prepared); **Shipping** calls e.g. `SetOrderShipping` or `MarkOrderShipping` (when admin/driver submit shipping details → order status set to shipping).

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
  string order_name = 5;        // optional; display name for payment
  map<string, string> metadata = 6;  // optional; order metadata for Stripe
}

message CreatePaymentIntentResponse {
  string payment_id = 1;       // payment_intent_id; frontend uses this on payment page
  string client_secret = 2;     // for Stripe client-side confirmation
  string status = 3;            // PENDING; Stripe webhook sets success/failed; no stored payment methods
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

**Service:** `PaymentService` — `CreatePaymentIntent`, `GetPaymentIntent` (or GetPaymentDetails), `GetPaymentStatus`, `ConfirmPayment`

**Message and RPC use cases**

| Message / RPC           | Use case                                                                                                                                                                                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CreatePaymentIntent** | Order calls **via gRPC** when user presses Pay; accepts order_id, amount, currency, user_id, order_name, metadata; returns payment_id (payment_intent_id), client_secret, status PENDING. Payment has a **lifetime**; if user does not pay in time, intent auto-fails. Order stays "to be paid" if payment fails; user can retry. |
| **GetPaymentIntent**    | **gRPC:** Service-to-service only. Frontend uses **Stripe** (e.g. Stripe Elements or Checkout) with **client_secret** from CreatePaymentIntent; user enters card details with Stripe. Payment Service does not fetch or store payment methods; Stripe webhook notifies Payment Service of success/failure.                        |
| **GetPaymentStatus**    | Poll or webhook follow-up for payment outcome (PENDING/SUCCEEDED/FAILED). Stripe webhook calls Payment Service to set success/failed.                                                                                                                                                                                             |
| **ConfirmPayment**      | Mark payment as confirmed after successful charge (e.g. after Stripe webhook).                                                                                                                                                                                                                                                    |

**Consumers**: Order (CreatePaymentIntent **via gRPC**); Notification (payment confirmation). Frontend uses **REST** to get payment_intent_id and client_secret, then uses **Stripe** for card entry; Payment Service does not call User Management.

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

| Message / RPC                                 | Use case                                                                                                                                                                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CreateShipment** / **CreateShippingIntent** | Order calls **via gRPC** when admin presses Shipped; accepts order_id, user_id, shipping_address_id, etc.; returns **shipping intent id** to Order (which returns it to frontend for redirect to admin Shipping page). |
| **GetShipmentStatus**                         | Get current shipment status and ETA (frontend, Order, Notification).                                                                                                                                                   |
| **UpdateShipmentStatus**                      | Admin/driver update shipping job state (e.g. fill details and submit); Shipping may call Order **via gRPC** (e.g. SetOrderShipping) to set order state to shipping.                                                    |

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
| **SendNotification** | Send one notification to a user. Caller provides user_id, channel, template_id, template_data; reference_type and reference_id link to order/payment/shipment. Used by Order (order confirm, status), Payment (receipt), Shipping (tracking), User Management (welcome, password reset), Kitchen (optional), Cart (optional: abandoned cart), Review (review published, moderation). |

**Consumers**: Order, Payment, Shipping, User Management, Kitchen (optional), Cart (optional), Review. Notification calls **User** (GetUser) to resolve email/phone for delivery.

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
| **GetReviews**       | Paginated list of reviews for a product. **BFF** calls Review via REST and aggregates with Product Catalog for product page; no service-to-service call from Product Catalog to Review. |
| **GetProductRating** | Aggregate rating for a product (average_rating, total_count). BFF uses for product card or detail page. |

**Consumers (gRPC)**: None—BFF calls Review via REST for product page. **Review calls** (via gRPC): **Product Catalog** (ValidateProducts), **User Management** (ValidateUser), **Notification** (SendNotification), **Order** (optional ValidateOrderDeliveredForUser).

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

| Message / RPC        | Use case                                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GetUser**          | Fetch user profile by id (Order, Notification, Shipping for user/contact; Cart and Review use ValidateUser). Payment does not call User.                                                                                      |
| **GetUserAddresses** | Fetch user's addresses; Frontend fetches **via REST** to show on order page; Order calls **via gRPC** to get address by **address_id** (or uses address_id directly). |
| **ValidateUser**     | Check that user_id exists and is active (Order or Cart before creating order or binding cart).                                                                        |

**Consumers**: Cart (ValidateUser), Order (GetUser, GetUserAddresses, ValidateUser), Notification (GetUser for email/phone), Shipping (GetUser optional), Review (ValidateUser). **Frontend** fetches addresses **via REST** (e.g. GET /users/{id}/addresses). Payment Service does not call User Management.

---

## Basic REST Endpoints by Service

Recommended baseline REST endpoints. Each team may add or change paths/request bodies; the **gRPC contract must remain as defined above**.

| Service                 | CREATE                                                                           | READ                                                                                          | UPDATE                                                                                | DELETE                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Product Catalog**     | `POST /products`, `POST /categories`, `POST /tags`, `POST /products/{id}/images`, `POST /products/{id}/add-to-cart` (frontend calls this to add item; Product Catalog then calls Cart **via gRPC** AddCartItem) | `GET /products`, `GET /products/{id}`, `GET /categories`, `GET /tags`                         | `PUT /products/{id}`, `PUT /categories/{id}`, `PUT /tags/{id}`                        | `DELETE /products/{id}`, `DELETE /categories/{id}`, `DELETE /tags/{id}`                           |
| **Kitchen**             | `POST /production-orders`, `POST /production-orders/{id}/images`                 | `GET /production-orders/{id}`, `GET /production-orders`                                       | `PUT /production-orders/{id}/phase`, `PUT /production-orders/{id}/notes`              | `DELETE /production-orders/{id}`, `DELETE /production-orders/{id}/images/{imageId}`               |
| **Pricing & Promotion** | `POST /prices`, `POST /campaigns`, `POST /discounts`, `POST /coupons`            | `GET /prices`, `GET /prices/product/{id}`, `GET /campaigns`, `GET /discounts`, `GET /coupons` | `PUT /prices/{id}`, `PUT /campaigns/{id}`, `PUT /discounts/{id}`, `PUT /coupons/{id}` | `DELETE /prices/{id}`, `DELETE /campaigns/{id}`, `DELETE /discounts/{id}`, `DELETE /coupons/{id}` |
| **Shopping Cart**       | `POST /carts` (create cart; **add-to-cart is not via Cart** — frontend uses Product Catalog `POST /products/{id}/add-to-cart`, which calls Cart **via gRPC** AddCartItem) | `GET /carts/{id}`, `GET /carts/user/{userId}`                                                 | `PUT /carts/{id}/items/{itemId}`, `PUT /carts/{id}`                                   | `DELETE /carts/{id}`, `DELETE /carts/{id}/items/{itemId}`                                         |
| **Order**               | `POST /orders` (or CreateOrderIntent flow)                                       | `GET /orders/{id}`, `GET /orders/user/{userId}`                                               | `PUT /orders/{id}/status`                                                             | `DELETE /orders/{id}` (or archive)                                                                |
| **Payment**             | `POST /payments` (payment intents created via Order; no stored payment methods)  | `GET /payments/{id}`, `GET /payments/order/{orderId}`                                         | `PUT /payments/{id}/status`                                                           | `DELETE /payments/{id}` (archive)                                                                 |
| **Shipping**            | `POST /shipping-requests`, `POST /shipments`, `POST /drivers`, `POST /vehicles`  | `GET /shipping-requests/{id}`, `GET /shipments/{id}`, `GET /drivers`, `GET /vehicles`         | `PUT /shipping-requests/{id}/approve`, `PUT /shipments/{id}`, `PUT /drivers/{id}`     | `DELETE /shipping-requests/{id}`, `DELETE /shipments/{id}`, `DELETE /drivers/{id}`                |
| **Notification**        | `POST /notifications`, `POST /templates`, `POST /rules`                          | `GET /notifications`, `GET /templates`, `GET /rules`                                          | `PUT /templates/{id}`, `PUT /rules/{id}`                                              | `DELETE /notifications/{id}`, `DELETE /templates/{id}`, `DELETE /rules/{id}`                      |
| **Review & Rating**     | `POST /reviews`, `POST /moderation-logs`                                         | `GET /reviews`, `GET /reviews/product/{productId}`, `GET /moderation-logs`                    | `PUT /reviews/{id}`, `PUT /moderation-logs/{id}`                                      | `DELETE /reviews/{id}`, `DELETE /moderation-logs/{id}`                                            |
| **User Management**     | `POST /users`, `POST /users/{id}/addresses`, `POST /roles`                       | `GET /users/{id}`, `GET /users/{id}/addresses`, `GET /roles`                                  | `PUT /users/{id}`, `PUT /users/{id}/addresses/{addrId}`, `PUT /roles/{id}`            | `DELETE /users/{id}`, `DELETE /users/{id}/addresses/{addrId}`, `DELETE /roles/{id}`               |

---

## Service-to-Service Interactions

**Canonical reference:** [WHO_CALLS_WHOM.md](./WHO_CALLS_WHOM.md) (call matrix and diagram). **Contract source of truth:** [proto/](./proto/) (proto-first; one directory per service).

Who calls whom over **gRPC** (only what each service needs for its own operations; BFF aggregates for UI):

```
User Management  ◄── Order (user, address), Cart (ValidateUser), Notification (GetUser for email/phone), Shipping (GetUser optional), Review (ValidateUser). Payment does not call User Management.
Product Catalog  ◄── Cart (ValidateProducts when adding item or checkout), Pricing (ValidateProducts), Review (ValidateProducts). **Product Catalog → Cart** (AddCartItem **via gRPC** when frontend requests add-to-cart). Order does not call Product—BFF enriches order for display.
Kitchen          ◄── Order (CreateProductionOrder when admin triggers produce); Kitchen → Order (NotifyOrderPrepared when production completed)
Pricing & Promo  ◄── Order only (CalculateOrderPricing when building full order); Pricing → Product (ValidateProducts recommended)
Cart Service     ◄── **Product Catalog** (AddCartItem when frontend requests add-to-cart), **Order** (CreateOrderIntent at checkout; InvalidateCart after order with product_ids). Cart calls Product (ValidateProducts when adding item or checkout), User (ValidateUser), Order (CreateOrderIntent), optionally Notification (abandoned cart).
Order Service    ◄── Cart (CreateOrderIntent), Kitchen (NotifyOrderPrepared), Shipping (SetOrderShipping), Payment (NotifyPaymentResult). Order calls Cart, User, Pricing, Payment, Shipping, Notification—not Product.
Payment          ◄── Order (NotifyPaymentResult after webhook); Notification (payment confirm)
Shipping         ◄── Order; Notification (tracking); User (GetUser optional)
Review & Rating  ◄── No other service calls Review via gRPC for aggregation. BFF calls Review via REST for product page. Review calls Product (ValidateProducts), User (ValidateUser), Notification (SendNotification), Order (optional ValidateOrderDeliveredForUser).
Notification     ◄── Order, Payment, Shipping, User Management, Kitchen (optional), Cart (optional), Review
```

**Summary**

| Caller        | Callee          | gRPC usage                                                                                                                                                   |
| ------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product Catalog | Cart            | **AddCartItem** (when frontend requests add-to-cart; frontend calls Product Catalog REST, Product Catalog calls Cart **via gRPC**)                            |
| Cart          | Product Catalog | ValidateProducts when adding item or at checkout (no GetProduct/GetProducts for display—BFF enriches)                                                         |
| Cart          | User            | ValidateUser                                                                                                                                                  |
| Cart          | Order           | CreateOrderIntent (user_id, items, cart_id); Cart returns order intent id to frontend                                                                       |
| Cart          | Notification    | SendNotification (optional: abandoned cart)                                                                                                                   |
| Order         | Cart            | InvalidateCart (cart_id, order_id, product_ids after order placed)                                                                                           |
| Order         | User            | GetUser, GetUserAddresses, ValidateUser                                                                                                                      |
| Order         | Pricing         | CalculateOrderPricing when building full order (Order does not call Product)                                                                                 |
| Order         | Payment         | CreatePaymentIntent, GetPaymentStatus; Payment may call Order NotifyPaymentResult after webhook                                                             |
| Order         | Shipping        | CreateShipment when admin presses Shipped; Shipping → Order SetOrderShipping                                                                                |
| Order         | Notification    | SendNotification (order confirm, status)                                                                                                                     |
| Kitchen       | Order           | NotifyOrderPrepared when production completed                                                                                                                 |
| Kitchen       | Notification    | SendNotification (optional)                                                                                                                                   |
| Pricing       | Product Catalog | ValidateProducts (recommended)                                                                                                                                 |
| Payment       | Order           | NotifyPaymentResult (recommended after webhook)                                                                                                               |
| Payment       | Notification    | SendNotification (payment confirm)                                                                                                                           |
| Shipping      | Order           | SetOrderShipping when admin/driver submit                                                                                                                     |
| Shipping      | User            | GetUser (optional for driver contact)                                                                                                                          |
| Shipping      | Notification    | SendNotification (tracking)                                                                                                                                   |
| Notification  | User            | GetUser (resolve email/phone for delivery)                                                                                                                    |
| User Mgmt     | Notification    | SendNotification (welcome, password reset, etc.)                                                                                                               |
| Review        | Product Catalog | ValidateProducts before saving review                                                                                                                        |
| Review        | User            | ValidateUser before saving review                                                                                                                             |
| Review        | Notification    | SendNotification (review published, moderation)                                                                                                               |
| Review        | Order           | ValidateOrderDeliveredForUser (optional)                                                                                                                      |

---

## Checkout and payment flow (intent-driven)

Coupon setup happens on the **order/payment page**, not the cart page. The flow is intent-driven:

1. **Add to cart** — When the user adds an item to the cart, the frontend calls the **Product Catalog** **via REST** (e.g. POST /products/{id}/add-to-cart with user_id, quantity). The Product Catalog calls the **Cart Service** **via gRPC** `AddCartItem` to add the item; the frontend does **not** call the Cart Service directly for add-to-cart.

2. **Checkout** — When the user goes to checkout, the request goes to the **Cart Service**. The Cart Service prepares **order intent details** from the user's selected items (product_id, quantity only; no coupons) and calls the **Order Service** with this order intent to create the order. The Cart Service responds to the frontend with the **order intent id**. The frontend redirects the user to the order page with this **intentId**. This intent is a **partial order** (items and quantities only).

3. **Order page** — The frontend calls the Order Service **via REST** with **intentId** (e.g. GET /orders/{id}). The Order Service talks with **Pricing & Promotion** (via gRPC) to get the full price. At this stage, the user applies **coupons on the order frontend** (not in the cart). The Order Service builds the order as a **full object**: user-applied coupons, all items with quantities, and address (frontend sends **address_id** into User Management's address list; Order may call User Management **via gRPC** to resolve). Pricing and Shipping can apply any reduction logic. These pricing details are shown on the frontend. The user's **delivery location** is stored in the Order Service; the user can select an existing address or add a new one.

4. **Pay button** — After the user fills all order details and presses **Pay**, the request goes to the **Order Service**. The Order Service updates the order and calls the **Payment Service** **via gRPC** with a **payment intent** (total price, order name, metadata, etc.). The Payment Service returns **payment_intent_id** and places the payment as **pending**. The Order Service returns this to the frontend; the frontend redirects the user to the **payment page**.

5. **Payment page** — The frontend redirects the user to the payment page with **payment_intent_id** and **client_secret** (from Order/Payment). The frontend uses **Stripe** (e.g. Stripe Elements or Stripe Checkout) so the user enters card details directly with Stripe; no payment methods are stored or fetched from User Management. When the user completes payment, Stripe processes it and the **Stripe webhook** calls the Payment Service and sets the payment to **failed** or **success**. The payment intent has a **lifetime**; if the user does not complete payment within that time, the payment intent is automatically marked failed. **Even if payment fails, the order remains in a pending state** (e.g. "to be paid"); the user can try to pay again.

---

## How services handle business logic

This section describes how the services work together for the main business flows: from adding to cart, through placing and paying for an order, to kitchen production and shipping.

### 1. Adding to cart

| Step | Who              | What happens                                                                                                                                                                                                         |
| ---- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Frontend**        | User selects product and quantity; calls **Product Catalog** **via REST** (e.g. POST /products/{id}/add-to-cart with user_id, quantity). Frontend does **not** call Cart Service directly. |
| 2    | **Product Catalog** | Receives add-to-cart request; calls **Cart Service** **via gRPC** `AddCartItem(user_id, product_id, quantity)`.                                                                          |
| 3    | **Cart Service**    | Optionally calls **Product Catalog** `ValidateProducts` to ensure product exists. Creates or updates cart: stores `user_id`, `product_id`, `quantity` per line. No coupons, no pricing — just items. Returns cart_id and updated cart to Product Catalog. |
| 4    | **Product Catalog** | Returns result (e.g. cart_id, updated cart or success) to frontend.                                                                                                                                                   |
| 5    | **Frontend**        | Shows cart (mini-cart or cart page). User can change quantities, remove items, or go to checkout (change/remove/checkout still go to Cart **via REST** as needed).                                                     |

**Business rule:** Add-to-cart goes through Product Catalog (frontend → Product Catalog REST → Cart **via gRPC** AddCartItem); the cart holds only product references and quantities. Coupons and pricing are handled later on the order page.

---

### 2. Placing an order from the cart

| Step | Who               | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Frontend**      | User clicks "Checkout". Frontend calls **Cart Service** **via REST** (e.g. POST /carts/checkout) with `user_id` and current cart.                                                                                                                                                                                                                                                                                                                                      |
| 2    | **Cart Service**  | Builds order intent payload: `user_id`, list of `(product_id, quantity)`, optional `cart_id`. Calls **Order Service** **via gRPC** `CreateOrderIntent` with this payload (no coupon_codes).                                                                                                                                                                                                                                                                            |
| 3    | **Order Service** | Creates a **partial order (order intent)**: stores `user_id`, items. May call **User Management** **via gRPC** `GetUserAddresses(user_id)`. Does _not_ call Pricing yet (no coupons at this step). Returns **order_id** (intent id) to Cart. If cart_id was provided, calls **Cart.InvalidateCart** **via gRPC** with **cart_id**, **order_id**, and **product_ids** (exact product_id list from the order) so Cart removes only those items; other cart items remain. |
| 4    | **Cart Service**  | Returns **order_id** (order intent id) to frontend.                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 5    | **Frontend**      | Redirects user to **order page** with `order_id` (intentId).                                                                                                                                                                                                                                                                                                                                                                                                           |
| 6    | **Frontend**      | On order page, calls **Order Service** **via REST** (e.g. GET /orders/{order_id}) to load the partial order (items, user). Fetches user's **addresses** from **User Management** **via REST** and shows them (billing/delivery).                                                                                                                                                                                                                                       |
| 7    | **Frontend**      | Fetches user's **addresses** (delivery, billing) from **User Management** **via REST** (e.g. GET /users/{id}/addresses) and shows them. User applies **coupons** and selects **address** by **address_id** (unique ID in User Management) or adds a new one.                                                                                                                                                                                                           |
| 8    | **Frontend**      | Calls **Order Service** **via REST** (e.g. PUT /orders/{order_id}/details) with **user_id**, **coupon_codes**, and **address_id** (unique ID of selected address in User Management).                                                                                                                                                                                                                                                                                  |
| 9    | **Order Service** | May call **User Management** **via gRPC** to get address by **address_id**. Calls **Pricing & Promotion** **via gRPC** `CalculateOrderPricing(user_id, items, coupon_codes)`. Saves full order: items, quantities, coupon_codes, resolved address, subtotal, discount_total, total, currency.                                                                                                                                                                          |
| 10   | **Order Service** | Returns full **OrderInfo** (with pricing) to frontend.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 11   | **Frontend**      | Displays order summary: items, quantities, pricing, delivery address. User can change coupons/address and press **Pay** when ready.                                                                                                                                                                                                                                                                                                                                    |

**Business rule:** The "order" starts as a partial order (intent) created from the cart; it becomes a full order only after the user sets coupons and delivery on the order page and Order recalculates with Pricing. When the order is placed, the cart is invalidated by passing the **exact product_id list** from the order to the Cart Service, so only the items that were in this order are removed from the cart; any other cart items (not selected for this order) remain.

---

### 3. Paying for the order

| Step | Who                 | What happens                                                                                                                                                                                               |
| ---- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Frontend**        | User presses **Pay**. Calls **Order Service** **via REST** (e.g. POST /orders/{order_id}/request-payment) to request a payment intent.                                                                     |
| 2    | **Order Service**   | Ensures order is in a payable state (full order with pricing and delivery). Calls **Payment Service** **via gRPC** `CreatePaymentIntent(order_id, amount, currency_code, user_id, order_name, metadata)`.  |
| 3    | **Payment Service** | Creates payment intent (e.g. with Stripe), stores it as **pending**. Returns **payment_intent_id** (and optionally client_secret) to Order.                                                                |
| 4    | **Order Service**   | Returns **payment_intent_id** and **client_secret** to frontend (order remains e.g. "pending" or "to be paid" until payment completes).                                                                    |
| 5    | **Frontend**        | Redirects user to **payment page** with `payment_intent_id` and `client_secret` (for Stripe).                                                                                                              |
| 6    | **Frontend**        | On payment page, shows Stripe UI (e.g. Stripe Elements or Checkout) using **client_secret** from payment intent. User enters card details directly with Stripe; no stored payment methods.                 |
| 7    | **User**            | Completes payment (enters card details in Stripe). Frontend submits to Stripe; Stripe processes the payment.                                                                                               |
| 8    | **Payment Service** | **Stripe webhook** calls Payment Service with payment result; Payment Service sets payment to **success** or **failed**. Optionally notifies Order **via gRPC** (or Order polls GetPaymentStatus).         |
| 9    | **Order Service**   | When payment is successful: updates order status to **paid**. May trigger **Notification Service** (order confirmation). Order is now eligible for production.                                             |
| 10   | **Payment Service** | If payment intent **expires** (user did not pay in time), intent is marked failed. Order stays in "to be paid"; user can start payment again (new payment intent). if there was a payment, it is refunded. |

**Business rule:** Payment is a separate step after the full order is confirmed. Order stays pending until payment succeeds; only then does the order become "paid" and eligible for kitchen production.

---

### 4. Kitchen (production) intent

| Step | Who                    | What happens                                                                                                                                                                            |
| ---- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **Admin**              | Sees **paid** orders in admin UI. Clicks **Produce Order** on the frontend.                                                                                                             |
| 2    | **Frontend**           | Sends request to **Order Service** **via REST** (e.g. POST /orders/{order_id}/produce or equivalent) to trigger production for that order.                                              |
| 3    | **Order Service**      | Builds kitchen intent (order_id, items/quantities). Calls **Kitchen Service** **via gRPC** `CreateProductionOrder(user_order_id, lines)` to create the kitchen job/intent.              |
| 4    | **Kitchen Service**    | Creates the kitchen process intent (production order). Returns **kitchen process intent id** (production_order_id) to Order Service.                                                    |
| 5    | **Order Service**      | Updates order state to **production**. Returns **kitchen job/intent id** to the frontend.                                                                                               |
| 6    | **Frontend**           | Receives kitchen job id; redirects admin to the **admin panel → Kitchen page** for that job so admin/kitchen staff can update progress.                                                 |
| 7    | **Kitchen staff**      | On the admin Kitchen page, update **kitchen job percentage** (phases, progress %, preparation images, notes) **via REST** to Kitchen Service (e.g. PUT /production-orders/{id}/phase).  |
| 8    | **Admin**              | When preparation is done, sets **kitchen job finished** on the frontend (e.g. mark production order as completed).                                                                      |
| 9    | **Frontend / Kitchen** | Kitchen Service (or frontend calling Kitchen then Order) triggers **Kitchen Service** to call **Order Service** **via gRPC** `NotifyOrderPrepared(production_order_id, user_order_id)`. |
| 10   | **Order Service**      | Updates order state to **prepared**. May trigger **Notification Service** (e.g. "Your order is ready for packing").                                                                     |
| 11   | **Admin**              | Packs the order and updates order state to **packed** **via REST** to Order Service (e.g. PUT /orders/{order_id}/status with status=packed).                                            |

**Business rule:** Production is triggered by the admin from the frontend. The Order Service creates the kitchen intent by calling the Kitchen Service via gRPC; the Kitchen Service returns the kitchen job id so the frontend can redirect the admin to the Kitchen page. Kitchen staff set preparing percentages; when the admin marks the kitchen job finished, the Kitchen Service notifies the Order Service so the order moves to "prepared". The admin then packs and sets the order to "packed".

---

### 5. Shipping intent and delivery

| Step | Who                   | What happens                                                                                                                                                                                                                                     |
| ---- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | **Admin**             | For an order in **packed** (or "ready for shipping"), presses **Shipped** button on the frontend.                                                                                                                                                |
| 2    | **Frontend**          | Calls **Order Service** **via REST** (e.g. POST /orders/{order_id}/request-shipping or equivalent) to request a shipping intent.                                                                                                                 |
| 3    | **Order Service**     | Calls **Shipping Service** **via gRPC** (e.g. CreateShippingIntent or CreateShipment) with order_id, user, address, etc. to create a shipping intent.                                                                                            |
| 4    | **Shipping Service**  | Creates the shipping intent (request/shipment record). Returns **shipping intent id** to Order Service.                                                                                                                                          |
| 5    | **Order Service**     | Returns **shipping intent id** to the frontend.                                                                                                                                                                                                  |
| 6    | **Frontend**          | Redirects admin to the **admin panel → Shipping page** for that shipping job so admin/driver can fill and submit shipping details.                                                                                                               |
| 7    | **Admin / Driver**    | On the admin Shipping page, **fills shipping details** (driver, vehicle, tracking, etc.) and **submits** **via REST** to Shipping Service (e.g. PUT /shipments/{id} or submit shipping job).                                                     |
| 8    | **Shipping Service**  | When shipping details are submitted (or shipping job state is updated), calls **Order Service** **via gRPC** (e.g. SetOrderShipping or MarkOrderShipping) with order_id so Order updates state to **shipping**.                                  |
| 9    | **Order Service**     | Updates order state to **shipping**. May trigger **Notification Service** (e.g. "Your order is on the way").                                                                                                                                     |
| 10   | **Delivering driver** | Updates the **Shipping Service's shipping job state** (e.g. out for delivery, delivered) **via REST** or admin UI. When delivery is completed, Shipping Service may call Order Service **via gRPC** to set order to **shipped** / **completed**. |
| 11   | **User**              | Can leave a **review** for products (Review & Rating Service) after order completion.                                                                                                                                                            |

**Business rule:** Shipping is triggered by the admin pressing "Shipped"; the Order Service calls the Shipping Service via gRPC to create a shipping intent and returns the shipping intent id to the frontend. The frontend redirects the admin to the Shipping page where admin/driver fill details and submit; the Shipping Service then notifies the Order Service via gRPC to set the order state to "shipping". The delivering driver updates the shipping job state in the Shipping Service.

---

### 6. End-to-end order states (summary)

| State                    | Meaning                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Pending / To be paid** | Order intent or full order created; payment not yet completed (or payment failed/expired). User can retry payment.                                                 |
| **Paid**                 | Payment successful. Admin can trigger **Produce Order**; Order Service creates kitchen intent via Kitchen Service.                                                 |
| **Production**           | Admin triggered produce; Order Service created kitchen intent and updated order to this state. Kitchen staff update preparation %.                                 |
| **Prepared**             | Admin set kitchen job finished; Kitchen Service called Order Service via gRPC; order status set to prepared.                                                       |
| **Packed**               | Admin packed the order and updated order state to packed (via Order Service REST).                                                                                 |
| **Shipping**             | Admin pressed Shipped; Order Service created shipping intent; admin/driver submitted shipping details; Shipping Service notified Order via gRPC to set this state. |
| **Shipped / Completed**  | Delivering driver updated shipping job state (e.g. delivered); Order may move to shipped then completed. User can submit reviews.                                  |

---

## Project Structure

```
backend/
├── README.md                 # This file
├── base/                     # Shared template (optional)
├── cartService/
├── productCatalogService/    # to be added
├── kitchenService/
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

**Reminder**: Frontends use **REST** only and never call gRPC. **Every** service-to-service communication is done **via gRPC**; backend services never call each other via REST or HTTP. gRPC contracts are shared and must be followed as-is for reliable backend-to-backend communication. REST is owned by each team.

# Example Flow:
# Product catelog -> add to cart -> product service (add to cart productId) -> cart Service (gRPC addToCart(productId, userID))

# Frontend (Cart Page) -> Frontend (placerOrderButton) -> Frontend (REST cart Service) -> Cart Service (Create OrderIntent)
# Cart Service (gRPC Order Service) -> Order Service (create partial order) -> Order Service (return orderId) -> Cart Service (catch order Id)
# Cart Service (REST return orderId) -> Frontend (redirect user /order/orderId)

# Frontend (Order Page) -> Frontend (REST /api/user/shipping-addresses) -> Frontend (display shipping addresses) -> User (select shipping address) -> Frontend (REST /api/user/billing-addresses) -> Frontend (display billing addresses) -> User (select billing address) -> Frontend (REST /api/user/addresses) -> User (create address) -> Frontend (REST /api/user/addresses) -> User (update address) -> Frontend (REST /api/user/addresses) -> User (delete address) -> Frontend (REST /api/user/addresses) -> User (get addresses)
# Frontend (Order Page) -> Frontend (Checkout Button) -> Order Service (REST api/checkout) -> Order Service (full fill order)
# Order Service (gRPC Payment and Promotion Service) -> Pricing and Promotion Service (calculate totalPrice, discounts, taxes) -> Pricing and Promotion Service (return totalPrice, discounts, taxes) -> Order Service (return order)

# Order Service (create PaymentIntent) -> Payment Service (paymentIntent) -> Payment Service (partial payment job) -> Stripe (payment url) -> Return (Order Service)
# Order Service (Return REST payment url) -> User ( Redirect to stripe )

# Stripe (frontend /payment/paymentId) -> Frontend (success/failure payment)
