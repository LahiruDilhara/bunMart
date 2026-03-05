export interface PriceRule {
  id?: number;
  productId: string;
  unitPrice: number;
  currencyCode?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePriceRuleDto {
  productId: string;
  unitPrice: number;
  currencyCode?: string;
  isActive?: boolean;
}