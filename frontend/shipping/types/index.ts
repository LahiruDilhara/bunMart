// ─── Driver ────────────────────────────────────────────────────────────────
export interface Driver {
  driver_id: number;
  name: string;
  phone: string;
  active: boolean;
}

export interface DriverDTO {
  name: string;
  phone: string;
  active: boolean;
}

// ─── Vehicle ───────────────────────────────────────────────────────────────
export type VehicleType = "VAN" | "CAR" | "BIKE" | "TRUCK";

export interface Vehicle {
  vehicle_id: number;
  plate_number: string;
  type: VehicleType;
  active: boolean;
}

export interface VehicleDTO {
  vehicle_id?: number;
  plate_number: string;
  type: VehicleType;
  active: boolean;
}

// ─── Shipping Intent ───────────────────────────────────────────────────────
export type ShippingIntentStatus =
  | "PENDING"
  | "ASSIGNED"
  | "COMPLETED"
  | "CANCELLED";

export interface ShippingIntent {
  shipping_intent_id: number;
  orderId: string;
  userId: number;
  addressId: number;
  status: ShippingIntentStatus;
  created_at: string;
}

// ─── Shipment ──────────────────────────────────────────────────────────────
export type ShippingStatus =
  | "PENDING"
  | "DISPATCHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED";

export interface Shipment {
  intentName: string;
  driver: unknown;
  vehicle: unknown;
  shipmentId: number;
  trackingNumber: number;
  driverId: number;
  vehicleId: number;
  shippingIntentId: number;
  status: ShippingStatus;
  startedAt: string | null;
  deliveredAt: string | null;
}

export interface ShipmentDTO {
  shipmentId?: number;
  trackingNumber?: number;
  driverId: number;
  vehicleId: number;
  shippingIntentId: number;
  status: string;
  startedAt?: string | null;
  deliveredAt?: string | null;
}

export interface ShippingIntentDTO {
  shipping_intent_id?: number;
  orderId: string;
  userId: number;
  addressId: number;
  status?: ShippingIntentStatus;
  created_at?: string;
}

// ─── UI Helpers ────────────────────────────────────────────────────────────
export interface StatCard {
  label: string;
  value: number | string;
  sub: string;
  color: "orange" | "green" | "blue" | "yellow";
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  section: string;
}
