import { apiClient } from './api-client';
import { PriceRule } from '../models/PriceRule';

export const priceRuleService = {
  getAll: async (): Promise<PriceRule[]> => {
    const response = await apiClient.get('/prices');
    return response.data;
  },

  getById: async (id: number): Promise<PriceRule> => {
    const response = await apiClient.get(`/prices/${id}`);
    return response.data;
  },

  create: async (priceRule: Omit<PriceRule, 'id'>): Promise<PriceRule> => {
    const response = await apiClient.post('/prices', priceRule);
    return response.data;
  },

  update: async (id: number, priceRule: Partial<PriceRule>): Promise<PriceRule> => {
    const response = await apiClient.put(`/prices/${id}`, priceRule);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/prices/${id}`);
  },

  getByProductId: async (productId: string): Promise<PriceRule[]> => {
    const response = await apiClient.get(`/prices/product/${productId}`);
    return response.data;
  },
};