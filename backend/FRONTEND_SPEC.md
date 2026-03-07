# BunMart Frontend Specification

This document describes how the frontend should look and what pages are needed, based on the existing backend microservices and APIs.

---

## 1. Backend Overview

The backend consists of multiple services. The frontend will call them either **via an API Gateway** (single origin) or **directly** by service. Each service exposes REST APIs under `/api/v1/...`.

| Service               | Default Port | Purpose                                      |
|-----------------------|-------------|----------------------------------------------|
| userAuthentication    | 6001        | Sign up, sign in, JWT, profile, addresses   |
| productService        | 6003        | Products, categories, product images        |
| orderManagementService| 6005        | Orders (create, list, status, cancel)       |
| cartService           | 6004        | Cart (get, add/update/remove items)         |
| pricingService        | 6007        | Price calculation, coupons, discounts       |
| paymentService        | 6006        | Payments (Stripe), checkout URL             |
| shippingService       | 6011        | Shipping packages, drivers                  |
| kitchenService        | 6008        | Kitchen orders (preparation flow)           |
| reviewService         | 6010        | Product reviews and ratings                 |
| notificationService   | 6009        | Notifications, templates                    |

**Authentication and profile:** All auth and user profile flows use **userAuthentication** (port 6001, gateway prefixes `/auth` and `/user`). Sign in returns a **JWT** and **userId**; the frontend must send the token in the `Authorization: Bearer <token>` header for protected endpoints. Profile is loaded via `GET /user/profile?userId=...` (no token required when userId is sent).

---

## 2. Pages and Screens Required

### 2.1 Public (unauthenticated)

| Page            | Route (suggestion) | Purpose |
|-----------------|--------------------|---------|
| **Home**        | `/`                | Landing: featured products, categories, promotions. |
| **Catalog**     | `/products`        | Browse products (list/grid), filter by category, search. |
| **Product detail** | `/products/:id` | Single product: name, description, image, price (from pricing), reviews, “Add to cart”. |
| **Categories**  | `/categories`      | List categories; optional category management (admin). |
| **Sign in**     | `/signin`          | Email + password → JWT; redirect to cart/checkout or home. |
| **Sign up**     | `/signup`          | First name, last name, email, password, phone → register and get JWT. |
| **Reviews (by product)** | (part of product page) | Show reviews for product; link to “Write review” if logged in. |

### 2.2 Customer (authenticated)

| Page            | Route (suggestion) | Purpose |
|-----------------|--------------------|---------|
| **Cart**        | `/cart`            | Cart contents (productId, quantity, price). Update quantity, remove item, clear cart. Proceed to checkout. |
| **Checkout**    | `/checkout`        | Shipping address (select from saved or enter), order summary. Call pricing to get totals, then create order and optionally create payment for Stripe. |
| **Order confirmation** | `/orders/:id/confirm` | After payment/order creation: order ID, status, totals, “Track order” link. |
| **My orders**   | `/orders`          | List orders for current user; filters by status. Click to order detail. |
| **Order detail**| `/orders/:id`      | Single order: status, items, totals, shipping, payment, cancel (if allowed). |
| **Profile**     | `/profile`         | View/edit name, email, phone; change password if API supports. |
| **Addresses**   | `/profile/addresses` | List saved addresses; add/edit/delete (DELIVERY, BILLING). |
| **Notifications** | `/notifications`  | List notifications for user; mark read / delete. |
| **Write review**| `/products/:id/review` | Form: rating, comment; submit to review service. |

### 2.3 Admin / Staff (role-based)

| Page               | Route (suggestion)     | Purpose |
|--------------------|--------------------------|---------|
| **Admin dashboard**| `/admin`                 | Overview: orders, revenue, low stock (if applicable). |
| **Products (admin)** | `/admin/products`     | CRUD products; upload product image. |
| **Categories (admin)** | `/admin/categories`  | Add/delete categories. |
| **Orders (admin)** | `/admin/orders`         | List all orders; filter by status; update status, set shipment/payment IDs. |
| **Pricing (admin)** | `/admin/pricing`       | Coupons and discounts CRUD. |
| **Shipping (admin)** | `/admin/shipping`     | Shipping packages (by order), drivers CRUD. |
| **Kitchen**        | `/admin/kitchen`        | Kitchen orders: list, update status/line progress. |
| **Notifications (admin)** | `/admin/notifications` | Send notification; manage templates. |
| **Users (admin)**  | `/admin/users`          | Optional: list users (user APIs are on userAuthentication). |

---

## 3. API Summary for Frontend

Base URL assumption: either gateway (e.g. `https://api.bunmart.com`) or per-service (e.g. `http://localhost:8091`). All requests that require auth need header: `Authorization: Bearer <token>`.

### 3.1 Authentication and profile (userAuthentication – 6001, gateway /auth and /user)

- `POST /auth/signup` (gateway: `/auth/signup`)  
  Body: `{ "firstName", "lastName", "email", "password", "phone" }`  
  Response: `{ "token", "userId", "firstName", "lastName", "email", "role", "message" }`

- `POST /auth/signin` (gateway: `/auth/signin`)  
  Body: `{ "email", "password" }`  
  Response: same as signup (store `token` and `userId`).

- `POST /auth/logout`  
  No body; client clears token.

- `GET /user/profile?userId={id}`  
  Response: user profile DTO (firstName, lastName, email, phone, role, addresses). No JWT required when `userId` is present.

- `PUT /user/profile`  
  Body: profile fields to update. Requires JWT.

- `POST /user/addresses`  
  Body: address (type, street, city, state, postalCode, country). Requires JWT.

- `GET /user/addresses`  
  Response: list of addresses. Requires JWT.

- `PUT /api/v1/users/addresses/:id`  
- `DELETE /api/v1/users/addresses/:id`

### 3.2 Products & Categories (productService – 8081)

- `GET /api/v1/products`  
  Query: optional categoryId, search, etc.  
  Response: list of `{ id, name, description, tags, weight, availability, categoryId, hasImage }`.

- `GET /api/v1/products/:productId`  
  Response: product DTO.

- `GET /api/v1/products/:productId/image`  
  Response: image (binary or URL).

- `GET /api/v1/categories`  
  Response: list of categories.

(Admin: POST/PUT/DELETE products, POST/DELETE categories.)

### 3.3 Pricing (pricingService – 8088)

- `POST /api/v1/pricing/calculate`  
  Body: order/cart summary (product IDs, quantities, coupon, etc.).  
  Response: calculated subtotal, discount, shipping, total.

- `POST /api/v1/pricing/product-prices`  
  Body: product IDs.  
  Response: list of product price info.

Use for: product page price, cart totals, checkout summary.

### 3.4 Cart (cartService – 8060)

- `GET /api/v1/cart/?userId=<userId>`  
  Response: cart with items (productId, quantity, etc.).

- `POST /api/v1/cart/items?userId=<userId>`  
  Body: `{ "productId", "quantity" }`.

- `PATCH /api/v1/cart/items/:productId?userId=<userId>`  
  Body: `{ "quantity" }`.

- `DELETE /api/v1/cart/items/:productId?userId=<userId>`  
- `DELETE /api/v1/cart/items?userId=<userId>` (clear cart).

Use logged-in user’s ID as `userId`.

### 3.5 Orders (orderManagementService – 8083)

- `POST /api/v1/orders`  
  Body: `{ "userId", "shippingAddress", "products": [{ "productId", "quantity" }], "subtotal", "discountTotal", "shippingTotal", "total", "currencyCode" }`.

- `GET /api/v1/orders/user/:userId`  
  Response: list of orders.

- `GET /api/v1/orders/:id`  
  Response: order (id, status, products, totals, shippingAddress, shipmentId, paymentId, createdAt, updatedAt).

- `POST /api/v1/orders/:id/cancel`  
  Allowed only in certain statuses (e.g. PENDING, AWAIT_PAYMENT, PAID, CONFIRMED).

- `PUT /api/v1/orders/:id/status`  
  Body: `{ "status" }` (admin).

Order statuses (for UI labels and filters):  
`PENDING`, `AWAIT_PAYMENT`, `PAID`, `CONFIRMED`, `IN_PROGRESS`, `PREPARED`, `SHIPPED`, `DELIVERED`, `CANCELLED`.

### 3.6 Payments (paymentService – 8084)

- `POST /api/v1/payments`  
  Body: e.g. orderId, amount, currency.  
  Response: payment record including ID.

- `GET /api/v1/payments/:paymentId/checkout-url`  
  Response: Stripe checkout URL; redirect user to this URL.

- `GET /api/v1/payments/order/:orderId`  
  Response: payment for order (for confirmation page).

Flow: create order → create payment → get checkout URL → redirect → after return, show order confirmation.

### 3.7 Reviews (reviewService – 8089)

- `GET /api/v1/reviews/product/:productId`  
  Response: list of reviews for product.

- `POST /api/v1/reviews`  
  Body: productId, rating, comment (and userId if required).  
  Response: created review.

- `PUT /api/v1/reviews/:id`  
- `DELETE /api/v1/reviews/:id`  
  (Optional: edit/delete own review.)

### 3.8 Notifications (notificationService – 8060)

- `GET /api/v1/notifications/user/:userId`  
  Response: list of notifications.

- `DELETE /api/v1/notifications/:id`  
  (Mark as read / delete.)

### 3.9 Shipping (shippingService – 8087) – admin / order detail

- `GET /api/v1/shipping/shipping-packages/by-order/:orderId`  
  Response: shipping packages for order (tracking, status).

Use on order detail / tracking page.

### 3.10 Kitchen (kitchenService – 8085) – admin / staff

- `GET /api/v1/kitchen-orders`  
- `GET /api/v1/kitchen-orders/order/:orderId`  
- `PUT /api/v1/kitchen-orders/:id/status`  
  Body: `{ "status" }`.  
- Line-level progress/status updates as per API.

---

## 4. Suggested Frontend Structure

### 4.1 Routes

- **Public:** `/`, `/products`, `/products/:id`, `/categories`, `/signin`, `/signup`.
- **Customer:** `/cart`, `/checkout`, `/orders`, `/orders/:id`, `/orders/:id/confirm`, `/profile`, `/profile/addresses`, `/notifications`, `/products/:id/review`.
- **Admin:** `/admin`, `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/pricing`, `/admin/shipping`, `/admin/kitchen`, `/admin/notifications`, `/admin/users` (if needed).

Use a router guard: if no JWT and route is customer/admin, redirect to `/signin`. If JWT present and role is not admin but route is under `/admin`, redirect to `/` or `/orders`.

### 4.2 Auth Flow

1. **Sign up / Sign in:** Call auth API; store `token` (e.g. memory + localStorage or httpOnly cookie if backend supports). Store `userId`, `email`, `role`.
2. **Every API request:** Add `Authorization: Bearer <token>`.
3. **Logout:** Call `POST /api/v1/auth/logout` and clear token and user state.
4. **401 response:** Clear token and redirect to `/signin`.

### 4.3 Key User Flows

- **Browse → Cart:** Home/Catalog → Product detail (with price from pricing service) → Add to cart (cart service with `userId`) → Cart page.
- **Checkout:** Cart → Checkout (select/enter address, show totals from pricing) → Create order (order service) → Create payment (payment service) → Redirect to Stripe → Return to Order confirmation (`/orders/:id/confirm`).
- **My orders:** Orders list (by `userId`) → Order detail → Optional “Track” (shipping packages) and “Cancel” (if status allows).

### 4.4 UI Components to Build

- Layout: header (logo, nav, cart icon + count, user menu / Sign in).
- Product card (image, name, price, “Add to cart”).
- Product detail: image, description, price, reviews list, add to cart, quantity.
- Cart: line items, quantity controls, remove, clear, total, “Proceed to checkout”.
- Checkout: address selector/form, order summary, “Pay” button → redirect to Stripe.
- Order list and order detail (status badge, items, totals, shipping, cancel button).
- Profile form and address list (add/edit/delete).
- Notifications list.
- Admin: data tables for products, categories, orders, coupons, discounts, shipping, kitchen orders; forms for create/edit; status dropdowns and filters.

---

## 5. Summary Table: Pages vs Backend

| Frontend page / feature   | Backend service(s) used                    |
|---------------------------|--------------------------------------------|
| Sign in / Sign up / Profile / Addresses | userAuthentication (6001, gateway /auth and /user) |
| Home / Catalog / Product detail | productService (6003), pricingService (6007) |
| Cart                      | cartService (6004)                         |
| Checkout                  | pricingService (6007), orderManagementService (6005), paymentService (6006) |
| My orders / Order detail  | orderManagementService (6005), shippingService (6011) |
| Reviews                   | reviewService (6010)                       |
| Notifications             | notificationService (6009)                 |
| Admin products/categories | productService (6003)                      |
| Admin orders              | orderManagementService (6005)              |
| Admin pricing             | pricingService (6007)                      |
| Admin shipping / kitchen  | shippingService (6011), kitchenService (6008) |
| Admin notifications       | notificationService (6009)                  |

This specification gives the frontend team a clear list of pages, routes, APIs, and flows aligned with the BunMart backend.
