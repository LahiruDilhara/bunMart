/**
 * Profile-related data models.
 *
 * API types  – mirror the Spring Boot DTOs exactly (camelCase from Jackson).
 * UI types   – what components consume (mapped from API types).
 * Error types – structured error handling for backend responses.
 */

// ═══════════════════════════════════════════════════════════
// API response DTOs (match your Spring Boot backend exactly)
// ═══════════════════════════════════════════════════════════

/** GET /api/v1/users/{id} */
export interface UserResponseDTO {
  id: string;
  email: string;
  displayName: string;
  phone: string | null;
  roles: string[];
  active: boolean;
  createdAt: string; // ISO-8601 Instant
  updatedAt: string;
}

/** GET /api/v1/users/{id}/addresses → item */
export interface AddressResponseDTO {
  id: string;
  userId: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  type: string; // e.g. "HOME", "OFFICE", "OTHER"
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════
// API request DTOs
// ═══════════════════════════════════════════════════════════

/** PUT /api/v1/users/{id} */
export interface UpdateUserRequestDTO {
  displayName?: string;
  email?: string;
  phone?: string;
}

/** POST /api/v1/users/{id}/addresses */
export interface CreateAddressRequestDTO {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  type: string;
}

/** PUT /api/v1/users/{id}/addresses/{addrId} */
export interface UpdateAddressRequestDTO {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  type?: string;
}

// ═══════════════════════════════════════════════════════════
// Error types
// ═══════════════════════════════════════════════════════════

/**
 * Spring Boot default error response body.
 * Your backend may customize this – adjust as needed.
 */
export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  /** Validation errors from @Valid (field → message) */
  errors?: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════
// UI models (consumed by components – mapped from API DTOs)
// ═══════════════════════════════════════════════════════════

/** User profile for UI display. */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  active: boolean;
  avatarUrl?: string;
  sidebarAvatarUrl?: string;
  navbarAvatarUrl?: string;
  membershipTier: "Bronze" | "Silver" | "Gold" | "Platinum";
  joinedDate: string;
}

/** A single order line item summary. */
export interface OrderItemSummary {
  productName: string;
  quantity: number;
}

/** Order status type. */
export type OrderStatus =
  | "Baking"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

/** A recent order entry. */
export interface RecentOrder {
  id: string;
  orderNumber: string;
  items: OrderItemSummary[];
  status: OrderStatus;
  total: number;
  imageUrl?: string;
  date?: string;
}

/** A saved address (UI model – mapped from AddressResponseDTO). */
export interface SavedAddress {
  id: string;
  userId: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  type: string;
  /** Derived: first HOME-type address is primary */
  isPrimary: boolean;
}

/** An active subscription. */
export interface Subscription {
  id: string;
  name: string;
  nextDeliveryDate: string;
  iconName?: string;
  frequency?: string;
  price?: number;
}

/** Wishlist item. */
export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  inStock: boolean;
}

/** Full profile dashboard (assembled from multiple API calls). */
export interface ProfileDashboard {
  user: UserProfile;
  recentOrders: RecentOrder[];
  savedAddresses: SavedAddress[];
  subscriptions: Subscription[];
  wishlist: WishlistItem[];
}