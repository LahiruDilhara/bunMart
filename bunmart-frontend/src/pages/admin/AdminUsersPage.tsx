import { useState, useEffect } from "react";
import {
  getUsersPage,
  getUserStats,
  setUserBlocked,
  type UserListPage,
  type UserListItem,
} from "@/service/userManagementService";
import { getApiErrorMessage } from "@/utils/apiError";

export function AdminUsersPage() {
  const [page, setPage] = useState<UserListPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsersPage({
        page: pageIndex,
        size: 20,
        search: search || undefined,
      });
      setPage(result);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [pageIndex, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPageIndex(0);
  };

  const handleBlock = async (user: UserListItem, blocked: boolean) => {
    setUpdatingId(user.id);
    setError(null);
    try {
      const updated = await setUserBlocked(user.id, blocked);
      setPage((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((u) => (u.id === updated.id ? updated : u)),
            }
          : null
      );
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setUpdatingId(null);
    }
  };

  const users = page?.content ?? [];
  const totalPages = page?.totalPages ?? 0;
  const isFirst = page?.first ?? true;
  const isLast = page?.last ?? true;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2">Users</h1>
      <p className="text-muted text-sm mb-6">
        Search users and block or unblock accounts. Blocked users cannot sign in.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by email…"
          className="rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm min-w-[200px]"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setPageIndex(0);
            }}
            className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 text-sm"
          >
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="mt-4 text-muted">Loading users…</p>
        </div>
      ) : users.length === 0 ? (
        <p className="text-muted">No users match your search.</p>
      ) : (
        <>
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 dark:bg-stone-800/80">
                <tr>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Role</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Created</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50"
                  >
                    <td className="p-3">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="p-3 font-mono text-xs">{user.email}</td>
                    <td className="p-3 capitalize">{user.role?.toLowerCase() ?? "—"}</td>
                    <td className="p-3">
                      {user.blocked ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-muted">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-3">
                      {user.blocked ? (
                        <button
                          type="button"
                          disabled={updatingId === user.id}
                          onClick={() => handleBlock(user, false)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {updatingId === user.id ? "Updating…" : "Allow"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={updatingId === user.id}
                          onClick={() => handleBlock(user, true)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          {updatingId === user.id ? "Updating…" : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={isFirst}
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted">
                Page {pageIndex + 1} of {totalPages}
              </span>
              <button
                type="button"
                disabled={isLast}
                onClick={() => setPageIndex((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
