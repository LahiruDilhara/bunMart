# BunMart E-Commerce Platform

A microservices-based e-commerce platform designed for bun marketing, where sellers can list their products and users can purchase them seamlessly.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Services Overview](#services-overview)
- [Getting Started](#getting-started)
- [Development Guidelines](#development-guidelines)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## 🎯 Overview

BunMart is a comprehensive e-commerce platform built with a microservices architecture. The platform supports three distinct user roles:

- **Users**: Browse and purchase products
- **Sellers**: List and manage their bun products
- **Admins**: Oversee platform operations and manage users/sellers

The platform provides a complete e-commerce experience including product catalog management, shopping cart, order processing, payment integration, shipping tracking, and comprehensive notification systems.

## 🛠 Technology Stack

### Backend
- **Framework**: Spring Boot 4.x
- **Language**: Java 25
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA
- **APIs**: REST (for frontend/clients) and **gRPC** (for service-to-service)
- **Contract**: Protocol Buffers (proto3) — shared definitions in `backend/proto`
- **Payment Gateway**: Stripe
- **Build Tool**: Gradle
- **Architecture**: Microservices with API Gateway (BFF-style aggregation)

### Frontend
- **Framework**: Next.js 16
- **UI**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **Location**: `frontend/` — app, cart, components, models, service, public

## 🏗 Architecture

BunMart follows a **microservices architecture** with clear API boundaries:

- **REST APIs**: Used by the frontend and external clients only. The frontend never calls gRPC.
- **gRPC**: Used only for **service-to-service** communication (backend to backend). Contracts are defined in Protocol Buffers.
- **API Gateway**: Optional BFF (Backend-for-Frontend) in `backend/api-gateway` can aggregate data from services via REST for the UI.
- **Intent-driven flows**: Checkout and order lifecycle use intents (e.g. order intent from Cart → full order → payment intent).

### Key Architectural Principles

1. **Service Independence**: Each service has its own database/schema.
2. **Layered Architecture**: Controller → Service → Repository → Model (plus `grpc/` and `errors/` where applicable).
3. **Exception Handling**: Three-layer exception masking strategy.
4. **API-First Design**: REST for clients; gRPC for inter-service calls with stable proto contracts.
5. **No cross-service REST**: Backend services communicate via gRPC only; no service-to-service REST.

For detailed architecture, service responsibilities, and who-calls-whom, see:
- [Backend README](backend/README.md) — services, REST vs gRPC policy, CRUD, flows
- [WHO_CALLS_WHOM.md](backend/WHO_CALLS_WHOM.md) — call matrix
- [backend/base/SERVICE_ARCHITECTURE.md](backend/base/SERVICE_ARCHITECTURE.md) — base service structure

## 📁 Project Structure

```
bunMart/
├── backend/
│   └── base/                    # Base service (foundation)
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/nsbm/bunmart/base/
│       │   │   │       ├── controller/      # REST API endpoints
│       │   │   │       ├── services/        # Business logic
│       │   │   │       ├── repositories/    # Database access
│       │   │   │       ├── model/           # JPA entities
│       │   │   │       ├── interface/       # DTOs and interfaces
│       │   │   │       ├── mappers/         # Entity-DTO conversion
│       │   │   │       ├── errors/          # Exception handling
│       │   │   │       └── configuration/   # Spring configuration
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   └── test/                         # Test files
│       ├── build.gradle
│       └── SERVICE_ARCHITECTURE.md          # Architecture docs
└── frontend/                 # Next.js app (React 19, TypeScript, Tailwind)
```

Other backend modules: `api-gateway`, `cartService`, `kitchenService`, `orderManagementService`, `paymentService`, `pricingService`, `productService`, `proto`, `reviewService`, `shippingService`, `userProfileService`, `mock`. See [backend/README.md](backend/README.md) and [backend/WHO_CALLS_WHOM.md](backend/WHO_CALLS_WHOM.md).

## 🔧 Services Overview

The platform consists of **10 core microservices**. Each exposes **REST** for the frontend and **gRPC** for service-to-service calls. For full details, gRPC contracts, and who-calls-whom, see [backend/README.md](backend/README.md).

| # | Service (module) | Responsibility |
|---|------------------|----------------|
| 1 | **Product Catalog** (`productService`) | Products, categories, images, availability; add-to-cart via Product → Cart gRPC |
| 2 | **Kitchen** (`kitchenService`) | Production orders, phases (preparing, baking, completed), progress; notifies Order when prepared |
| 3 | **Pricing & Promotion** (`pricingService`) | Prices, discounts, coupons; used on order page for full price and reductions |
| 4 | **Shopping Cart** (`cartService`) | Carts, cart items; checkout creates order intent and hands off to Order |
| 5 | **Order** (`orderManagementService`) | Intent-driven: order intent → full order (coupons, delivery) → payment intent; orchestrates Kitchen & Shipping |
| 6 | **Payment** (`paymentService`) | Stripe-only payment intents; webhook for success/failure; no stored payment methods |
| 7 | **Shipping** (`shippingService`) | Shipping intents → shipments; drivers, delivery; notifies Order when shipped |
| 8 | **Notification** | Order updates, production alerts, shipping notifications; templates, channels |
| 9 | **Review & Rating** (`reviewService`) | Product reviews after order completion; moderation |
| 10 | **User Management** (`userProfileService`) | Profiles, addresses (delivery/billing), preferences; other services reference by `user_id` / `address_id` |

Shared: **`proto/`** — Protocol Buffer definitions; **`api-gateway`** — optional BFF.

## 🚀 Getting Started

### Prerequisites

- Java 25 or higher
- PostgreSQL 12+
- Gradle 7.0+
- Node.js 20+ and npm (for frontend)
- Stripe account (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bunMart
   ```

2. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb bunmart_db
   ```

3. **Configure application properties**
   ```bash
   cd backend/base/src/main/resources
   # Edit application.properties with your database credentials
   ```

4. **Build the project**
   ```bash
   cd backend/base
   ./gradlew build
   ```

5. **Run the application**
   ```bash
   ./gradlew bootRun
   ```

The application will start on `http://localhost:8080` (default port).

**Frontend (Next.js)**

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` by default. Copy `.env.example` to `.env` and set your API base URL if needed.

### Environment Variables

Create a `.env` file or set the following environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bunmart_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# Stripe Configuration
STRIPE_API_KEY=your_stripe_api_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email Service (if applicable)
EMAIL_SERVICE_API_KEY=your_email_service_key
```

## 📝 Development Guidelines

### Code Structure

Each service follows a standardized layered architecture:

```
controller/     → REST API endpoints (HTTP layer)
services/       → Business logic implementation
repositories/   → Database access layer (JPA repositories)
model/          → JPA entities (database models)
interface/      → Service interfaces and DTOs
mappers/        → Entity-DTO conversion logic
grpc/           → gRPC server and client (service-to-service)
errors/         → Custom exception classes (exception handling)
configuration/  → Spring configuration classes
```

### Exception Handling

The project follows a three-layer exception masking strategy:

1. **Repository Layer**: Throws database-specific exceptions
2. **Service Layer**: Transforms technical errors into business exceptions
3. **Controller Layer**: Maps exceptions to appropriate HTTP status codes

### Best Practices

- ✅ Never expose entities directly in APIs - Always use DTOs
- ✅ Validate input at controller level using Bean Validation
- ✅ Keep controllers thin - Business logic belongs in services
- ✅ Use `@Transactional` appropriately for service methods
- ✅ Log meaningful information with request IDs for tracing
- ✅ Follow REST conventions for API design (frontend); keep gRPC contracts stable (service-to-service)
- ✅ Document code with JavaDoc for public methods

### Database Guidelines

- Each service has its own database/schema
- Use appropriate indexes on foreign keys and frequently queried fields
- Implement soft deletes where appropriate
- Include audit fields (`createdAt`, `updatedAt`) on all entities
- Use DECIMAL for money values (never FLOAT)
- Version control migrations using Flyway or Liquibase

## 📚 API Documentation

API documentation is available for each service. Once services are running, you can access:

- **Swagger/OpenAPI**: `http://localhost:8080/swagger-ui.html` (if configured)
- **Service-specific documentation**: See individual service README files

### API Endpoints Overview

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Sellers**: `/api/sellers/*`
- **Products**: `/api/products/*`
- **Cart**: `/api/cart/*`
- **Orders**: `/api/orders/*`
- **Payments**: `/api/payments/*`
- **Shipping**: `/api/shipments/*`
- **Notifications**: `/api/notifications/*`

## 🤝 Contributing

### Development Workflow

1. **Review Architecture Documentation**
   - Read [backend/README.md](backend/README.md) and [backend/base/SERVICE_ARCHITECTURE.md](backend/base/SERVICE_ARCHITECTURE.md)
   - Understand your service responsibilities and gRPC contracts
   - Check [backend/WHO_CALLS_WHOM.md](backend/WHO_CALLS_WHOM.md) for dependencies

2. **Development Phases**
   - Phase 1: Setup & Planning
   - Phase 2: Development
   - Phase 3: Integration
   - Phase 4: Testing & Refinement
   - Phase 5: Deployment Preparation

3. **Code Review Guidelines**
   - Follow the established code structure
   - Ensure proper exception handling
   - Add appropriate tests
   - Update documentation

### Team Collaboration

- Hold regular team sync meetings to discuss integration points
- Share API documentation early and update frequently
- Communicate breaking changes immediately
- Review each other's code for consistency
- Maintain a shared repository for common DTOs and utilities

## 📄 License

[Add your license information here]

## 👥 Team

[Add team member information here]

## 📞 Support

For questions or issues:
- Review the [Backend README](backend/README.md) and [Architecture Documentation](backend/base/SERVICE_ARCHITECTURE.md)
- Contact the development team
- Create an issue in the repository

---

**Note**: This is a team effort. Communication is key to building a successful microservices architecture. When in doubt, ask questions and collaborate with your teammates!

