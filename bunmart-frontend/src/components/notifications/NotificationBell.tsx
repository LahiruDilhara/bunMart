import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  type NotificationItem,
} from "@/service/notificationService";
import { getStoredUserId } from "@/service/api";

export function NotificationBell() {
  const userId = getStoredUserId();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!userId || userId === "guest") return;
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        getNotificationsByUser(userId, { page: 0, size: 5 }),
        getUnreadCount(userId),
      ]);
      setRecent(list);
      setUnreadCount(count);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleMarkAsRead = async (n: NotificationItem) => {
    if (n.read) return;
    try {
      await markAsRead(n.id);
      setRecent((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  if (!userId || userId === "guest") return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center rounded-lg h-10 w-10 bg-primary/10 text-foreground dark:text-white hover:bg-primary/20 transition-colors"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 max-h-[70vh] overflow-hidden rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-lg z-50 flex flex-col">
          <div className="p-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <span className="font-semibold text-foreground dark:text-white">Notifications</span>
            <Link
              to="/profile/notifications"
              onClick={() => setOpen(false)}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-muted text-sm">Loading…</div>
            ) : recent.length === 0 ? (
              <div className="p-4 text-center text-muted text-sm">No notifications</div>
            ) : (
              recent.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50 ${
                    !n.read ? "bg-primary/5 dark:bg-primary/10" : ""
                  }`}
                >
                  <p className="font-medium text-sm text-foreground dark:text-white truncate">
                    {n.subject}
                  </p>
                  <p className="text-xs text-muted truncate mt-0.5">{n.body}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                    </span>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(n)}
                        className="text-xs text-primary hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
