import type { Vehicle, VehicleDTO } from "@/shipping/types";

const BASE_URL = "http://localhost:8080/api/v1/shipping/vehicle";

export const vehicleService = {
  async getAll(): Promise<Vehicle[]> {
    const res = await fetch(`${BASE_URL}/all-vehicles`);
    if (!res.ok) throw new Error("Failed to fetch vehicles");
    return res.json();
  },

  async create(dto: VehicleDTO): Promise<Vehicle> {
    const res = await fetch(`${BASE_URL}/create-vehicle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to create vehicle");
    return res.json();
  },

  async update(id: number, dto: VehicleDTO): Promise<Vehicle> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error("Failed to update vehicle");
    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete vehicle");
  },
};