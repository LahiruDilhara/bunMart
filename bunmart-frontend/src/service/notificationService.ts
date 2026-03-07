import api from "./api";
import { apiPaths } from "@/config/api";

const prefix = apiPaths.notification;

export interface NotificationItem {
  id: number;
  userId: string;
  channel: string;
  templateId: string | null;
  subject: string;
  body: string;
  referenceType: string | null;
  referenceId: string | null;
  status: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getNotificationsByUser(
  userId: string,
  params?: { page?: number; size?: number }
): Promise<NotificationItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.size != null) searchParams.set("size", String(params.size));
  const q = searchParams.toString();
  const { data } = await api.get<NotificationItem[]>(
    `${prefix}/user/${encodeURIComponent(userId)}${q ? `?${q}` : ""}`
  );
  return data;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { data } = await api.get<{ count: number }>(
    `${prefix}/user/${encodeURIComponent(userId)}/unread-count`
  );
  return data.count;
}

export async function markAsRead(notificationId: number): Promise<NotificationItem> {
  const { data } = await api.patch<NotificationItem>(`${prefix}/${notificationId}/read`);
  return data;
}

/** Admin: send in-app notification to multiple users. */
export async function adminSendNotification(payload: {
  userIds: string[];
  subject: string;
  body: string;
}): Promise<NotificationItem[]> {
  const { data } = await api.post<NotificationItem[]>(`${prefix}/admin/send`, payload);
  return data;
}

/** Send single in-app notification (e.g. system or from another user). */
export async function sendInAppNotification(payload: {
  userId: string;
  subject: string;
  body: string;
  referenceType?: string;
  referenceId?: string;
}): Promise<NotificationItem> {
  const { data } = await api.post<NotificationItem>(`${prefix}/in-app`, payload);
  return data;
}
