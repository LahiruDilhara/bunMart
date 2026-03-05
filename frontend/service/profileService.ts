/**
 * Profile service – wired to Spring Boot backend.
 *
 * Every function takes `userId` as its first parameter.
 * No hardcoded IDs anywhere.
 *
 * Endpoints:
 *   GET    /api/v1/users/{id}                    → UserResponseDTO
 *   PUT    /api/v1/users/{id}                    → UserResponseDTO
 *   DELETE /api/v1/users/{id}
 *   GET    /api/v1/users/{id}/addresses           → AddressResponseDTO[]
 *   POST   /api/v1/users/{id}/addresses           → AddressResponseDTO
 *   PUT    /api/v1/users/{id}/addresses/{addrId}  → AddressResponseDTO
 *   DELETE /api/v1/users/{id}/addresses/{addrId}
 *
 * Environment:
 *   NEXT_PUBLIC_PROFILE_SERVICE_URL – backend base (default: http://localhost:8086)
 */

import axios, { AxiosError } from "axios";
import type {
  UserResponseDTO,
  AddressResponseDTO,
  UpdateUserRequestDTO,
  CreateAddressRequestDTO,
  ApiErrorResponse,
  ProfileDashboard,
  UserProfile,
  SavedAddress,
} from "@/models/profile";
import {
  mapUserResponseToProfile,
  mapAddressListToSaved,
  mapAddressResponseToSaved,
} from "@/service/profileMapper";

// ── config ───────────────────────────────────────────────

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_PROFILE_SERVICE_URL ?? "http://localhost:8086";

// 🔍 DEBUG: Log the base URL on load
console.log("[ProfileService] Base URL:", getBaseUrl());
console.log("[ProfileService] Env var NEXT_PUBLIC_PROFILE_SERVICE_URL:", process.env.NEXT_PUBLIC_PROFILE_SERVICE_URL);

const profileClient = axios.create({
  baseURL: getBaseUrl(),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// 🔍 DEBUG: Log every outgoing request
profileClient.interceptors.request.use((config) => {
  console.log(`[ProfileService] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  if (config.data) console.log("[ProfileService] → Body:", config.data);
  return config;
});

// 🔍 DEBUG: Log every response / error
profileClient.interceptors.response.use(
  (response) => {
    console.log(`[ProfileService] ← ${response.status} ${response.config.url}`);
    console.log("[ProfileService] ← Data:", response.data);
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error(`[ProfileService] ✗ ${error.code} ${error.config?.url}`);
      console.error("[ProfileService] ✗ Status:", error.response?.status);
      console.error("[ProfileService] ✗ Response data:", error.response?.data);
      console.error("[ProfileService] ✗ Message:", error.message);
    } else {
      console.error("[ProfileService] ✗ Unknown error:", error);
    }
    return Promise.reject(error);
  }
);

// ── error handling ───────────────────────────────────────

/**
 * Extracts a human-readable message from an Axios error.
 * Reads your Spring Boot error response body first,
 * then falls back to HTTP status text, then generic message.
 */
export function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<ApiErrorResponse>;
    const data = axiosErr.response?.data;

    // Backend returned a structured error body
    if (data?.message) return data.message;

    // Validation errors from @Valid
    if (data?.errors) {
      const msgs = Object.entries(data.errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join("; ");
      return msgs;
    }

    // HTTP status-based fallback
    const status = axiosErr.response?.status;
    if (status === 404) return "Resource not found";
    if (status === 400) return "Invalid request. Please check your input.";
    if (status === 401) return "Please log in to continue.";
    if (status === 403) return "You don't have permission to do this.";
    if (status === 409) return "Conflict – this resource may already exist.";
    if (status === 500) return "Server error. Please try again later.";

    // Network error (backend unreachable)
    if (axiosErr.code === "ERR_NETWORK") {
      return "Cannot connect to server. Please check if the backend is running.";
    }

    return axiosErr.message;
  }

  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

/**
 * Typed API error that components can catch and display.
 */
export class ProfileApiError extends Error {
  status?: number;
  fieldErrors?: Record<string, string>;

  constructor(err: unknown) {
    const message = extractApiError(err);
    super(message);
    this.name = "ProfileApiError";

    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      this.status = axiosErr.response?.status;
      this.fieldErrors = axiosErr.response?.data?.errors;
    }
  }
}

// ── user endpoints ───────────────────────────────────────

/** GET /api/v1/users/{userId} */
export async function getUser(userId: string): Promise<UserProfile> {
  try {
    const { data } = await profileClient.get<UserResponseDTO>(
      `/api/v1/users/${userId}`
    );
    return mapUserResponseToProfile(data);
  } catch (err) {
    throw new ProfileApiError(err);
  }
}

/** PUT /api/v1/users/{userId} */
export async function updateUser(
  userId: string,
  payload: { name: string; email: string; phone: string }
): Promise<UserProfile> {
  try {
    const dto: UpdateUserRequestDTO = {
      displayName: payload.name,
      email: payload.email,
      phone: payload.phone || undefined,
    };
    const { data } = await profileClient.put<UserResponseDTO>(
      `/api/v1/users/${userId}`,
      dto
    );
    return mapUserResponseToProfile(data);
  } catch (err) {
    throw new ProfileApiError(err);
  }
}

/** DELETE /api/v1/users/{userId} */
export async function deleteUser(userId: string): Promise<void> {
  try {
    await profileClient.delete(`/api/v1/users/${userId}`);
  } catch (err) {
    throw new ProfileApiError(err);
  }
}

// ── address endpoints ────────────────────────────────────

/** GET /api/v1/users/{userId}/addresses */
export async function getAddresses(userId: string): Promise<SavedAddress[]> {
  try {
    const { data } = await profileClient.get<AddressResponseDTO[]>(
      `/api/v1/users/${userId}/addresses`
    );
    return mapAddressListToSaved(data);
  } catch (err) {
    throw new ProfileApiError(err);
  }
}

/** POST /api/v1/users/{userId}/addresses */
export async function createAddress(
  userId: string,
  payload: CreateAddressRequestDTO
): Promise<SavedAddress> {
  try {
    const dto: CreateAddressRequestDTO = {
      ...payload,
      type: payload.type.toUpperCase(),
    };
    const { data } = await profileClient.post<AddressResponseDTO>(
      `/api/v1/users/${userId}/addresses`,
      dto
    );
    return mapAddressResponseToSaved(data, false);
  } catch (err) {
    throw new ProfileApiError(err);
  }
}

/** PUT /api/v1/users/{userId}/addresses/{addrId} */
export async function updateAddress(
  userId: string,
  addrId: string,
  payload: Partial<CreateAddressRequestDTO>
): Promise<SavedAddress> {
  try {
    const { data } = await profileClient.put<AddressResponseDTO>(
      `/api/v1/users/${userId}/addresses/${addrId}`,
      payload
    );
    return mapAddressResponseToSaved(data, false);
  } catch (err) {
    throw new ProfileApiError(err);
  }
}

/** DELETE /api/v1/users/{userId}/addresses/{addrId} */
export async function deleteAddress(
  userId: string,
  addrId: string
): Promise<void> {
  try {
    await profileClient.delete(
      `/api/v1/users/${userId}/addresses/${addrId}`
    );
  } catch (err) {
    throw new ProfileApiError(err);
  }
}

// ── dashboard (assembles multiple calls) ─────────────────

/**
 * Fetches user + addresses in parallel.
 * Orders, subscriptions, wishlist are empty until those services are ready.
 */
export async function getProfileDashboard(
  userId: string
): Promise<ProfileDashboard> {
  console.log(`[ProfileService] getProfileDashboard called with userId: "${userId}"`);

  // Fetch user and addresses in parallel – both can fail independently
  const [userResult, addressesResult] = await Promise.allSettled([
    getUser(userId),
    getAddresses(userId),
  ]);

  console.log("[ProfileService] User result:", userResult.status, userResult.status === "fulfilled" ? userResult.value : userResult.reason);
  console.log("[ProfileService] Addresses result:", addressesResult.status, addressesResult.status === "fulfilled" ? addressesResult.value : addressesResult.reason);

  // User fetch is critical – if it fails, throw
  if (userResult.status === "rejected") {
    throw userResult.reason;
  }

  // Addresses can fail gracefully – show empty list with console warning
  let savedAddresses: SavedAddress[] = [];
  if (addressesResult.status === "fulfilled") {
    savedAddresses = addressesResult.value;
  } else {
    console.warn("Failed to load addresses:", addressesResult.reason);
  }

  return {
    user: userResult.value,
    savedAddresses,
    // TODO: Wire these when their microservices are ready
    recentOrders: [],
    subscriptions: [],
    wishlist: [],
  };
}