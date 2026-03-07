import { useState, useEffect } from "react";
import {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  type NotificationItem,
} from "@/service/notificationService";
import { getStoredUserId } from "@/service/api";
import { getApiErrorMessage } from "@/utils/apiError";

export function ProfileNotificationsPage() {
  const userId = getStoredUserId();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);

  const load = async () => {
    if (!userId || userId === "guest") return;
    setLoading(true);
    setError(null);
    try {
      const [list, count] = await Promise.all([
        getNotificationsByUser(userId, { page: 0, size: 50 }),
        getUnreadCount(userId),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const handleMarkAsRead = async (n: NotificationItem) => {
    if (n.read) return;
    setMarkingId(n.id);
    setError(null);
    try {
      const updated = await markAsRead(n.id);
      setNotifications((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setMarkingId(null);
    }
  };

  if (!userId || userId === "guest") {
    return (
      <div className="p-6">
        <p className="text-muted">Sign in to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
        Notifications
      </h1>
      <p className="text-muted text-sm mb-6">
        Notifications from admin, orders, payments, and system.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="mt-4 text-muted">Loading notifications…</p>
        </div>
      ) : notifications.length === 0 ? (
        <p className="text-muted py-8 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/30 text-center">
          No notifications yet.
        </p>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/30">
          <ul className="space-y-2 p-2">
            {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-4 transition ${
                n.read
                  ? "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/30"
                  : "border-primary/20 bg-primary/5 dark:bg-primary/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground dark:text-white">
                    {n.subject}
                  </p>
                  <p className="text-sm text-muted mt-1 whitespace-pre-wrap">
                    {n.body}
                  </p>
                  <p className="text-xs text-muted mt-2">
                    {n.createdAt
                      ? new Date(n.createdAt).toLocaleString()
                      : ""}
                  </p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    disabled={markingId === n.id}
                    onClick={() => handleMarkAsRead(n)}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    {markingId === n.id ? "…" : "Mark read"}
                  </button>
                )}
              </div>
            </li>
          ))}
          </ul>
        </div>
      )}
    </div>
  );
}
