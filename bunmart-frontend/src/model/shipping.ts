/**
 * Shipping types (mirrors backend shipping service DTOs).
 */

export type ShippingPackageStatus =
  | "CREATED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "STOPPED"
  | "CANCELLED";

export interface ShippingPackageResponseDTO {
  id: string;
  weight: number;
  destinationAddress: string;
  sourceAddress: string;
  totalPrice: number | string;
  orderId: string;
  shippedAt: string | null;
  progress: number;
  status: ShippingPackageStatus;
  driverId: number | null;
  driverFullName: string | null;
}

export interface CreateShippingPackageRequestDTO {
  weight: number;
  destinationAddress: string;
  sourceAddress: string;
  totalPrice: number | string;
  orderId: string;
  userId?: string;
  driverId?: number;
}

export interface DriverResponseDTO {
  id: number;
  fullName: string;
  age: number | null;
  phone: string | null;
  active: boolean;
  vehicle: string | null;
  cargoSize: number | null;
  maxWeight: number | null;
}

export interface CreateDriverRequestDTO {
  fullName: string;
  age: number;
  phone?: string;
  vehicle?: string;
  cargoSize?: number;
  maxWeight?: number;
}

export interface UpdateDriverRequestDTO {
  fullName?: string;
  age?: number;
  phone?: string;
  active?: boolean;
  vehicle?: string;
  cargoSize?: number;
  maxWeight?: number;
}
