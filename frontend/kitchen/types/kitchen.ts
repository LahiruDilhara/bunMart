// Matches backend ProductionOrderResponseDTO
export interface ProductionOrder {
  id: string;
  userOrderId: string;
  phase: Phase;
  progressPercent: number;
  notes: string | null;
  lines: ProductionLine[];
  images: PreparationImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionLine {
  productId: string;
  quantity: number;
}

export interface PreparationImage {
  id: string;
  imageUrl: string;
}

export type Phase = 'PREPARING' | 'BAKING' | 'COMPLETED';

// Matches backend UpdatePhaseRequestDTO
export interface UpdatePhaseRequest {
  phase: Phase;
  progressPercent: number;
}

// Matches backend UpdateNotesRequestDTO
export interface UpdateNotesRequest {
  notes: string;
}

// Matches backend AddImageRequestDTO
export interface AddImageRequest {
  imageUrl: string;
}
