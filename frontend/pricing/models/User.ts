export interface User {
  id?: number;
  userId: string;
  userSegment?: string;
  loyaltyTier?: string;
  totalSpent?: number;
  orderCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}