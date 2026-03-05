import { api } from '../../service/api';
import { DiscountRule, CreateDiscountDto } from '../models/Discount';

export const discountService = {
  getAll: async (): Promise<DiscountRule[]> => {
    const response = await api.get('/discounts');
    return response.data;
  },

  getById: async (id: number): Promise<DiscountRule> => {
    const response = await api.get(`/discounts/${id}`);
    return response.data;
  },

  create: async (data: CreateDiscountDto): Promise<DiscountRule> => {
    const response = await api.post('/discounts', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateDiscountDto>): Promise<DiscountRule> => {
    const response = await api.put(`/discounts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/discounts/${id}`);
  },
};
