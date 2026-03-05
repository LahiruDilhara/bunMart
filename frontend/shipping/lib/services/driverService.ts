import type { DriverDTO } from "@/shipping/types";

const BASE_URL = "http://localhost:8080/api/v1/shipping/driver";

export const driverService = {
  async getAll() {
    const res = await fetch(`${BASE_URL}/all-drivers`);
    if (!res.ok) throw new Error("Failed to fetch drivers");
    return res.json();
  },

  async create(dto: DriverDTO) {
    const res = await fetch(`${BASE_URL}/create-driver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to create driver");
    return res.json();
  },

  async update(id: number, dto: DriverDTO) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to update driver");
    return res.json();
  },

  async delete(id: number) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete driver");
    return res.text();
  },
};