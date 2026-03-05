import axios from "axios";
import type { Shipment, ShipmentDTO, ShippingStatus } from "@/shipping/types";

const API = axios.create({
  baseURL: "http://localhost:8080/api/v1/shipments",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Get All Shipments ─────────────────────────
export const getAllShipments = async (): Promise<Shipment[]> => {
  const res = await API.get("/all-shipments");
  return res.data;
};

// ─── Get By ID ─────────────────────────────────
export const getShipmentById = async (id: number): Promise<Shipment> => {
  const res = await API.get(`/${id}`);
  return res.data;
};

// ─── Create Shipment ───────────────────────────
export const createShipment = async (dto: ShipmentDTO): Promise<Shipment> => {
  const res = await API.post("/create-shipment", dto);
  return res.data;
};

// ─── Update Status ─────────────────────────────
export const updateShipmentStatus = async (
  id: number,
  status: ShippingStatus
): Promise<Shipment> => {
  const res = await API.patch(`/${id}`, { status });
  return res.data;
};

// ─── Assign Driver & Vehicle ───────────────────
export const assignDriverAndVehicle = async (
  shipmentId: number,
  driverId: number,
  vehicleId: number
): Promise<Shipment> => {
  const res = await API.patch(`/${shipmentId}/assign`, {
    driverId,
    vehicleId,
  });
  return res.data;
};

// ─── Delete Shipment ───────────────────────────
export const deleteShipment = async (id: number): Promise<void> => {
  await API.delete(`/${id}`);
};

