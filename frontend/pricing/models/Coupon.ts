export interface Coupon {
  id?: number;
  code: string;
  type: string; // 'PERCENTAGE' or 'FIXED'
  value: number;
  description?: string;
  minOrderAmount?: number; // In LKR
  usageLimit?: number;
  usedCount?: number;
  isActive?: boolean;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCouponDto {
  code: string;
  type: string;
  value: number;
  description?: string;
  minOrderAmount?: number; // In LKR
  usageLimit?: number;
  isActive?: boolean;
  expiresAt?: string;
}