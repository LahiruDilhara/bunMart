import axios from "axios";
import type { Shipment } from "@/types";

// Create axios instance INSIDE this file (as you requested)
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export const trackingService = {
  async getByTrackingNumber(trackingNumber: number): Promise<Shipment> {
    const res = await api.get(`/shipments/tracking/${trackingNumber}`);
    return res.data;
  },
};