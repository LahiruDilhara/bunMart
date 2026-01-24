# BunMart E-Commerce Platform - Service Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Exception Handling Strategy](#exception-handling-strategy)
4. [Service Specifications](#service-specifications)
5. [Inter-Service Communication](#inter-service-communication)
6. [Database Design Guidelines](#database-design-guidelines)

---

## Project Overview

BunMart is a microservices-based e-commerce platform for bun marketing where sellers can list their products and users can purchase them. The platform supports three user roles:

- **Users**: Browse and purchase products
- **Sellers**: List and manage their bun products
- **Admins**: Oversee platform operations and manage users/sellers

**Technology Stack:**
- Spring Boot 3.x with Spring Data JPA
- PostgreSQL database
- Stripe payment integration
- RESTful API architecture
- JWT-based authentication

---

## Project Structure

Each service follows a standardized layered architecture within the `com.example.bunmart` package:

### Directory Structure

```
src/main/java/com/example/bunmart/
├── controller/          # REST API endpoints (HTTP layer)
├── services/            # Business logic implementation
├── repositories/        # Database access layer (JPA repositories)
├── model/              # JPA entities (database models)
├── interface/          # Service interfaces and DTOs
├── mappers/            # Entity-DTO conversion logic
├── exceptions/         # Custom exception classes
└── configuration/      # Spring configuration classes
```

### Layer Responsibilities

**1. Model Layer (`model/`)**
- Define JPA entities that map to database tables
- Include field validations, relationships, and constraints
- Represent the database schema in Java classes

**2. Repository Layer (`repositories/`)**
- Extend JpaRepository or custom repository interfaces
- Define custom query methods if needed
- Handle direct database interactions
- Should throw only database-related exceptions

**3. Service Layer (`services/`)**
- Implement business logic and validation rules
- Transform repository exceptions into business-specific exceptions
- Coordinate between multiple repositories
- Handle transactional operations

**4. Controller Layer (`controller/`)**
- Define REST API endpoints
- Handle HTTP requests/responses
- Perform input validation
- Handle business exceptions and return appropriate HTTP status codes
- Should NOT contain business logic

**5. Mapper Layer (`mappers/`)**
- Convert between entities and DTOs
- Transform data for API responses
- Map request DTOs to entities

**6. Interface Layer (`interface/`)**
- Define service interfaces (contracts)
- Create DTOs (Data Transfer Objects) for API requests/responses
- Define request/response models

**7. Exception Layer (`exceptions/`)**
- Define custom exception classes for each layer
- Repository exceptions (e.g., DataAccessException)
- Service exceptions (e.g., ResourceNotFoundException, BusinessValidationException)
- Global exception handler for controllers

**8. Configuration Layer (`configuration/`)**
- Security configurations
- Database configurations
- Third-party service configurations
- Bean definitions

---

## Exception Handling Strategy

### Three-Layer Exception Masking

The exception handling follows a bottom-up approach where each layer masks technical details from the layer above:

### Layer 1: Repository Layer
**Responsibility**: Throw database-specific exceptions
- Let Spring Data JPA exceptions propagate (DataAccessException, EntityNotFoundException)
- Optionally create custom repository exceptions for specific database errors
- Example exceptions: DatabaseConnectionException, DuplicateKeyException

### Layer 2: Service Layer
**Responsibility**: Catch repository exceptions and transform them into business logic exceptions
- Catch all repository/database exceptions
- Translate technical errors into business-meaningful exceptions
- Add business context to exceptions
- Example transformations:
  - EntityNotFoundException → ResourceNotFoundException("Product not found with id: X")
  - DataIntegrityViolationException → DuplicateResourceException("Product with this name already exists")
  - ConstraintViolationException → InvalidOperationException("Cannot delete category with existing products")

**Service Layer Exception Categories:**
- **ResourceNotFoundException**: When requested resource doesn't exist
- **DuplicateResourceException**: When creating a resource that already exists
- **InvalidOperationException**: When operation violates business rules
- **InsufficientPermissionException**: When user lacks required permissions
- **BusinessValidationException**: When business validation fails

### Layer 3: Controller Layer
**Responsibility**: Catch service exceptions and return appropriate HTTP responses
- Catch business logic exceptions from services
- Map exceptions to HTTP status codes
- Return standardized error responses
- Never expose internal implementation details

**Exception to HTTP Status Mapping:**
- ResourceNotFoundException → 404 Not Found
- DuplicateResourceException → 409 Conflict
- InvalidOperationException → 400 Bad Request
- InsufficientPermissionException → 403 Forbidden
- BusinessValidationException → 422 Unprocessable Entity
- Any uncaught exception → 500 Internal Server Error

### Global Exception Handler
Create a global exception handler using @ControllerAdvice that:
- Catches all exceptions thrown by controllers
- Provides consistent error response format
- Logs exceptions appropriately
- Returns JSON error responses with proper HTTP status codes

**Error Response Format:**
All error responses should follow a standard structure containing:
- timestamp: When the error occurred
- status: HTTP status code
- error: Error type/name
- message: User-friendly error message
- path: API endpoint that caused the error

---

## Service Specifications

## Service 1: Authentication & Authorization Service

### Purpose
Handle all authentication and authorization operations including user registration, login, token management, and role-based access control for Users, Sellers, and Admins.

### Models (Entities)
1. **User**: Core user entity
   - Fields: id, email, password (hashed), userRole (enum: USER, SELLER, ADMIN), isActive, isVerified, createdAt, updatedAt
   
2. **RefreshToken**: Store refresh tokens
   - Fields: id, token, userId (FK), expiryDate, createdAt

3. **PasswordResetToken**: Handle password reset flows
   - Fields: id, token, userId (FK), expiryDate, used

### Services
1. **AuthenticationService**: Handle login, registration, token generation
   - register(): Create new user account with role
   - login(): Authenticate user and generate JWT tokens
   - refreshToken(): Generate new access token from refresh token
   - logout(): Invalidate refresh token
   - verifyEmail(): Verify user email with verification token
   - initiatePasswordReset(): Create password reset token
   - resetPassword(): Reset password using token

2. **AuthorizationService**: Handle permission checks
   - hasPermission(): Check if user has specific permission
   - validateToken(): Validate JWT token
   - getUserFromToken(): Extract user details from token

### Controllers (API Endpoints)
1. **AuthController**:
   - POST /api/auth/register: Register new user (body: email, password, role)
   - POST /api/auth/login: Login user (body: email, password)
   - POST /api/auth/refresh: Refresh access token (body: refreshToken)
   - POST /api/auth/logout: Logout user (header: Authorization)
   - POST /api/auth/verify-email: Verify email (query: token)
   - POST /api/auth/forgot-password: Initiate password reset (body: email)
   - POST /api/auth/reset-password: Reset password (body: token, newPassword)
   - GET /api/auth/me: Get current user info (header: Authorization)

### Expected Outcomes
- Secure user registration with password hashing
- JWT-based authentication system
- Refresh token mechanism for token renewal
- Email verification workflow
- Password reset functionality
- Role-based access control foundation

### Key Responsibilities
- Secure password storage (use BCrypt)
- Generate and validate JWT tokens
- Manage refresh token lifecycle
- Integrate with email service for verification
- Validate user credentials
- Handle account activation/deactivation

---

## Service 2: User Management Service

### Purpose
Manage user profiles, addresses, preferences, and account settings for customers who purchase products.

### Models (Entities)
1. **UserProfile**: Extended user information
   - Fields: id, userId (FK from Auth Service reference), firstName, lastName, phoneNumber, dateOfBirth, profileImageUrl, createdAt, updatedAt

2. **UserAddress**: User shipping addresses
   - Fields: id, userId, addressType (enum: SHIPPING, BILLING), streetAddress, city, state, postalCode, country, isDefault, createdAt

3. **UserPreferences**: User app preferences
   - Fields: id, userId, emailNotifications, smsNotifications, language, currency

### Services
1. **UserProfileService**: Manage user profiles
   - getUserProfile(): Retrieve user profile by userId
   - updateUserProfile(): Update profile information
   - uploadProfileImage(): Upload and update profile image
   - deleteUserProfile(): Soft delete user profile

2. **UserAddressService**: Manage addresses
   - addAddress(): Add new address
   - updateAddress(): Update existing address
   - deleteAddress(): Remove address
   - setDefaultAddress(): Set an address as default
   - getUserAddresses(): Get all user addresses
   - getDefaultAddress(): Get default shipping address

3. **UserPreferencesService**: Manage preferences
   - getPreferences(): Get user preferences
   - updatePreferences(): Update user preferences

### Controllers (API Endpoints)
1. **UserProfileController**:
   - GET /api/users/{userId}/profile: Get user profile
   - PUT /api/users/{userId}/profile: Update user profile
   - POST /api/users/{userId}/profile/image: Upload profile image
   - DELETE /api/users/{userId}/profile: Delete profile

2. **UserAddressController**:
   - GET /api/users/{userId}/addresses: Get all addresses
   - GET /api/users/{userId}/addresses/{addressId}: Get specific address
   - POST /api/users/{userId}/addresses: Add new address
   - PUT /api/users/{userId}/addresses/{addressId}: Update address
   - DELETE /api/users/{userId}/addresses/{addressId}: Delete address
   - PUT /api/users/{userId}/addresses/{addressId}/set-default: Set default address

3. **UserPreferencesController**:
   - GET /api/users/{userId}/preferences: Get preferences
   - PUT /api/users/{userId}/preferences: Update preferences

### Expected Outcomes
- Complete user profile management
- Multiple address support with default selection
- Customizable user preferences
- Profile image upload and storage

### Key Responsibilities
- Validate user data (phone numbers, postal codes)
- Ensure one default address per user
- Handle profile image storage (consider cloud storage)
- Validate address formats
- Enforce data privacy rules

---

## Service 3: Seller Management Service

### Purpose
Manage seller accounts, store information, seller verification, and seller-specific operations.

### Models (Entities)
1. **Seller**: Seller account information
   - Fields: id, userId (FK from Auth Service), businessName, businessType, taxId, verificationStatus (enum: PENDING, VERIFIED, REJECTED), isActive, createdAt, updatedAt

2. **SellerStore**: Seller's store details
   - Fields: id, sellerId (FK), storeName, storeDescription, storeLogoUrl, storeBannerUrl, storeUrl (slug), contactEmail, contactPhone, createdAt, updatedAt

3. **SellerVerification**: Verification documents and process
   - Fields: id, sellerId, documentType (enum: BUSINESS_LICENSE, TAX_CERTIFICATE, ID_PROOF), documentUrl, verificationStatus, verifiedBy (adminId), verifiedAt, rejectionReason

4. **SellerRating**: Seller ratings and reviews
   - Fields: id, sellerId, userId, rating (1-5), review, createdAt

### Services
1. **SellerService**: Core seller operations
   - registerSeller(): Register new seller account
   - getSellerById(): Retrieve seller information
   - updateSellerInfo(): Update seller details
   - activateSeller(): Activate seller account
   - deactivateSeller(): Deactivate seller account
   - getSellerStats(): Get seller statistics (total products, sales, rating)

2. **SellerStoreService**: Manage store information
   - createStore(): Create seller store
   - updateStore(): Update store details
   - uploadStoreLogo(): Upload store logo
   - uploadStoreBanner(): Upload store banner
   - getStoreByUrl(): Get store by URL slug

3. **SellerVerificationService**: Handle verification process
   - submitVerificationDocuments(): Submit documents for verification
   - verifyDocument(): Admin verifies a document
   - rejectDocument(): Admin rejects a document
   - getVerificationStatus(): Get verification status

4. **SellerRatingService**: Manage seller ratings
   - addRating(): Add rating for seller
   - getSellerRatings(): Get all ratings for seller
   - getAverageRating(): Calculate average rating

### Controllers (API Endpoints)
1. **SellerController**:
   - POST /api/sellers: Register as seller
   - GET /api/sellers/{sellerId}: Get seller details
   - PUT /api/sellers/{sellerId}: Update seller information
   - GET /api/sellers/{sellerId}/stats: Get seller statistics
   - PUT /api/sellers/{sellerId}/activate: Activate seller account
   - PUT /api/sellers/{sellerId}/deactivate: Deactivate seller account

2. **SellerStoreController**:
   - POST /api/sellers/{sellerId}/store: Create store
   - GET /api/sellers/{sellerId}/store: Get store details
   - PUT /api/sellers/{sellerId}/store: Update store
   - POST /api/sellers/{sellerId}/store/logo: Upload logo
   - POST /api/sellers/{sellerId}/store/banner: Upload banner
   - GET /api/stores/{storeUrl}: Get store by URL slug

3. **SellerVerificationController**:
   - POST /api/sellers/{sellerId}/verification: Submit verification documents
   - GET /api/sellers/{sellerId}/verification: Get verification status
   - PUT /api/sellers/{sellerId}/verification/{documentId}/verify: Verify document (Admin only)
   - PUT /api/sellers/{sellerId}/verification/{documentId}/reject: Reject document (Admin only)

4. **SellerRatingController**:
   - POST /api/sellers/{sellerId}/ratings: Add rating
   - GET /api/sellers/{sellerId}/ratings: Get all ratings
   - GET /api/sellers/{sellerId}/ratings/average: Get average rating

### Expected Outcomes
- Complete seller onboarding process
- Store management functionality
- Document verification workflow
- Seller rating system

### Key Responsibilities
- Validate business information
- Handle document uploads securely
- Implement verification workflow
- Calculate and cache seller ratings
- Generate unique store URLs
- Ensure only verified sellers can list products

---

## Service 4: Product Catalog Service

### Purpose
Manage product listings, categories, product search, filtering, and product reviews.

### Models (Entities)
1. **Product**: Product information
   - Fields: id, sellerId (FK), categoryId (FK), name, description, basePrice, discountPercentage, finalPrice, sku, isActive, createdAt, updatedAt

2. **Category**: Product categories
   - Fields: id, name, description, parentCategoryId (self-reference for hierarchy), imageUrl, isActive

3. **ProductImage**: Product images
   - Fields: id, productId (FK), imageUrl, imageOrder, isPrimary

4. **ProductReview**: Customer reviews
   - Fields: id, productId, userId, rating (1-5), reviewTitle, reviewText, isVerified (verified purchase), createdAt, updatedAt

5. **ProductAttribute**: Additional product attributes
   - Fields: id, productId, attributeName (e.g., weight, flavor, ingredients), attributeValue

### Services
1. **ProductService**: Core product operations
   - createProduct(): Create new product
   - updateProduct(): Update product details
   - deleteProduct(): Soft delete product
   - getProductById(): Get product by ID
   - getProductsBySeller(): Get all products for a seller
   - activateProduct(): Activate product
   - deactivateProduct(): Deactivate product
   - calculateFinalPrice(): Calculate price after discount

2. **CategoryService**: Manage categories
   - createCategory(): Create new category
   - updateCategory(): Update category
   - deleteCategory(): Delete category (if no products)
   - getCategoryTree(): Get hierarchical category tree
   - getCategoriesByParent(): Get subcategories

3. **ProductSearchService**: Search and filter products
   - searchProducts(): Search by keyword, category, price range
   - getFilteredProducts(): Filter by multiple criteria
   - getTrendingProducts(): Get trending products
   - getNewArrivals(): Get recently added products
   - getProductsByCategoryWithFilters(): Get products with filters

4. **ProductImageService**: Manage product images
   - uploadProductImage(): Upload product image
   - deleteProductImage(): Delete image
   - reorderImages(): Change image order
   - setPrimaryImage(): Set primary image

5. **ProductReviewService**: Manage reviews
   - addReview(): Add product review
   - updateReview(): Update review
   - deleteReview(): Delete review
   - getProductReviews(): Get all reviews for product
   - getAverageRating(): Calculate average rating
   - markReviewAsVerified(): Mark as verified purchase

### Controllers (API Endpoints)
1. **ProductController**:
   - POST /api/products: Create product
   - GET /api/products/{productId}: Get product details
   - PUT /api/products/{productId}: Update product
   - DELETE /api/products/{productId}: Delete product
   - GET /api/sellers/{sellerId}/products: Get seller's products
   - PUT /api/products/{productId}/activate: Activate product
   - PUT /api/products/{productId}/deactivate: Deactivate product

2. **CategoryController**:
   - POST /api/categories: Create category
   - GET /api/categories: Get all categories
   - GET /api/categories/{categoryId}: Get category
   - PUT /api/categories/{categoryId}: Update category
   - DELETE /api/categories/{categoryId}: Delete category
   - GET /api/categories/tree: Get category hierarchy

3. **ProductSearchController**:
   - GET /api/products/search: Search products (query params: keyword, category, minPrice, maxPrice, sortBy)
   - GET /api/products/trending: Get trending products
   - GET /api/products/new-arrivals: Get new products
   - GET /api/categories/{categoryId}/products: Get products by category with filters

4. **ProductImageController**:
   - POST /api/products/{productId}/images: Upload image
   - DELETE /api/products/{productId}/images/{imageId}: Delete image
   - PUT /api/products/{productId}/images/reorder: Reorder images
   - PUT /api/products/{productId}/images/{imageId}/set-primary: Set primary image

5. **ProductReviewController**:
   - POST /api/products/{productId}/reviews: Add review
   - GET /api/products/{productId}/reviews: Get all reviews
   - PUT /api/products/{productId}/reviews/{reviewId}: Update review
   - DELETE /api/products/{productId}/reviews/{reviewId}: Delete review
   - GET /api/products/{productId}/reviews/average: Get average rating

### Expected Outcomes
- Complete product catalog management
- Hierarchical category system
- Advanced search and filtering
- Product review and rating system
- Multiple product images support

### Key Responsibilities
- Validate product data completeness
- Implement full-text search (consider Elasticsearch integration)
- Calculate and cache product ratings
- Handle image uploads and optimization
- Implement category hierarchy logic
- Ensure only verified sellers can list products
- Prevent duplicate SKUs

---

## Service 5: Inventory Management Service

### Purpose
Track product stock levels, manage inventory, handle stock reservations, and provide availability information.

### Models (Entities)
1. **Inventory**: Stock information
   - Fields: id, productId (FK), availableQuantity, reservedQuantity, totalQuantity, minimumStockLevel, warehouseId (FK), lastRestockedAt, updatedAt

2. **Warehouse**: Warehouse/storage locations
   - Fields: id, name, location, capacity, isActive

3. **StockMovement**: Track all inventory changes
   - Fields: id, inventoryId (FK), movementType (enum: RESTOCK, SALE, RETURN, ADJUSTMENT, RESERVATION), quantity, previousQuantity, newQuantity, referenceId (orderId/returnId), notes, createdAt, createdBy

4. **StockReservation**: Temporary stock holds
   - Fields: id, inventoryId (FK), orderId (FK), quantity, reservationStatus (enum: ACTIVE, RELEASED, EXPIRED), expiresAt, createdAt

### Services
1. **InventoryService**: Core inventory operations
   - getInventoryByProduct(): Get inventory for product
   - updateInventory(): Update stock quantity
   - checkAvailability(): Check if quantity is available
   - getInventoryForMultipleProducts(): Bulk availability check
   - getLowStockProducts(): Get products below minimum level
   - getOutOfStockProducts(): Get unavailable products

2. **StockReservationService**: Handle stock reservations
   - reserveStock(): Reserve stock for order (during checkout)
   - releaseReservation(): Release reservation (cancel/timeout)
   - confirmReservation(): Convert reservation to sale
   - expireOldReservations(): Cleanup expired reservations (scheduled)
   - getActiveReservations(): Get all active reservations

3. **StockMovementService**: Track stock changes
   - recordStockMovement(): Record any stock change
   - getMovementHistory(): Get movement history
   - getMovementsByType(): Filter movements by type
   - restockProduct(): Add stock to inventory
   - adjustStock(): Manual stock adjustment
   - recordReturn(): Handle returned items

4. **WarehouseService**: Manage warehouses
   - createWarehouse(): Add new warehouse
   - updateWarehouse(): Update warehouse details
   - getWarehouseInventory(): Get all inventory in warehouse
   - transferStock(): Transfer between warehouses

### Controllers (API Endpoints)
1. **InventoryController**:
   - GET /api/inventory/products/{productId}: Get product inventory
   - POST /api/inventory/products/{productId}/check: Check availability (body: quantity)
   - POST /api/inventory/check-multiple: Bulk availability check (body: list of productId and quantity)
   - PUT /api/inventory/products/{productId}: Update inventory
   - GET /api/inventory/low-stock: Get low stock products
   - GET /api/inventory/out-of-stock: Get out of stock products

2. **StockReservationController**:
   - POST /api/inventory/reserve: Reserve stock (body: productId, quantity, orderId)
   - PUT /api/inventory/reservations/{reservationId}/release: Release reservation
   - PUT /api/inventory/reservations/{reservationId}/confirm: Confirm reservation
   - GET /api/inventory/reservations/active: Get active reservations
   - GET /api/inventory/reservations/order/{orderId}: Get reservations for order

3. **StockMovementController**:
   - POST /api/inventory/movements: Record stock movement
   - GET /api/inventory/products/{productId}/movements: Get movement history
   - POST /api/inventory/products/{productId}/restock: Restock product
   - POST /api/inventory/products/{productId}/adjust: Adjust stock
   - POST /api/inventory/products/{productId}/return: Record return

4. **WarehouseController**:
   - POST /api/warehouses: Create warehouse
   - GET /api/warehouses: Get all warehouses
   - GET /api/warehouses/{warehouseId}: Get warehouse details
   - PUT /api/warehouses/{warehouseId}: Update warehouse
   - GET /api/warehouses/{warehouseId}/inventory: Get warehouse inventory
   - POST /api/warehouses/transfer: Transfer stock between warehouses

### Expected Outcomes
- Real-time inventory tracking
- Stock reservation system for checkout process
- Complete audit trail of stock movements
- Low stock alerts
- Multi-warehouse support

### Key Responsibilities
- Maintain data consistency (available = total - reserved)
- Implement optimistic locking to prevent overselling
- Handle concurrent reservation requests safely
- Schedule job to expire old reservations
- Send alerts for low stock levels
- Coordinate with Order Service for stock updates
- Ensure atomic operations for stock changes

---

## Service 6: Shopping Cart Service

### Purpose
Manage user shopping carts, handle add/remove operations, calculate totals, and prepare for checkout.

### Models (Entities)
1. **Cart**: User's shopping cart
   - Fields: id, userId (FK), status (enum: ACTIVE, ABANDONED, CONVERTED), totalAmount, totalItems, createdAt, updatedAt, expiresAt

2. **CartItem**: Items in cart
   - Fields: id, cartId (FK), productId (FK), quantity, unitPrice, subtotal, addedAt, updatedAt

3. **SavedForLater**: Items saved for later
   - Fields: id, userId (FK), productId (FK), savedAt

### Services
1. **CartService**: Core cart operations
   - getOrCreateCart(): Get user's active cart or create new
   - addItemToCart(): Add product to cart
   - updateCartItemQuantity(): Update item quantity
   - removeItemFromCart(): Remove item
   - clearCart(): Remove all items
   - calculateCartTotal(): Calculate total amount
   - validateCartItems(): Verify all items are still available and prices are current
   - mergeGuestCart(): Merge guest cart with user cart on login

2. **SavedForLaterService**: Manage saved items
   - saveForLater(): Move item from cart to saved
   - moveToCart(): Move item from saved to cart
   - removeSavedItem(): Remove saved item
   - getSavedItems(): Get all saved items

3. **CartValidationService**: Validate cart before checkout
   - validateItemsAvailability(): Check stock availability
   - validatePrices(): Verify prices haven't changed
   - validateCartLimits(): Check quantity limits per product
   - getCartValidationReport(): Full validation with details

### Controllers (API Endpoints)
1. **CartController**:
   - GET /api/cart: Get current user's cart
   - POST /api/cart/items: Add item to cart (body: productId, quantity)
   - PUT /api/cart/items/{cartItemId}: Update item quantity (body: quantity)
   - DELETE /api/cart/items/{cartItemId}: Remove item from cart
   - DELETE /api/cart: Clear entire cart
   - GET /api/cart/summary: Get cart summary (total items, amount)
   - POST /api/cart/validate: Validate cart before checkout
   - POST /api/cart/merge: Merge guest cart with user cart

2. **SavedForLaterController**:
   - POST /api/cart/save-for-later/{cartItemId}: Save item for later
   - GET /api/cart/saved-items: Get saved items
   - POST /api/cart/saved-items/{savedItemId}/move-to-cart: Move to cart
   - DELETE /api/cart/saved-items/{savedItemId}: Remove saved item

### Expected Outcomes
- Seamless cart management experience
- Real-time cart calculations
- Cart persistence across sessions
- Save for later functionality
- Pre-checkout validation

### Key Responsibilities
- Validate product availability before adding to cart
- Verify prices match current product prices
- Handle quantity limits per product
- Calculate subtotals and totals accurately
- Handle guest cart to user cart migration
- Implement cart expiration logic
- Coordinate with Inventory Service for availability checks
- Send cart abandonment notifications

---

## Service 7: Order Management Service

### Purpose
Handle order creation, track order lifecycle, manage order status, and maintain order history.

### Models (Entities)
1. **Order**: Order information
   - Fields: id, userId (FK), sellerId (FK), orderNumber (unique), orderStatus (enum: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED), totalAmount, subtotalAmount, taxAmount, shippingCost, discountAmount, paymentStatus, shippingAddressId (FK), billingAddressId (FK), createdAt, updatedAt

2. **OrderItem**: Items in order
   - Fields: id, orderId (FK), productId (FK), productName (snapshot), quantity, unitPrice, subtotal, createdAt

3. **OrderStatusHistory**: Track status changes
   - Fields: id, orderId (FK), previousStatus, newStatus, changedBy (userId), reason, timestamp

4. **OrderNote**: Internal notes on order
   - Fields: id, orderId, noteType (enum: CUSTOMER, SELLER, ADMIN), note, createdBy, createdAt

### Services
1. **OrderService**: Core order operations
   - createOrder(): Create order from cart
   - getOrderById(): Get order details
   - getUserOrders(): Get all orders for user
   - getSellerOrders(): Get all orders for seller
   - cancelOrder(): Cancel order (with validations)
   - getOrderStatistics(): Get order stats for dashboard
   - calculateOrderTotals(): Calculate all amounts

2. **OrderStatusService**: Manage order status
   - updateOrderStatus(): Change order status
   - confirmOrder(): Move from PENDING to CONFIRMED
   - markAsProcessing(): Start processing order
   - markAsShipped(): Mark order as shipped
   - markAsDelivered(): Complete order
   - getOrderHistory(): Get status history
   - canCancelOrder(): Check if order can be cancelled

3. **OrderNoteService**: Manage order notes
   - addOrderNote(): Add note to order
   - getOrderNotes(): Get all notes for order
   - getCustomerNotes(): Get customer-visible notes

4. **OrderValidationService**: Validate orders
   - validateOrderCreation(): Validate before creating order
   - validateCancellation(): Check if cancellation is allowed
   - validateRefund(): Check if refund is allowed

### Controllers (API Endpoints)
1. **OrderController**:
   - POST /api/orders: Create order (body: cartId, shippingAddressId, billingAddressId)
   - GET /api/orders/{orderId}: Get order details
   - GET /api/users/{userId}/orders: Get user's orders
   - GET /api/sellers/{sellerId}/orders: Get seller's orders
   - PUT /api/orders/{orderId}/cancel: Cancel order
   - GET /api/orders/{orderId}/invoice: Get order invoice

2. **OrderStatusController**:
   - PUT /api/orders/{orderId}/status: Update order status (body: newStatus, reason)
   - PUT /api/orders/{orderId}/confirm: Confirm order
   - PUT /api/orders/{orderId}/process: Start processing
   - PUT /api/orders/{orderId}/ship: Mark as shipped
   - PUT /api/orders/{orderId}/deliver: Mark as delivered
   - GET /api/orders/{orderId}/history: Get status history

3. **OrderNoteController**:
   - POST /api/orders/{orderId}/notes: Add note (body: note, noteType)
   - GET /api/orders/{orderId}/notes: Get all notes

### Expected Outcomes
- Complete order lifecycle management
- Order status tracking with history
- Multi-seller order support
- Order cancellation with business rules
- Comprehensive order reporting

### Key Responsibilities
- Generate unique order numbers
- Snapshot product details at order time (prices, names)
- Validate order amounts match cart totals
- Coordinate with Inventory Service to confirm reservations
- Coordinate with Payment Service for payment processing
- Enforce business rules (e.g., can't cancel shipped orders)
- Calculate taxes and shipping costs
- Handle split orders (multiple sellers)
- Send order confirmation notifications
- Maintain complete audit trail

---

## Service 8: Payment Service

### Purpose
Handle payment processing through Stripe, manage transactions, process refunds, and maintain payment history.

### Models (Entities)
1. **Payment**: Payment records
   - Fields: id, orderId (FK), userId (FK), paymentMethod (enum: CREDIT_CARD, DEBIT_CARD, DIGITAL_WALLET), amount, currency, paymentStatus (enum: PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED), stripePaymentIntentId, stripeChargeId, createdAt, updatedAt, completedAt

2. **Transaction**: Detailed transaction log
   - Fields: id, paymentId (FK), transactionType (enum: CHARGE, REFUND, PARTIAL_REFUND), amount, status, stripeTransactionId, description, createdAt

3. **Refund**: Refund records
   - Fields: id, paymentId (FK), orderId (FK), refundAmount, refundReason, refundStatus (enum: PENDING, PROCESSING, COMPLETED, FAILED), stripeRefundId, requestedBy, processedAt, createdAt

4. **PaymentMethod**: Saved payment methods
   - Fields: id, userId (FK), stripePaymentMethodId, cardLast4, cardBrand, expiryMonth, expiryYear, isDefault, createdAt

### Services
1. **PaymentService**: Core payment operations
   - createPaymentIntent(): Create Stripe payment intent
   - processPayment(): Process payment through Stripe
   - confirmPayment(): Confirm payment completion
   - getPaymentStatus(): Get payment status
   - getUserPaymentHistory(): Get user's payment history
   - capturePayment(): Capture authorized payment

2. **RefundService**: Handle refunds
   - initiateRefund(): Start refund process
   - processRefund(): Process refund through Stripe
   - processPartialRefund(): Refund partial amount
   - getRefundStatus(): Check refund status
   - getOrderRefunds(): Get all refunds for order

3. **PaymentMethodService**: Manage saved payment methods
   - savePaymentMethod(): Save customer payment method
   - deletePaymentMethod(): Remove payment method
   - getUserPaymentMethods(): Get all saved methods
   - setDefaultPaymentMethod(): Set default method
   - validatePaymentMethod(): Verify payment method is valid

4. **StripeWebhookService**: Handle Stripe webhooks
   - handlePaymentSucceeded(): Process successful payment webhook
   - handlePaymentFailed(): Process failed payment webhook
   - handleRefundCompleted(): Process refund completion
   - verifyWebhookSignature(): Validate webhook authenticity

### Controllers (API Endpoints)
1. **PaymentController**:
   - POST /api/payments/intent: Create payment intent (body: orderId, amount)
   - POST /api/payments/process: Process payment (body: paymentIntentId, orderId)
   - GET /api/payments/{paymentId}: Get payment details
   - GET /api/payments/{paymentId}/status: Get payment status
   - GET /api/users/{userId}/payments: Get payment history

2. **RefundController**:
   - POST /api/payments/{paymentId}/refund: Initiate refund (body: amount, reason)
   - GET /api/payments/{paymentId}/refunds: Get payment refunds
   - GET /api/refunds/{refundId}: Get refund details
   - GET /api/refunds/{refundId}/status: Get refund status

3. **PaymentMethodController**:
   - POST /api/payment-methods: Save payment method (body: stripePaymentMethodId)
   - GET /api/users/{userId}/payment-methods: Get saved methods
   - DELETE /api/payment-methods/{paymentMethodId}: Delete payment method
   - PUT /api/payment-methods/{paymentMethodId}/set-default: Set as default

4. **StripeWebhookController**:
   - POST /api/webhooks/stripe: Handle Stripe webhooks

### Expected Outcomes
- Secure payment processing via Stripe
- Complete payment transaction history
- Refund management system
- Saved payment methods for returning customers
- Webhook handling for asynchronous payment events

### Key Responsibilities
- Never store sensitive card information (use Stripe tokens)
- Implement Stripe payment intents flow
- Handle payment confirmation asynchronously
- Verify webhook signatures for security
- Coordinate with Order Service to update order status
- Handle payment failures gracefully
- Implement idempotency for payment operations
- Calculate and handle payment fees
- Support multiple currencies
- Handle partial refunds for partial returns
- Log all payment activities for audit
- Implement retry logic for failed transactions

---

## Service 9: Shipping & Tracking Service

### Purpose
Calculate shipping costs, manage shipment creation, integrate with carriers, and provide real-time tracking.

### Models (Entities)
1. **Shipment**: Shipment information
   - Fields: id, orderId (FK), carrierId (FK), trackingNumber, shipmentStatus (enum: PENDING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED, RETURNED), shippingMethod, estimatedDeliveryDate, actualDeliveryDate, shippingCost, weight, dimensions, createdAt, updatedAt

2. **ShippingCarrier**: Supported carriers
   - Fields: id, carrierName, carrierCode, apiEndpoint, isActive, supportedServices

3. **TrackingEvent**: Tracking history
   - Fields: id, shipmentId (FK), eventType (enum: CREATED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, EXCEPTION), eventDescription, location, eventTimestamp, createdAt

4. **ShippingRate**: Cached shipping rates
   - Fields: id, carrierId, originZone, destinationZone, weightRange, baseRate, perKgRate, estimatedDays

### Services
1. **ShippingService**: Core shipping operations
   - createShipment(): Create shipment for order
   - getShipmentByOrder(): Get shipment for order
   - updateShipmentStatus(): Update shipment status
   - schedulePickup(): Schedule carrier pickup
   - cancelShipment(): Cancel shipment
   - generateShippingLabel(): Generate label (PDF)

2. **ShippingCalculationService**: Calculate shipping costs
   - calculateShippingCost(): Calculate cost based on weight, destination
   - getAvailableShippingMethods(): Get all available methods
   - getEstimatedDeliveryDate(): Estimate delivery date
   - compareCarriers(): Compare rates across carriers

3. **TrackingService**: Track shipments
   - getTrackingDetails(): Get current tracking info
   - getTrackingHistory(): Get all tracking events
   - updateTrackingFromCarrier(): Sync with carrier API
   - subscribeToTracking(): Enable tracking notifications
   - getDeliveryProof(): Get proof of delivery

4. **ShippingCarrierService**: Manage carriers
   - addCarrier(): Add new carrier
   - updateCarrier(): Update carrier details
   - getActiveCarriers(): Get available carriers
   - testCarrierConnection(): Test carrier API connection

### Controllers (API Endpoints)
1. **ShipmentController**:
   - POST /api/shipments: Create shipment (body: orderId, carrierId, shippingMethod)
   - GET /api/shipments/{shipmentId}: Get shipment details
   - GET /api/orders/{orderId}/shipment: Get shipment for order
   - PUT /api/shipments/{shipmentId}/status: Update shipment status
   - POST /api/shipments/{shipmentId}/pickup: Schedule pickup
   - PUT /api/shipments/{shipmentId}/cancel: Cancel shipment
   - GET /api/shipments/{shipmentId}/label: Get shipping label

2. **ShippingCalculationController**:
   - POST /api/shipping/calculate: Calculate shipping cost (body: orderId, destinationZipCode, weight)
   - GET /api/shipping/methods: Get available shipping methods
   - POST /api/shipping/estimate-delivery: Get delivery estimate (body: carrierId, destination)
   - POST /api/shipping/compare: Compare carrier rates

3. **TrackingController**:
   - GET /api/tracking/{trackingNumber}: Get tracking details
   - GET /api/shipments/{shipmentId}/tracking: Get tracking by shipment
   - GET /api/shipments/{shipmentId}/tracking/history: Get tracking history
   - POST /api/shipments/{shipmentId}/tracking/refresh: Sync with carrier
   - POST /api/tracking/{trackingNumber}/subscribe: Subscribe to updates

4. **ShippingCarrierController**:
   - POST /api/carriers: Add carrier (Admin only)
   - GET /api/carriers: Get all carriers
   - GET /api/carriers/{carrierId}: Get carrier details
   - PUT /api/carriers/{carrierId}: Update carrier
   - POST /api/carriers/{carrierId}/test: Test carrier API

### Expected Outcomes
- Real-time shipment tracking
- Multi-carrier support
- Accurate shipping cost calculations
- Automated tracking updates
- Shipping label generation

### Key Responsibilities
- Integrate with carrier APIs (FedEx, UPS, DHL, etc.)
- Cache shipping rates for performance
- Update tracking information periodically (scheduled job)
- Coordinate with Order Service for status updates
- Calculate accurate shipping costs based on weight/dimensions
- Handle address validation
- Generate carrier-compliant labels
- Handle shipping exceptions (delays, failed delivery)
- Send tracking update notifications
- Support multiple shipping methods (standard, express, overnight)
- Handle international shipments with customs info

---

## Service 10: Notification & Communication Service

### Purpose
Handle all notifications (email, SMS, push), manage notification preferences, and facilitate communication between users and sellers.

### Models (Entities)
1. **Notification**: System notifications
   - Fields: id, userId (FK), notificationType (enum: ORDER_CONFIRMATION, SHIPMENT_UPDATE, PAYMENT_SUCCESS, PAYMENT_FAILED, PRODUCT_REVIEW, LOW_STOCK, PROMOTIONAL), title, message, isRead, priority (enum: LOW, MEDIUM, HIGH), relatedEntityType, relatedEntityId, createdAt, readAt

2. **EmailLog**: Email sending history
   - Fields: id, recipientEmail, emailType, subject, emailStatus (enum: PENDING, SENT, FAILED, BOUNCED), sentAt, failureReason, retryCount, templateName, templateData

3. **NotificationPreference**: User notification preferences
   - Fields: id, userId, emailEnabled, smsEnabled, pushEnabled, orderUpdates, promotionalMessages, productRecommendations, sellerMessages

4. **Message**: User-seller communication
   - Fields: id, conversationId, senderId (FK), receiverId (FK), messageType (enum: TEXT, IMAGE), messageContent, isRead, sentAt, readAt

5. **Conversation**: Message threads
   - Fields: id, userId (FK), sellerId (FK), subject, lastMessageAt, status (enum: OPEN, CLOSED)

### Services
1. **NotificationService**: Core notification operations
   - sendNotification(): Send in-app notification
   - markAsRead(): Mark notification as read
   - getUserNotifications(): Get user's notifications
   - deleteNotification(): Remove notification
   - getUnreadCount(): Get unread notification count
   - markAllAsRead(): Mark all as read

2. **EmailService**: Email operations
   - sendEmail(): Send email using template
   - sendOrderConfirmation(): Send order confirmation email
   - sendShipmentUpdate(): Send shipping update email
   - sendPasswordReset(): Send password reset email
   - sendWelcomeEmail(): Send welcome email
   - sendPromotionalEmail(): Send promotional campaign
   - retryFailedEmails(): Retry failed emails (scheduled)

3. **SMSService**: SMS operations
   - sendSMS(): Send SMS message
   - sendOTP(): Send one-time password
   - sendOrderUpdate(): Send order status via SMS
   - sendDeliveryAlert(): Send delivery notification

4. **NotificationPreferenceService**: Manage preferences
   - getPreferences(): Get user preferences
   - updatePreferences(): Update preferences
   - canSendNotification(): Check if notification is allowed

5. **MessagingService**: User-seller messaging
   - createConversation(): Start new conversation
   - sendMessage(): Send message in conversation
   - getConversations(): Get user's conversations
   - getMessages(): Get messages in conversation
   - markMessageAsRead(): Mark message as read
   - closeConversation(): Close conversation

### Controllers (API Endpoints)
1. **NotificationController**:
   - GET /api/notifications: Get user notifications (query: page, size, unreadOnly)
   - GET /api/notifications/{notificationId}: Get notification details
   - PUT /api/notifications/{notificationId}/read: Mark as read
   - DELETE /api/notifications/{notificationId}: Delete notification
   - PUT /api/notifications/read-all: Mark all as read
   - GET /api/notifications/unread-count: Get unread count

2. **EmailController**:
   - POST /api/emails/send: Send email (Internal API)
   - GET /api/emails/{emailId}: Get email status
   - POST /api/emails/{emailId}/retry: Retry failed email
   - GET /api/users/{userId}/emails: Get user's email history

3. **NotificationPreferenceController**:
   - GET /api/users/{userId}/notification-preferences: Get preferences
   - PUT /api/users/{userId}/notification-preferences: Update preferences

4. **MessagingController**:
   - POST /api/conversations: Create conversation (body: sellerId, subject, initialMessage)
   - GET /api/conversations: Get user's conversations
   - GET /api/conversations/{conversationId}: Get conversation details
   - POST /api/conversations/{conversationId}/messages: Send message
   - GET /api/conversations/{conversationId}/messages: Get messages
   - PUT /api/conversations/{conversationId}/messages/{messageId}/read: Mark as read
   - PUT /api/conversations/{conversationId}/close: Close conversation

### Expected Outcomes
- Multi-channel notification system
- Email template management
- User-controllable notification preferences
- Messaging system between users and sellers
- Reliable email delivery with retry mechanism

### Key Responsibilities
- Integrate email service (SendGrid, AWS SES, etc.)
- Integrate SMS gateway (Twilio, etc.)
- Create email templates for all notification types
- Respect user notification preferences before sending
- Implement rate limiting for notifications
- Handle notification failures and retries
- Send notifications triggered by other services
- Log all communications for audit
- Implement real-time messaging (consider WebSocket)
- Batch promotional emails to avoid spam
- Handle email bounces and complaints
- Send notifications for: order updates, payment status, shipping updates, low stock (sellers), abandoned carts, promotional campaigns
- Listen to events from other services via message queue

---

## Inter-Service Communication

### Communication Patterns

**1. Synchronous Communication (REST APIs)**
- Use for immediate responses needed
- Example: Cart Service calling Inventory Service to check availability
- Implement timeouts and circuit breakers
- Use for critical operations where failure must be known immediately

**2. Asynchronous Communication (Message Queue)**
- Use for non-critical operations
- Example: Order Service publishing "OrderCreated" event
- Notification Service listens and sends confirmation email
- Better for decoupling services and handling high load

**3. Event-Driven Architecture**
- Services publish events when state changes
- Other services subscribe to relevant events
- Example events:
  - UserRegistered
  - OrderPlaced
  - PaymentCompleted
  - OrderShipped
  - ProductOutOfStock

### Service Dependencies

**Authentication Service**: No dependencies (foundational)

**User Management**: Depends on Authentication (userId reference)

**Seller Management**: Depends on Authentication (userId reference)

**Product Catalog**: Depends on Seller Management (sellerId reference)

**Inventory**: Depends on Product Catalog (productId reference)

**Cart**: Depends on Product Catalog, Inventory (for availability checks)

**Order Management**: Depends on Cart, User Management, Payment, Inventory

**Payment**: Depends on Order Management

**Shipping**: Depends on Order Management

**Notification**: Depends on all services (listens to events from all)

### Event Examples

**When Order is Created:**
1. Order Service publishes "OrderCreated" event
2. Inventory Service listens → Confirms stock reservation
3. Payment Service listens → Processes payment
4. Notification Service listens → Sends confirmation email
5. Seller Management Service listens → Notifies seller

**When Payment Succeeds:**
1. Payment Service publishes "PaymentSuccessful" event
2. Order Service listens → Updates order status to CONFIRMED
3. Inventory Service listens → Converts reservation to sale
4. Notification Service listens → Sends payment receipt

**When Order is Shipped:**
1. Shipping Service publishes "OrderShipped" event
2. Order Service listens → Updates order status
3. Notification Service listens → Sends shipping notification with tracking

---

## Database Design Guidelines

### General Principles

1. **Each service has its own database/schema**
   - No direct database access between services
   - Ensures loose coupling
   - Allows independent scaling

2. **Use appropriate indexes**
   - Index foreign keys
   - Index frequently queried fields
   - Index fields used in WHERE clauses

3. **Implement soft deletes where appropriate**
   - Use `isDeleted` flag or `deletedAt` timestamp
   - Never hard delete orders, payments, or audit records

4. **Include audit fields on all entities**
   - `createdAt`: When record was created
   - `updatedAt`: When record was last modified
   - `createdBy`: Who created (optional)
   - `updatedBy`: Who modified (optional)

5. **Use appropriate data types**
   - Use DECIMAL for money values (never FLOAT)
   - Use TIMESTAMP for date/time fields
   - Use TEXT for large text fields
   - Use VARCHAR with appropriate length

6. **Define foreign key constraints**
   - Enforce referential integrity
   - Use appropriate cascade options
   - Consider orphan records handling

7. **Version control migrations**
   - Use Flyway or Liquibase for migrations
   - Never modify existing migrations
   - Test migrations before deploying

### Naming Conventions

- **Tables**: Singular noun (e.g., `product`, not `products`)
- **Primary keys**: `id`
- **Foreign keys**: `{referenced_table}_id` (e.g., `user_id`, `product_id`)
- **Boolean fields**: `is_{property}` or `has_{property}` (e.g., `is_active`, `has_permission`)
- **Date fields**: `{action}_at` (e.g., `created_at`, `shipped_at`)

### Transaction Management

- Use `@Transactional` annotation on service methods
- Keep transactions as short as possible
- Avoid nested transactions
- Handle rollback scenarios explicitly
- Consider using REQUIRES_NEW for independent operations

---

## Final Implementation Checklist

### For Each Service Developer:

**Phase 1: Setup & Planning**
- [ ] Review this documentation thoroughly
- [ ] Understand your service responsibilities
- [ ] Identify dependencies on other services
- [ ] Design database schema
- [ ] Define API contracts (document endpoints)
- [ ] Set up project structure

**Phase 2: Development**
- [ ] Create all model entities with proper relationships
- [ ] Implement repository interfaces
- [ ] Create custom exception classes
- [ ] Implement service layer with business logic
- [ ] Implement exception transformation in services
- [ ] Create mappers for entity-DTO conversion
- [ ] Implement controllers with proper exception handling
- [ ] Create global exception handler
- [ ] Add input validation
- [ ] Implement security (authentication/authorization)

**Phase 3: Integration**
- [ ] Document all API endpoints (Swagger/OpenAPI)
- [ ] Test integration with dependent services
- [ ] Implement async communication where needed
- [ ] Add logging for debugging
- [ ] Handle edge cases

**Phase 4: Testing & Refinement**
- [ ] Write unit tests for services
- [ ] Write integration tests for controllers
- [ ] Test exception handling paths
- [ ] Test with invalid inputs
- [ ] Performance testing
- [ ] Security testing

**Phase 5: Deployment Preparation**
- [ ] Configure database connection
- [ ] Set up environment variables
- [ ] Create database migration scripts
- [ ] Document configuration requirements
- [ ] Prepare deployment documentation

---

## Best Practices

1. **Never expose entities directly in APIs** - Always use DTOs
2. **Validate input at controller level** - Use Bean Validation annotations
3. **Keep controllers thin** - Business logic belongs in services
4. **Make services transactional** - Use @Transactional appropriately
5. **Log meaningful information** - Include request IDs for tracing
6. **Handle null values properly** - Use Optional where appropriate
7. **Document your code** - Add JavaDoc for public methods
8. **Follow REST conventions** - Use appropriate HTTP methods and status codes
9. **Version your APIs** - Plan for backward compatibility
10. **Think about security** - Validate permissions, sanitize inputs, protect sensitive data

---

## Support & Collaboration

- Hold regular team sync meetings to discuss integration points
- Share API documentation early and update frequently
- Communicate breaking changes immediately
- Help each other with integration issues
- Review each other's code for consistency
- Maintain a shared repository for common DTOs and utilities

---

**Remember**: This is a team effort. Communication is key to building a successful microservices architecture. When in doubt, ask questions and collaborate with your teammates!

