import api from "./api";
import { apiPaths } from "@/config/api";
import type {
  ShippingPackageResponseDTO,
  CreateShippingPackageRequestDTO,
  DriverResponseDTO,
  CreateDriverRequestDTO,
  UpdateDriverRequestDTO,
} from "@/model/shipping";

const prefix = apiPaths.shipping;
const packagesPrefix = `${prefix}/shipping-packages`;
const driversPrefix = `${prefix}/drivers`;

// ——— Shipping packages ———
export async function getAllShippingPackages(): Promise<ShippingPackageResponseDTO[]> {
  const { data } = await api.get<ShippingPackageResponseDTO[]>(packagesPrefix);
  return data;
}

export async function getShippingPackage(id: string): Promise<ShippingPackageResponseDTO> {
  const { data } = await api.get<ShippingPackageResponseDTO>(`${packagesPrefix}/${id}`);
  return data;
}

export async function getShippingPackagesByOrderId(orderId: string): Promise<ShippingPackageResponseDTO[]> {
  const { data } = await api.get<ShippingPackageResponseDTO[]>(
    `${packagesPrefix}/by-order/${encodeURIComponent(orderId)}`
  );
  return data;
}

export async function getShippingPackagesByDriverId(driverId: number): Promise<ShippingPackageResponseDTO[]> {
  const { data } = await api.get<ShippingPackageResponseDTO[]>(`${packagesPrefix}/by-driver/${driverId}`);
  return data;
}

export async function createShippingPackage(
  body: CreateShippingPackageRequestDTO
): Promise<ShippingPackageResponseDTO> {
  const { data } = await api.post<ShippingPackageResponseDTO>(packagesPrefix, body);
  return data;
}

export async function assignDriver(
  packageId: string,
  driverId: number
): Promise<ShippingPackageResponseDTO> {
  const { data } = await api.patch<ShippingPackageResponseDTO>(`${packagesPrefix}/${packageId}/driver`, {
    driverId,
  });
  return data;
}

export async function updateShippingProgress(
  packageId: string,
  progress: number
): Promise<ShippingPackageResponseDTO> {
  const { data } = await api.patch<ShippingPackageResponseDTO>(`${packagesPrefix}/${packageId}/progress`, {
    progress: Math.round(Math.min(100, Math.max(0, progress))),
  });
  return data;
}

export async function stopShipping(packageId: string): Promise<ShippingPackageResponseDTO> {
  const { data } = await api.patch<ShippingPackageResponseDTO>(`${packagesPrefix}/${packageId}/stop`);
  return data;
}

// ——— Drivers ———
export async function getAllDrivers(): Promise<DriverResponseDTO[]> {
  const { data } = await api.get<DriverResponseDTO[]>(driversPrefix);
  return data;
}

export async function getDriver(id: number): Promise<DriverResponseDTO> {
  const { data } = await api.get<DriverResponseDTO>(`${driversPrefix}/${id}`);
  return data;
}

export async function createDriver(body: CreateDriverRequestDTO): Promise<DriverResponseDTO> {
  const { data } = await api.post<DriverResponseDTO>(driversPrefix, body);
  return data;
}

export async function updateDriver(
  id: number,
  body: UpdateDriverRequestDTO
): Promise<DriverResponseDTO> {
  const { data } = await api.put<DriverResponseDTO>(`${driversPrefix}/${id}`, body);
  return data;
}

export async function deleteDriver(id: number): Promise<void> {
  await api.delete(`${driversPrefix}/${id}`);
}
