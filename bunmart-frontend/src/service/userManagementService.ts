import api from "./api";
import { apiPaths } from "@/config/api";

const prefix = apiPaths.user;

export interface UserListItem {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  blocked: boolean;
  createdAt: string;
}

export interface UserStatsResponse {
  total: number;
  blocked: number;
}

export interface UserListPage {
  content: UserListItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export async function getUsersPage(params: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<UserListPage> {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.size != null) searchParams.set("size", String(params.size));
  if (params.search != null && params.search.trim() !== "")
    searchParams.set("search", params.search.trim());
  const q = searchParams.toString();
  const { data } = await api.get<UserListPage>(`${prefix}/list${q ? `?${q}` : ""}`);
  return data;
}

export async function getUserStats(): Promise<UserStatsResponse> {
  const { data } = await api.get<UserStatsResponse>(`${prefix}/stats`);
  return data;
}

export async function setUserBlocked(userId: number, blocked: boolean): Promise<UserListItem> {
  const { data } = await api.patch<UserListItem>(`${prefix}/${userId}/blocked`, { blocked });
  return data;
}
