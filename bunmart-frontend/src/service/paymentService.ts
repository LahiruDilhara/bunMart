import api from "./api";
import type { CreatePaymentForOrderRequest, StripeCheckoutResponse } from "@/model/payment";

const prefix = "/payment";

export async function createPaymentForOrder(
  orderId: string,
  userId: string
): Promise<StripeCheckoutResponse> {
  const { data } = await api.post<StripeCheckoutResponse>(`${prefix}/create-for-order`, {
    orderId,
    userId,
  });
  return data;
}
