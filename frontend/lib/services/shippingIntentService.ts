// services/shippingIntentService.ts
import axios from "axios";
import type { ShippingIntentDTO, ShippingIntentStatus } from "@/types";

// Axios instance with baseURL and timeout
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1/shipping/shipping-intents",
  timeout: 5000, // 5 seconds timeout
});

// Optional: global error logging
api.interceptors.response.use(
  response => response,
  error => {
    console.error("Axios error:", error);
    return Promise.reject(error);
  }
);

export const shippingIntentService = {
  /** Get all shipping intents */
  async getAll(): Promise<ShippingIntentDTO[]> {
    const { data } = await api.get("/all-shippingIntents");
    return data;
  },

  /** Create a new shipping intent */
  async create(dto: ShippingIntentDTO): Promise<ShippingIntentDTO> {
    const { data } = await api.post("/create-intent", dto, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  },

  /** Update the status of an existing shipping intent */
  async updateStatus(id: number, status: ShippingIntentStatus): Promise<ShippingIntentDTO> {
    const { data } = await api.patch(`/${id}`, { status }, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  },

  /** Get shipping intents filtered by status */
  async getByStatus(status: ShippingIntentStatus): Promise<ShippingIntentDTO[]> {
    const { data } = await api.get(`/status/${status}`);
    return data;
  },
};