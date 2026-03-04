export interface Coupon {
  id?: number;
  code: string;
  type: string;
  value: number;
  description?: string;
  minOrderAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  isActive?: boolean;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CouponFormData {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  description: string;
  minOrderAmount: number;
  usageLimit: number;
  expiresAt: string;
  isActive: boolean;
}