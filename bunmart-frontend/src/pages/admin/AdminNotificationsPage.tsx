import { useState, useEffect } from "react";
import { getUsersPage, type UserListItem } from "@/service/userManagementService";
import { adminSendNotification } from "@/service/notificationService";
import { getApiErrorMessage } from "@/utils/apiError";

export function AdminNotificationsPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await getUsersPage({ page: 0, size: 500 });
      setUsers(page.content ?? []);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUser = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const active = users.filter((u) => !u.blocked);
    setSelectedIds(new Set(active.map((u) => u.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      setError("Select at least one user.");
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!body.trim()) {
      setError("Message body is required.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await adminSendNotification({
        userIds: ids.map((id) => String(id)),
        subject: subject.trim(),
        body: body.trim(),
      });
      setSubject("");
      setBody("");
      setSelectedIds(new Set());
      setError(null);
      // Show success - could use toast
      alert("Notification sent to " + ids.length + " user(s).");
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const activeUsers = users.filter((u) => !u.blocked);

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">
        Send notifications
      </h1>
      <p className="text-muted text-sm mb-6">
        Send an in-app notification to selected users. They will see it in their notification bell and profile.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground dark:text-white mb-2">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. New promotion"
            className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground dark:text-white mb-2">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Your message to users…"
            rows={4}
            className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm resize-y"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-foreground dark:text-white">
              Recipients (active users only)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-sm text-primary hover:underline"
              >
                Select all ({activeUsers.length})
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="text-sm text-muted hover:underline"
              >
                Clear
              </button>
            </div>
          </div>
          {loading ? (
            <p className="text-muted text-sm">Loading users…</p>
          ) : (
            <div className="max-h-60 overflow-y-auto rounded-xl border border-stone-200 dark:border-stone-800 p-3 space-y-2">
              {activeUsers.length === 0 ? (
                <p className="text-muted text-sm">No active users.</p>
              ) : (
                activeUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 rounded-lg p-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(u.id)}
                      onChange={() => toggleUser(u.id)}
                      className="rounded border-stone-300"
                    />
                    <span className="text-sm text-foreground dark:text-white">
                      {u.firstName} {u.lastName}
                    </span>
                    <span className="text-xs text-muted font-mono">{u.email}</span>
                  </label>
                ))
              )}
            </div>
          )}
          <p className="text-xs text-muted mt-1">
            {selectedIds.size} selected
          </p>
        </div>

        <button
          type="submit"
          disabled={sending || selectedIds.size === 0 || !subject.trim() || !body.trim()}
          className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send notification"}
        </button>
      </form>
    </div>
  );
}
