/**
 * Single base axios instance for all backend calls.
 * Request interceptor attaches JWT from localStorage.
 */

import axios from "axios";
import { apiGatewayUrl } from "@/config/api";

export const AUTH_TOKEN_KEY = "bunmart_token";
export const USER_ID_KEY = "bunmart_user_id";

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
  window.dispatchEvent(new CustomEvent("bunmart-auth-change"));
}

export function getStoredUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setStoredUserId(userId: string | null): void {
  if (userId != null) {
    localStorage.setItem(USER_ID_KEY, userId);
  } else {
    localStorage.removeItem(USER_ID_KEY);
  }
  window.dispatchEvent(new CustomEvent("bunmart-auth-change"));
}

export function restoreAuthToken(): void {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) setAuthToken(token);
}

const api = axios.create({
  baseURL: apiGatewayUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
