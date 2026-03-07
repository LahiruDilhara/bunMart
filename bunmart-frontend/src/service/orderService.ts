import api from "./api";
import type { Order, CreateOrderRequest } from "@/model/order";

const prefix = "/order";

export interface OrderPage {
  content: Order[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export async function createOrder(body: CreateOrderRequest): Promise<Order> {
  const { data } = await api.post<Order>(prefix, body);
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get<Order>(`${prefix}/${id}`);
  return data;
}

export async function getOrdersByUser(userId: string): Promise<Order[]> {
  const { data } = await api.get<Order[]>(`${prefix}/user/${encodeURIComponent(userId)}`);
  return data;
}

/** Admin: paginated list with optional status filter. */
export async function getOrders(params?: {
  status?: string;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<OrderPage> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.size != null) searchParams.set("size", String(params.size));
  const q = searchParams.toString();
  const { data } = await api.get<OrderPage>(`${prefix}${q ? `?${q}` : ""}`);
  return data;
}

export async function updateOrderShippingAddress(
  orderId: string,
  shippingAddress: string
): Promise<Order> {
  const { data } = await api.patch<Order>(`${prefix}/${orderId}/shipping-address`, {
    shippingAddress,
  });
  return data;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const { data } = await api.post<Order>(`${prefix}/${orderId}/cancel`);
  return data;
}
