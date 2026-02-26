/**
 * Cart-related data models for request/response with the cart backend service.
 */

/** Single line item in the cart (product + quantity). */
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  /** Optional unit label e.g. "500g", "4-Pack" */
  unit?: string;
}

/** Full cart response from backend. */
export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  /** Applied promo code if any */
  promoCode?: string;
  /** Order summary calculated by backend */
  summary: OrderSummary;
}

/** Order summary (subtotal, delivery, tax, total). */
export interface OrderSummary {
  subtotal: number;
  delivery: number;
  tax: number;
  total: number;
  /** Optional message e.g. free delivery threshold */
  message?: string;
}

/** Request to update item quantity. */
export interface UpdateQuantityRequest {
  itemId: string;
  quantity: number;
}

/** Request to apply a promo code. */
export interface ApplyPromoRequest {
  code: string;
}

/** Response from apply promo (success or error message). */
export interface ApplyPromoResponse {
  success: boolean;
  message?: string;
  summary?: OrderSummary;
}
