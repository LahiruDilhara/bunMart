import api from "./api";
import { apiPaths } from "@/config/api";
import type { KitchenOrderResponseDTO } from "@/model/kitchen";

const prefix = apiPaths.kitchen;

export async function getAllKitchenOrders(): Promise<KitchenOrderResponseDTO[]> {
  const { data } = await api.get<KitchenOrderResponseDTO[]>(prefix);
  return data;
}

export async function getKitchenOrdersByOrderId(orderId: string): Promise<KitchenOrderResponseDTO[]> {
  const { data } = await api.get<KitchenOrderResponseDTO[]>(`${prefix}/order/${encodeURIComponent(orderId)}`);
  return data;
}

export async function getKitchenOrder(id: string): Promise<KitchenOrderResponseDTO> {
  const { data } = await api.get<KitchenOrderResponseDTO>(`${prefix}/${id}`);
  return data;
}

export async function createKitchenOrder(body: {
  userId: string;
  orderId: string;
  lines: { productId: string; quantity: number }[];
}): Promise<KitchenOrderResponseDTO> {
  const { data } = await api.post<KitchenOrderResponseDTO>(prefix, body);
  return data;
}

export async function updateKitchenOrderStatus(
  id: string,
  status: string
): Promise<KitchenOrderResponseDTO> {
  const { data } = await api.put<KitchenOrderResponseDTO>(`${prefix}/${id}/status`, { status });
  return data;
}

export async function updateLineProgress(
  kitchenOrderId: string,
  lineId: string,
  progress: number
): Promise<KitchenOrderResponseDTO> {
  const { data } = await api.put<KitchenOrderResponseDTO>(
    `${prefix}/${kitchenOrderId}/lines/${lineId}/progress`,
    { progress: Math.round(progress) }
  );
  return data;
}

export async function updateLineStatus(
  kitchenOrderId: string,
  lineId: string,
  status: string
): Promise<KitchenOrderResponseDTO> {
  const { data } = await api.put<KitchenOrderResponseDTO>(
    `${prefix}/${kitchenOrderId}/lines/${lineId}/status`,
    { status }
  );
  return data;
}

export async function stopKitchenOrder(id: string): Promise<KitchenOrderResponseDTO> {
  const { data } = await api.post<KitchenOrderResponseDTO>(`${prefix}/${id}/stop`);
  return data;
}
