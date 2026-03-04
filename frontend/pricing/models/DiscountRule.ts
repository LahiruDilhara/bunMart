export interface DiscountRule {
  id?: number;
  productId?: string;
  campaignId?: number;
  type: string;
  value: number;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DiscountRuleFormData {
  productId: string;
  campaignId?: number;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  description: string;
  isActive: boolean;
}