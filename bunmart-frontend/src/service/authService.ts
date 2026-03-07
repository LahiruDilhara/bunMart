import api, { setAuthToken, setStoredUserId } from "./api";
import type { AuthResponse, SignInRequest, SignUpRequest } from "@/model/auth";

export { setAuthToken, restoreAuthToken, setStoredUserId } from "./api";

export async function signIn(payload: SignInRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/signin", payload);
  return data;
}

export async function signUp(payload: SignUpRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/signup", payload);
  return data;
}

export async function logout(): Promise<void> {
  setAuthToken(null);
  setStoredUserId(null);
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore
  }
}
