import { getStoredToken } from "./api";

export const AUTH_CHANGE_EVENT = "bunmart-auth-change";

export function isLoggedIn(): boolean {
  return !!getStoredToken();
}

export function getAuthToken(): string | null {
  return getStoredToken();
}
