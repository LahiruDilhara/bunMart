/**
 * Payment types (mirrors backend payment service DTOs).
 */

export interface CreatePaymentForOrderRequest {
  orderId: string;
  userId: string;
}

export interface StripeCheckoutResponse {
  redirectUrl: string;
}

export interface Payment {
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  currencyCode: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
