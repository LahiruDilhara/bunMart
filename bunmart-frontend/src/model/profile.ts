/**
 * Profile and address types (mirrors backend userAuthentication DTOs).
 */

export interface Address {
  id: number | string;
  type: string;
  street: string;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  addresses: Address[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AddressRequest {
  type: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}
