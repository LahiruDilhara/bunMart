import { apiClient } from './api-client';
import { Coupon } from '../models/Coupon';

export const couponService = {
  getAll: async (): Promise<Coupon[]> => {
    const response = await apiClient.get('/coupons');
    return response.data;
  },

  getById: async (id: number): Promise<Coupon> => {
    const response = await apiClient.get(`/coupons/${id}`);
    return response.data;
  },

  create: async (coupon: Omit<Coupon, 'id'>): Promise<Coupon> => {
    const response = await apiClient.post('/coupons', coupon);
    return response.data;
  },

  update: async (id: number, coupon: Partial<Coupon>): Promise<Coupon> => {
    const response = await apiClient.put(`/coupons/${id}`, coupon);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/coupons/${id}`);
  },

  findByCode: async (code: string): Promise<Coupon> => {
    const response = await apiClient.get(`/coupons/code/${code}`);
    return response.data;
  },
};