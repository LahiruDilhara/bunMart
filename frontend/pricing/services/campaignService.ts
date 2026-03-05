import { api } from '../../service/api';
import { Campaign, CreateCampaignDto } from '../models/Campaign';

export const campaignService = {
  getAll: async (): Promise<Campaign[]> => {
    const response = await api.get('/campaigns');
    return response.data;
  },

  getById: async (id: number): Promise<Campaign> => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  create: async (data: CreateCampaignDto): Promise<Campaign> => {
    const response = await api.post('/campaigns', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateCampaignDto>): Promise<Campaign> => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/campaigns/${id}`);
  },
};
