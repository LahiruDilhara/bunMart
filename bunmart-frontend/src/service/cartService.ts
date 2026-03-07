import axios from "axios";
import api from "./api";
import { getStoredUserId } from "./api";
import type {
  Cart,
  AddCartItemRequest,
  UpdateQuantityRequest,
  ApplyPromoRequest,
  ApplyPromoResponse,
} from "@/model/cart";

function cartParams(userId: string): string {
  return `?userId=${encodeURIComponent(userId)}`;
}

export async function getCart(userId: string): Promise<Cart> {
  const { data } = await api.get<Cart>(`/cart${cartParams(userId)}`);
  return data;
}

export async function addCartItem(
  userId: string,
  payload: AddCartItemRequest
): Promise<Cart> {
  const { data } = await api.post<Cart>(
    `/cart/items${cartParams(userId)}`,
    payload
  );
  return data;
}

export async function updateItemQuantity(
  userId: string,
  payload: UpdateQuantityRequest
): Promise<Cart> {
  const { data } = await api.patch<Cart>(
    `/cart/items/${encodeURIComponent(payload.productId)}${cartParams(userId)}`,
    { quantity: payload.quantity }
  );
  return data;
}

export async function removeItem(
  userId: string,
  productId: string
): Promise<Cart> {
  const { data } = await api.delete<Cart>(
    `/cart/items/${encodeURIComponent(productId)}${cartParams(userId)}`
  );
  return data;
}

export async function clearCart(userId: string): Promise<Cart> {
  const { data } = await api.delete<Cart>(`/cart/items${cartParams(userId)}`);
  return data;
}

export async function applyPromoCode(
  _userId: string,
  payload: ApplyPromoRequest
): Promise<ApplyPromoResponse> {
  try {
    const { data } = await api.post<{
      success: boolean;
      message?: string;
      summary?: Cart extends { summary?: infer S } ? S : never;
    }>("/cart/promo", payload);
    if (data.success && (data as { summary?: ApplyPromoResponse["summary"] }).summary)
      return {
        success: true,
        summary: (data as { summary: ApplyPromoResponse["summary"] }).summary,
      };
    return { success: false, message: (data as { message?: string }).message ?? "Invalid code" };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data?.message)
      return { success: false, message: err.response.data.message };
    return { success: false, message: "Invalid or expired code" };
  }
}

export function getCartUserId(): string {
  return getStoredUserId() ?? "guest";
}
