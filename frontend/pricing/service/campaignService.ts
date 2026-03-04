import { apiClient } from './api-client';
import { Campaign } from '../models/Campaign';

export const campaignService = {
  getAll: async (): Promise<Campaign[]> => {
    const response = await apiClient.get('/campaigns');
    return response.data;
  },

  getById: async (id: number): Promise<Campaign> => {
    const response = await apiClient.get(`/campaigns/${id}`);
    return response.data;
  },

  create: async (campaign: Omit<Campaign, 'id'>): Promise<Campaign> => {
    const response = await apiClient.post('/campaigns', campaign);
    return response.data;
  },

  update: async (id: number, campaign: Partial<Campaign>): Promise<Campaign> => {
    const response = await apiClient.put(`/campaigns/${id}`, campaign);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/campaigns/${id}`);
  },
};