import { api } from '../../service/api';
import { Coupon, CreateCouponDto } from '../models/Coupon';

export const couponService = {
  getAll: async (): Promise<Coupon[]> => {
    const response = await api.get('/coupons');
    return response.data;
  },

  getById: async (id: number): Promise<Coupon> => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },

  create: async (data: CreateCouponDto): Promise<Coupon> => {
    const response = await api.post('/coupons', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateCouponDto>): Promise<Coupon> => {
    const response = await api.put(`/coupons/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/coupons/${id}`);
  },

  findByCode: async (code: string): Promise<Coupon> => {
    const response = await api.get(`/coupons/code/${code}`);
    return response.data;
  },
};
