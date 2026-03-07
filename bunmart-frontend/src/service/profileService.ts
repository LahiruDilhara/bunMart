import api from "./api";
import type {
  UserProfile,
  UpdateProfileRequest,
  Address,
  AddressRequest,
} from "@/model/profile";

/**
 * Profile and address API – calls userAuthentication backend REST:
 * GET/PUT/DELETE /api/v1/users/profile, GET/POST /api/v1/users/addresses,
 * PUT /api/v1/users/addresses/{id}, DELETE /api/v1/users/addresses/{id}.
 * Gateway prefix /user is used; JWT is sent via api interceptor.
 */
const prefix = "/user";

/** Load current user profile (includes addresses when using JWT). */
export async function getProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>(`${prefix}/profile`);
  return data;
}

export async function updateProfile(body: UpdateProfileRequest): Promise<UserProfile> {
  const { data } = await api.put<UserProfile>(`${prefix}/profile`, body);
  return data;
}

export async function deleteProfile(): Promise<void> {
  await api.delete(`${prefix}/profile`);
}

/** Get all addresses for the authenticated user. */
export async function getAddresses(): Promise<Address[]> {
  const { data } = await api.get<Address[]>(`${prefix}/addresses`);
  return data;
}

/** Add a new address. Body: type (DELIVERY/BILLING), street, city, state (optional), postalCode, country. */
export async function addAddress(body: AddressRequest): Promise<Address> {
  const { data } = await api.post<Address>(`${prefix}/addresses`, body);
  return data;
}

/** Update an address by id. Sends full address fields (backend expects AddressRequest). */
export async function updateAddress(id: number, body: AddressRequest): Promise<Address> {
  const { data } = await api.put<Address>(`${prefix}/addresses/${id}`, body);
  return data;
}

/** Delete an address by id. Returns 204; 404 if not found or not owner. */
export async function deleteAddress(id: number): Promise<void> {
  await api.delete(`${prefix}/addresses/${id}`);
}
