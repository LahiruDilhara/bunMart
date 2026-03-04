import { apiClient } from './api-client';
import { DiscountRule } from '../models/DiscountRule';

export const discountService = {
  getAll: async (): Promise<DiscountRule[]> => {
    const response = await apiClient.get('/discounts');
    return response.data;
  },

  getById: async (id: number): Promise<DiscountRule> => {
    const response = await apiClient.get(`/discounts/${id}`);
    return response.data;
  },

  create: async (discount: Omit<DiscountRule, 'id'>): Promise<DiscountRule> => {
    const response = await apiClient.post('/discounts', discount);
    return response.data;
  },

  update: async (id: number, discount: Partial<DiscountRule>): Promise<DiscountRule> => {
    const response = await apiClient.put(`/discounts/${id}`, discount);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/discounts/${id}`);
  },

  getByProductIds: async (productIds: string[]): Promise<DiscountRule[]> => {
    const response = await apiClient.post('/discounts/products', { productIds });
    return response.data;
  },
};