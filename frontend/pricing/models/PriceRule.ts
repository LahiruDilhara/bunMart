export interface PriceRule {
  id?: number;
  productId: string;
  unitPrice: number;
  currencyCode?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PriceRuleFormData {
  productId: string;
  unitPrice: number;
  currencyCode: string;
  isActive: boolean;
}