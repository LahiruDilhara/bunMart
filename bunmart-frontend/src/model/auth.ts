/**
 * Auth request/response types (mirrors backend DTOs).
 */

export interface AuthResponse {
  token: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  message?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export function getDisplayName(
  res: Pick<AuthResponse, "firstName" | "lastName" | "email">
): string {
  return [res.firstName, res.lastName].filter(Boolean).join(" ").trim() || res.email;
}

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}
