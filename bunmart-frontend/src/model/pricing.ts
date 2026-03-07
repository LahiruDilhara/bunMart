/**
 * Pricing service DTOs (mirrors backend pricing service).
 */

export interface PricingProduct {
  id: string;
  name: string;
  rawPrice: number;
  tax: number;
  shippingCost: number;
  currencyCode: string;
  isActive: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePricingProductRequest {
  id: string;
  name: string;
  rawPrice: number;
  tax: number;
  shippingCost: number;
  currencyCode?: string;
}

export interface UpdatePricingProductRequest {
  name?: string;
  rawPrice?: number;
  tax?: number;
  shippingCost?: number;
  currencyCode?: string;
  isActive?: boolean;
}

export interface Discount {
  id: number;
  productId: string;
  minQuantity: number;
  type: string;
  value: number;
  description: string | null;
  isActive: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDiscountRequest {
  productId: string;
  minQuantity: number;
  type: string;
  value: number;
  description?: string;
}

export interface UpdateDiscountRequest {
  productId?: string;
  minQuantity?: number;
  type?: string;
  value?: number;
  description?: string;
  isActive?: boolean;
}

export interface Coupon {
  id: number;
  code: string;
  productId: string | null;
  minQuantity: number | null;
  type: string;
  value: number;
  description: string | null;
  minOrderAmount: number | null;
  usageLimit: number | null;
  usedCount: number | null;
  isActive: boolean | null;
  expiresAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCouponRequest {
  code: string;
  productId?: string;
  minQuantity?: number;
  type: string;
  value: number;
  description?: string;
  minOrderAmount?: number;
  usageLimit?: number;
  expiresAt?: string;
}

export interface UpdateCouponRequest {
  code?: string;
  productId?: string;
  minQuantity?: number;
  type?: string;
  value?: number;
  description?: string;
  minOrderAmount?: number;
  usageLimit?: number;
  isActive?: boolean;
  expiresAt?: string;
}

/** Request for POST /pricing/calculate */
export interface CalculatePriceRequest {
  items: { productId: string; quantity: number }[];
  couponCode?: string;
}

/** Response from POST /pricing/calculate */
export interface LineItemPrice {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineShipping: number;
  lineTax: number;
  lineTotal: number;
  discountDescription: string | null;
}

export interface CalculatePriceResponse {
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  currencyCode: string;
  lineItems: LineItemPrice[];
}
