export interface Campaign {
  id?: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCampaignDto {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}