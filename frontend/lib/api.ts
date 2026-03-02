import type {
  Driver,
  DriverDTO,
  Vehicle,
  VehicleDTO,
  ShippingIntent,
  ShippingIntentDTO,
  ShippingIntentStatus,
  Shipment,
  ShipmentDTO,
  ShippingStatus,
} from "@/types";

// ─── Base URL ──────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ─── Endpoint Definitions ──────────────────────────────────────────────────
export const ENDPOINTS = {
  // Drivers
  DRIVERS: {
    CREATE: `${BASE_URL}/api/v1/shipping/driver/create-driver`,
    GET_ALL: `${BASE_URL}/api/v1/shipping/driver/all-drivers`,
    GET_BY_ID: (id: number) => `${BASE_URL}/api/v1/shipping/driver/${id}`,
    UPDATE: (id: number) => `${BASE_URL}/api/v1/shipping/driver/${id}`,
    DELETE: (id: number) => `${BASE_URL}/api/v1/shipping/driver/${id}`,
  },
  // Vehicles
  VEHICLES: {
    CREATE: `${BASE_URL}/api/v1/shipping/vehicle/create-vehicle`,
    GET_ALL: `${BASE_URL}/api/v1/shipping/vehicle/all-vehicle`,
    GET_BY_ID: (id: number) => `${BASE_URL}/api/v1/shipping/vehicle/${id}`,
    UPDATE: (id: number) => `${BASE_URL}/api/v1/shipping/vehicle/${id}`,
    DELETE: (id: number) => `${BASE_URL}/api/v1/shipping/vehicle/${id}`,
  },
  // Shipping Intents
  SHIPPING_INTENTS: {
    CREATE: `${BASE_URL}/api/v1/shipping/shipping-intents/create-intent`,
    GET_BY_ID: (id: number) =>
      `${BASE_URL}/api/v1/shipping/shipping-intents/${id}`,
    GET_BY_STATUS: (status: ShippingIntentStatus) =>
      `${BASE_URL}/api/v1/shipping/shipping-intents/status/${status}`,
    UPDATE_STATUS: (id: number) =>
      `${BASE_URL}/api/v1/shipping/shipping-intents/${id}`,
  },
  // Shipments
  SHIPMENTS: {
    CREATE: `${BASE_URL}/api/shipments/create-shipment`,
    GET_ALL: `${BASE_URL}/api/shipments/all-shipments`,
    GET_BY_ID: (id: number) => `${BASE_URL}/api/shipments/${id}`,
    GET_BY_TRACKING: (trackingNumber: number) =>
      `${BASE_URL}/api/shipments/tracking/${trackingNumber}`,
    UPDATE_STATUS: (id: number) => `${BASE_URL}/api/shipments/${id}`,
    ASSIGN: (id: number) => `${BASE_URL}/api/shipments/${id}/assign`,
    DELETE: (id: number) => `${BASE_URL}/api/shipments/${id}`,
  },
};

// ─── Generic fetch helper ──────────────────────────────────────────────────
async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Driver Service ────────────────────────────────────────────────────────
export const driverService = {
  getAll: () => apiFetch<Driver[]>(ENDPOINTS.DRIVERS.GET_ALL),
  getById: (id: number) =>
    apiFetch<Driver>(ENDPOINTS.DRIVERS.GET_BY_ID(id)),
  create: (dto: DriverDTO) =>
    apiFetch<Driver>(ENDPOINTS.DRIVERS.CREATE, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  update: (id: number, dto: DriverDTO) =>
    apiFetch<Driver>(ENDPOINTS.DRIVERS.UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(dto),
    }),
  delete: (id: number) =>
    apiFetch<string>(ENDPOINTS.DRIVERS.DELETE(id), { method: "DELETE" }),
};

// ─── Vehicle Service ───────────────────────────────────────────────────────
export const vehicleService = {
  getAll: () => apiFetch<Vehicle[]>(ENDPOINTS.VEHICLES.GET_ALL),
  getById: (id: number) =>
    apiFetch<Vehicle>(ENDPOINTS.VEHICLES.GET_BY_ID(id)),
  create: (dto: VehicleDTO) =>
    apiFetch<Vehicle>(ENDPOINTS.VEHICLES.CREATE, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  update: (id: number, dto: VehicleDTO) =>
    apiFetch<Vehicle>(ENDPOINTS.VEHICLES.UPDATE(id), {
      method: "PUT",
      body: JSON.stringify(dto),
    }),
  delete: (id: number) =>
    apiFetch<string>(ENDPOINTS.VEHICLES.DELETE(id), { method: "DELETE" }),
};

// ─── Shipping Intent Service ───────────────────────────────────────────────
export const shippingIntentService = {
  getById: (id: number) =>
    apiFetch<ShippingIntent>(ENDPOINTS.SHIPPING_INTENTS.GET_BY_ID(id)),
  getByStatus: (status: ShippingIntentStatus) =>
    apiFetch<ShippingIntent[]>(
      ENDPOINTS.SHIPPING_INTENTS.GET_BY_STATUS(status)
    ),
  create: (dto: ShippingIntentDTO) =>
    apiFetch<ShippingIntent>(ENDPOINTS.SHIPPING_INTENTS.CREATE, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  updateStatus: (id: number, status: ShippingIntentStatus) =>
    apiFetch<ShippingIntent>(ENDPOINTS.SHIPPING_INTENTS.UPDATE_STATUS(id), {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// ─── Shipment Service ──────────────────────────────────────────────────────
export const shipmentService = {
  getAll: () => apiFetch<Shipment[]>(ENDPOINTS.SHIPMENTS.GET_ALL),
  getById: (id: number) =>
    apiFetch<Shipment>(ENDPOINTS.SHIPMENTS.GET_BY_ID(id)),
  getByTracking: (trackingNumber: number) =>
    apiFetch<Shipment>(ENDPOINTS.SHIPMENTS.GET_BY_TRACKING(trackingNumber)),
  create: (dto: ShipmentDTO) =>
    apiFetch<Shipment>(ENDPOINTS.SHIPMENTS.CREATE, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  updateStatus: (id: number, status: ShippingStatus) =>
    apiFetch<Shipment>(ENDPOINTS.SHIPMENTS.UPDATE_STATUS(id), {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  assignDriverAndVehicle: (
    shipmentId: number,
    driverId: number,
    vehicleId: number
  ) =>
    apiFetch<Shipment>(ENDPOINTS.SHIPMENTS.ASSIGN(shipmentId), {
      method: "PATCH",
      body: JSON.stringify({ driverId, vehicleId }),
    }),
  delete: (id: number) =>
    apiFetch<string>(ENDPOINTS.SHIPMENTS.DELETE(id), { method: "DELETE" }),
};
