/**
 * Cart request/response types (aligned with backend CartResponseDTO).
 */

export interface CartItemResponse {
  id: number;
  productId: string;
  quantity: number;
}

/** Enriched item for UI when we have product/pricing data */
export interface CartItem extends CartItemResponse {
  name?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  unit?: string;
  hasImage?: boolean;
}

export interface OrderSummary {
  subtotal: number;
  delivery: number;
  tax: number;
  total: number;
  message?: string;
}

export interface Cart {
  id: number;
  userId: string;
  cartItems: CartItemResponse[];
}

/** For UI when we merge cart with product/pricing data */
export interface CartWithSummary {
  id: number;
  userId: string;
  items: CartItem[];
  summary?: OrderSummary;
}

export interface AddCartItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateQuantityRequest {
  productId: string;
  quantity: number;
}

export interface ApplyPromoRequest {
  code: string;
}

export interface ApplyPromoResponse {
  success: boolean;
  message?: string;
  summary?: OrderSummary;
}
