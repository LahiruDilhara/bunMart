/**
 * Order types (mirrors backend order service DTOs).
 */

export interface OrderProductItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  userId: string;
  shippingAddress: string;
  products: OrderProductItem[];
  subtotal: string;
  discountTotal?: string;
  shippingTotal?: string;
  taxTotal?: string;
  total: string;
  currencyCode?: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  subtotal: string;
  discountTotal: string | null;
  shippingTotal: string | null;
  taxTotal: string | null;
  total: string;
  currencyCode: string | null;
  shippingAddress: string | null;
  shipmentId: string | null;
  paymentId: string | null;
  products: OrderProductItem[];
  createdAt: string;
  updatedAt: string;
}

export function isUnpaidOrder(status: string): boolean {
  const s = (status || "").toLowerCase().replace("-", "_");
  return s === "pending" || s === "await_payment";
}

/** Whether the order can be cancelled by the user (mirrors backend OrderStatus.canCancel). */
export function canCancelOrder(status: string): boolean {
  if (!status) return false;
  const s = status.trim().toLowerCase().replace("-", "_");
  return s === "pending" || s === "await_payment" || s === "paid" || s === "confirmed";
}

/** Group order status for dashboard counts. */
export function getOrderStatusGroup(status: string): "unpaid" | "paid" | "cancelled" | "processing" | "on_kitchen" | "delivering" | "delivered" | "other" {
  const s = (status || "").toLowerCase().replace("-", "_");
  if (s === "pending" || s === "await_payment") return "unpaid";
  if (s === "paid") return "paid";
  if (s === "cancelled") return "cancelled";
  if (s === "confirmed") return "processing";
  if (s === "in_progress" || s === "prepared") return "on_kitchen";
  if (s === "shipped") return "delivering";
  if (s === "delivered") return "delivered";
  return "other";
}
