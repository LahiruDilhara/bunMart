import { api } from '../../service/api';
import { PriceRule, CreatePriceRuleDto } from '../models/PriceRule';

export const priceRuleService = {
  getAll: async (): Promise<PriceRule[]> => {
    // Change from '/prices' to '/price-rules'
    const response = await api.get('/price-rules');
    return response.data;
  },

  getById: async (id: number): Promise<PriceRule> => {
    // Change from '/prices/${id}' to '/price-rules/${id}'
    const response = await api.get(`/price-rules/${id}`);
    return response.data;
  },

  create: async (data: CreatePriceRuleDto): Promise<PriceRule> => {
    // Change from '/prices' to '/price-rules'
    const response = await api.post('/price-rules', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreatePriceRuleDto>): Promise<PriceRule> => {
    // Change from '/prices/${id}' to '/price-rules/${id}'
    const response = await api.put(`/price-rules/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    // Change from '/prices/${id}' to '/price-rules/${id}'
    await api.delete(`/price-rules/${id}`);
  },

  getByProductId: async (productId: string): Promise<PriceRule[]> => {
    // This endpoint doesn't exist in your backend - you might need to implement it
    // For now, get all and filter
    const response = await api.get('/price-rules');
    return response.data.filter((rule: PriceRule) => rule.productId === productId);
  },
};