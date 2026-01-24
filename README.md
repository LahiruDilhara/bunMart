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
- **Framework**: Spring Boot 3.x
- **Language**: Java 25
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: Stripe
- **Build Tool**: Gradle
- **Architecture**: Microservices with RESTful APIs

### Frontend
- Frontend implementation is in progress

## 🏗 Architecture

BunMart follows a **microservices architecture** pattern where each service is independently deployable and responsible for a specific business domain. Services communicate through:

- **Synchronous Communication**: REST APIs for immediate responses
- **Asynchronous Communication**: Message queues for event-driven operations
- **Event-Driven Architecture**: Services publish and subscribe to events

### Key Architectural Principles

1. **Service Independence**: Each service has its own database/schema
2. **Layered Architecture**: Controller → Service → Repository → Model
3. **Exception Handling**: Three-layer exception masking strategy
4. **API-First Design**: RESTful APIs with standardized error responses
5. **Security**: JWT-based authentication with role-based access control

For detailed architecture documentation, see [backend/base/SERVICE_ARCHITECTURE.md](backend/base/SERVICE_ARCHITECTURE.md).

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
└── frontend/                      # Frontend application (in progress)
```

## 🔧 Services Overview

The platform consists of 10 core microservices:

### 1. **Authentication & Authorization Service**
- User registration and login
- JWT token management
- Password reset and email verification
- Role-based access control (USER, SELLER, ADMIN)

### 2. **User Management Service**
- User profile management
- Address management (shipping/billing)
- User preferences and settings
- Profile image upload

### 3. **Seller Management Service**
- Seller registration and onboarding
- Store management
- Seller verification workflow
- Seller ratings and reviews

### 4. **Product Catalog Service**
- Product CRUD operations
- Hierarchical category management
- Product search and filtering
- Product reviews and ratings
- Product image management

### 5. **Inventory Management Service**
- Real-time stock tracking
- Stock reservations for checkout
- Stock movement history
- Multi-warehouse support
- Low stock alerts

### 6. **Shopping Cart Service**
- Cart management (add/remove items)
- Cart validation before checkout
- Save for later functionality
- Guest cart support

### 7. **Order Management Service**
- Order creation and lifecycle management
- Order status tracking
- Order history and notes
- Order cancellation and refunds

### 8. **Payment Service**
- Stripe payment integration
- Payment processing and confirmation
- Refund management
- Saved payment methods
- Webhook handling

### 9. **Shipping & Tracking Service**
- Shipping cost calculation
- Multi-carrier integration
- Real-time shipment tracking
- Shipping label generation
- Delivery estimates

### 10. **Notification & Communication Service**
- Multi-channel notifications (Email, SMS, Push)
- User-seller messaging
- Notification preferences
- Email template management

## 🚀 Getting Started

### Prerequisites

- Java 25 or higher
- PostgreSQL 12+ 
- Gradle 7.0+
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
services/        → Business logic implementation
repositories/    → Database access layer (JPA repositories)
model/           → JPA entities (database models)
interface/       → Service interfaces and DTOs
mappers/         → Entity-DTO conversion logic
exceptions/      → Custom exception classes
configuration/   → Spring configuration classes
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
- ✅ Follow REST conventions for API design
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
   - Read [SERVICE_ARCHITECTURE.md](backend/base/SERVICE_ARCHITECTURE.md) thoroughly
   - Understand your service responsibilities
   - Identify dependencies on other services

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
- Review the [Architecture Documentation](backend/base/SERVICE_ARCHITECTURE.md)
- Contact the development team
- Create an issue in the repository

---

**Note**: This is a team effort. Communication is key to building a successful microservices architecture. When in doubt, ask questions and collaborate with your teammates!

