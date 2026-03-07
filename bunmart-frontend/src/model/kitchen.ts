/**
 * Kitchen order types (mirrors backend kitchen service DTOs).
 */

export interface KitchenOrderLineDTO {
  id: string;
  productId: string;
  quantity: number;
  progress: number;
  status: string; // PENDING, IN_PROGRESS, DONE
}

export interface KitchenOrderResponseDTO {
  id: string;
  userId: string;
  orderId: string;
  status: string; // ACTIVE, STOPPED, COMPLETED
  lines: KitchenOrderLineDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateKitchenOrderRequestDTO {
  userId: string;
  orderId: string;
  lines: { productId: string; quantity: number }[];
}
