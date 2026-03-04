export interface Campaign {
  id?: number;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  discountRules?: DiscountRule[];
}

export interface CampaignFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}