# BunMart Backend — Project Analysis

This document provides a central analysis of the BunMart microservice-based backend for discussion and onboarding.

---

## 1. High-Level Architecture

| Aspect | Description |
|--------|-------------|
| **Style** | Microservices (10 domain services + API Gateway + shared proto) |
| **Inter-service** | gRPC only (no REST between services) |
| **Client-facing** | REST only (frontend/BFF never call gRPC) |
| **Data** | One database (or schema) per service; shared proto contracts |

---

## 2. The 10 Microservices

| # | Service | Backend folder | Responsibility | Current DB (as configured) |
|---|---------|----------------|----------------|-----------------------------|
| 1 | **Product Catalog** | `productService/` | Products, categories, images; add-to-cart triggers Cart via gRPC | (minimal config) |
| 2 | **Kitchen** | `kitchenService/` | Production orders, phases (preparing/baking/completed), NotifyOrderPrepared → Order | PostgreSQL (`kitchenDB`, port 5432) |
| 3 | **Pricing & Promotion** | `pricingService/` | Prices, discounts, coupons; Order calls for CalculateOrderPricing | SQL Server (bunmart_pricing, 1433) |
| 4 | **Shopping Cart** | `cartService/` | Carts, items; checkout → CreateOrderIntent (Order); Order calls InvalidateCart | PostgreSQL (`bunmart`, port 5432) |
| 5 | **Order** | `orderManagementService/` | Intent-driven orders: intent from Cart → full order → payment intent → kitchen/shipping | (minimal config) |
| 6 | **Payment** | `paymentService/` | Payment intents (Stripe), webhooks; NotifyPaymentResult → Order | SQL Server (bunmart_payment, 1433) |
| 7 | **Shipping** | `shippingService/` | Shipments, drivers; CreateShipment from Order; SetOrderShipping → Order | MySQL (config placeholder) |
| 8 | **Notification** | (folder TBD) | Templates, channels; SendNotification; calls User for email/phone | (not yet in backend dirs) |
| 9 | **Review & Rating** | `reviewService/` | Reviews, ratings, moderation; ValidateProducts, ValidateUser | (minimal config) |
| 10 | **User / Auth** | `userAuthentication/` | Sign up, sign in, JWT, profile, addresses (all in one service) | (minimal config) |

**Additional backend components:**

- **api-gateway/** — Entry point / routing (no DB).
- **base/** — Shared template/config.
- **proto/** — Shared Protocol Buffer definitions (source of truth for gRPC).
- **mock/** — Mock/test support.

---

## 3. Database Usage Today

- **PostgreSQL**: Cart (single DB `bunmart`), Kitchen (single DB `kitchenDB`). Both use port 5432 (conflict if run together without separate instances).
- **SQL Server**: Pricing (`bunmart_pricing`), Payment (`bunmart_payment`) on port 1433.
- **MySQL**: Shipping has connector and placeholder config; no full URL yet.
- **Others**: Order, Product, Review, User have minimal or no datasource configuration.

**Recommendation:** A central Docker Compose can provide **10 PostgreSQL Alpine instances** (one per service) so every service can use PostgreSQL with isolated databases, simplifying ops and local dev. Services currently on SQL Server/MySQL can be migrated to Postgres when desired.

**Central Compose — DB → port mapping (all use user `bunmart` / password `bunmart_pass`):**

| Service         | Host port | Database name      | JDBC URL (when using central compose) |
|-----------------|-----------|--------------------|----------------------------------------|
| Product Catalog | 5432      | bunmart_product    | `jdbc:postgresql://localhost:5432/bunmart_product` |
| Kitchen         | 5433      | kitchenDB          | `jdbc:postgresql://localhost:5433/kitchenDB` |
| Pricing         | 5434      | bunmart_pricing    | `jdbc:postgresql://localhost:5434/bunmart_pricing` |
| Cart            | 5435      | bunmart            | `jdbc:postgresql://localhost:5435/bunmart` |
| Order           | 5436      | bunmart_order      | `jdbc:postgresql://localhost:5436/bunmart_order` |
| Payment         | 5437      | bunmart_payment    | `jdbc:postgresql://localhost:5437/bunmart_payment` |
| Shipping        | 5438      | bunmart_shipping   | `jdbc:postgresql://localhost:5438/bunmart_shipping` |
| Notification    | 5439      | bunmart_notification | `jdbc:postgresql://localhost:5439/bunmart_notification` |
| Review          | 5440      | bunmart_review     | `jdbc:postgresql://localhost:5440/bunmart_review` |
| User / Auth       | 5442      | bunmart_auth       | `jdbc:postgresql://localhost:5442/bunmart_auth` |

---

## 4. Service-to-Service Call Summary

- **Product Catalog** → Cart: `AddCartItem` (when frontend adds to cart).
- **Cart** → Product Catalog: `ValidateProducts`; User: `ValidateUser`; Order: `CreateOrderIntent`; Notification: optional.
- **Order** → Cart: `InvalidateCart`; User: `GetUser`, `GetUserAddresses`, `ValidateUser`; Pricing: `GetPrices`, `GetDiscounts`, `CalculateOrderPricing`; Payment: `CreatePaymentIntent`, `GetPaymentStatus`; Shipping: `CreateShipment`; Notification: `SendNotification`.
- **Kitchen** → Order: `NotifyOrderPrepared`; Notification: optional.
- **Pricing** → Product Catalog: `ValidateProducts` (recommended).
- **Payment** → Order: `NotifyPaymentResult`; Notification: `SendNotification`.
- **Shipping** → Order: `SetOrderShipping`; User: `GetUser` (optional); Notification: `SendNotification`.
- **Notification** → User: `GetUser` (for email/phone).
- **User / Auth** → Notification: `SendNotification`.
- **Review** → Product Catalog: `ValidateProducts`; User: `ValidateUser`; Notification: `SendNotification`; Order: optional (e.g. ValidateOrderDeliveredForUser).

Full matrix: see [WHO_CALLS_WHOM.md](./WHO_CALLS_WHOM.md).

---

## 5. Key Flows

1. **Add to cart:** Frontend → Product Catalog (REST) → Cart (gRPC AddCartItem). Cart validates product and user via gRPC.
2. **Checkout:** Frontend → Cart (REST) → Order (gRPC CreateOrderIntent). Cart returns order intent id; frontend goes to order page.
3. **Order page:** Order uses User (addresses), Pricing (CalculateOrderPricing), then Payment (CreatePaymentIntent). Stripe webhook → Payment → Order (NotifyPaymentResult).
4. **Production:** Admin → Order (REST) → Kitchen (gRPC CreateProductionOrder). Kitchen → Order (NotifyOrderPrepared) when done.
5. **Shipping:** Admin → Order (REST) → Shipping (gRPC CreateShipment). Shipping → Order (SetOrderShipping) when details submitted.

---

## 6. Project Layout (backend)

```
backend/
├── README.md
├── WHO_CALLS_WHOM.md
├── PROJECT_ANALYSIS.md          # this file
├── docker-compose.yaml          # central 10× PostgreSQL Alpine
├── proto/                       # shared gRPC contracts
├── api-gateway/
├── base/
├── cartService/
├── productService/              # Product Catalog
├── kitchenService/
├── pricingService/
├── orderManagementService/      # Order
├── paymentService/
├── shippingService/
├── reviewService/
├── userAuthentication/     # Auth + profile, addresses (merged)
└── mock/
```

Notification service directory is not yet present; proto defines `bunmart.notification.v1`.

---

## 7. Proto Packages (reference)

| Service         | Proto package             | Service name            |
|----------------|---------------------------|-------------------------|
| Product Catalog| `bunmart.product.v1`      | ProductCatalogService   |
| Kitchen        | `bunmart.kitchen.v1`      | KitchenService          |
| Pricing        | `bunmart.pricing.v1`      | PricingService          |
| Cart           | `bunmart.cart.v1`         | CartService             |
| Order          | `bunmart.order.v1`        | OrderService            |
| Payment        | `bunmart.payment.v1`      | PaymentService          |
| Shipping       | `bunmart.shipping.v1`     | ShippingService         |
| Notification   | `bunmart.notification.v1` | NotificationService     |
| Review         | `bunmart.review.v1`       | ReviewService           |
| User           | `bunmart.user.v1`         | UserService             |

---

## 8. Discussion Topics

- **DB consolidation:** Move Pricing, Payment, Shipping to PostgreSQL using the 10-instance compose; align connection strings and drivers.
- **Ports:** Each of the 10 Postgres instances uses a distinct port (5432–5440 for product through review, 5442 for auth) so all can run simultaneously.
- **Notification service:** Add `notificationService/` and point it to `db-notification` in the central compose.
- **Order/Product/Review/User:** Wire each to its dedicated Postgres instance and add `application.properties` (or profile-specific) with the correct JDBC URL.
- **API Gateway / BFF:** Clarify whether api-gateway acts as BFF (aggregating REST from services) and how it discovers service URLs.
- **gRPC ports:** Document and standardize gRPC server ports per service (e.g. Cart 9090, Kitchen 9092, Order 9091/9080) to avoid conflicts.

This analysis should be updated as services and configs change.
