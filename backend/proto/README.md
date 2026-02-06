# BunMart gRPC Protos — Proto-First Design

This directory is the **single source of truth** for all service-to-service gRPC APIs. We follow a **proto-first** approach: define the contract here first, then implement services against it.

## Philosophy

- **Proto-first:** Design and agree on `.proto` files before writing service code. New features or cross-service calls start with proto changes and team alignment.
- **One directory per service:** Each service has its own folder (e.g. `product/v1/`, `order/v1/`) and owns its API surface. Callers depend on these protos to generate client stubs.
- **Stability:** Do not change message names, field numbers, or RPC signatures without team agreement. Add new RPCs or optional fields for evolution; avoid breaking existing callers.
- **REST is separate:** Frontend-facing REST APIs are per-service and not defined here. Only backend-to-backend gRPC is specified in this tree.

## Layout

```
proto/
├── README.md
├── product/
│   └── v1/
│       └── product.proto      # ProductCatalogService
├── kitchen/
│   └── v1/
│       └── kitchen.proto      # KitchenService
├── pricing/
│   └── v1/
│       └── pricing.proto      # PricingService
├── cart/
│   └── v1/
│       └── cart.proto         # CartService
├── order/
│   └── v1/
│       └── order.proto        # OrderService
├── payment/
│   └── v1/
│       └── payment.proto      # PaymentService
├── shipping/
│   └── v1/
│       └── shipping.proto      # ShippingService
├── notification/
│   └── v1/
│       └── notification.proto # NotificationService
├── review/
│   └── v1/
│       └── review.proto       # ReviewService
└── user/
    └── v1/
        └── user.proto         # UserService
```

## Conventions (from main README)

- **Protocol:** Protocol Buffers 3 (proto3).
- **Naming:** Messages `PascalCase`, fields `snake_case`, RPCs `PascalCase`.
- **IDs:** `string` (e.g. `product_id`, `user_id`) for UUIDs or other schemes.
- **Money:** Decimal as `string` (e.g. `"19.99"`) or a `Money` message.
- **Timestamps:** `google.protobuf.Timestamp` for `created_at`, `updated_at`.
- **Pagination:** `page_token` / `page_size`; response has `next_page_token` and list.

## Building / code generation

Each service (or a shared build) should:

1. Use these protos as input to `protoc` (or a Gradle/Maven plugin).
2. Include `google/protobuf/timestamp.proto` via the standard include path (e.g. from `com.google.protobuf:protobuf-java` or the protoc distribution).
3. Generate server and client code into the appropriate service module.

Example (conceptual):

```bash
protoc -I . -I /path/to/googleapis-or-protobuf \
  --java_out=... --grpc_java_out=... \
  product/v1/product.proto
```

See each service's `build.gradle` for the actual plugin and paths.

## Who calls whom

See **[../WHO_CALLS_WHOM.md](../WHO_CALLS_WHOM.md)** for the full call matrix and diagram.
