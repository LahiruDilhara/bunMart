export interface DiscountRule {
  id?: number;
  productId?: string;
  campaignId?: number;
  type: string; // 'PERCENTAGE' or 'FIXED'
  value: number; // Percentage or fixed amount in LKR
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDiscountDto {
  productId?: string;
  campaignId?: number;
  type: string;
  value: number; // Percentage or fixed amount in LKR
  description?: string;
  isActive?: boolean;
}