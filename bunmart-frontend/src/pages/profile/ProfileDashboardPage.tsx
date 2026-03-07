import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrdersByUser } from "@/service/orderService";
import { getProfile } from "@/service/profileService";
import { getStoredUserId } from "@/service/api";
import { getOrderStatusGroup } from "@/model/order";
import type { Order } from "@/model/order";
import type { UserProfile } from "@/model/profile";

const LABELS: Record<string, { label: string; icon: string; color: string }> = {
  unpaid: { label: "Unpaid", icon: "payments", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800" },
  paid: { label: "Paid", icon: "check_circle", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" },
  cancelled: { label: "Cancelled", icon: "cancel", color: "bg-stone-500/15 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700" },
  processing: { label: "Processing", icon: "schedule", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800" },
  on_kitchen: { label: "Preparing", icon: "restaurant", color: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800" },
  delivering: { label: "On the way", icon: "local_shipping", color: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800" },
  delivered: { label: "Delivered", icon: "done_all", color: "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800" },
  other: { label: "Other", icon: "help_outline", color: "bg-stone-500/15 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700" },
};

const STATUS_KEYS = ["unpaid", "paid", "cancelled", "processing", "on_kitchen", "delivering", "delivered"] as const;

function formatCurrency(total: string, currencyCode: string | null): string {
  const num = parseFloat(total);
  if (Number.isNaN(num)) return "—";
  const code = (currencyCode || "USD").toUpperCase();
  if (code === "USD") return `$${num.toFixed(2)}`;
  return `${num.toFixed(2)} ${code}`;
}

export function ProfileDashboardPage() {
  const userId = getStoredUserId();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || userId === "guest") return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getProfile(), getOrdersByUser(userId)])
      .then(([profileData, ordersData]) => {
        if (!cancelled) {
          setProfile(profileData);
          setOrders(ordersData ?? []);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const counts: Record<string, number> = {};
  orders.forEach((o) => {
    const group = getOrderStatusGroup(o.status);
    counts[group] = (counts[group] ?? 0) + 1;
  });

  const totalSpent = orders
    .filter((o) => getOrderStatusGroup(o.status) === "delivered")
    .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const currencyCode = orders.find((o) => o.currencyCode)?.currencyCode ?? "USD";

  const recentOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[40vh]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        <p className="mt-4 text-muted">Loading dashboard…</p>
      </div>
    );
  }

  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email || "there"
    : "there";

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">
          Hello, {displayName}
        </h1>
        <p className="text-muted mt-1">Here’s your order overview and quick links.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Top metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-primary">receipt_long</span>
            <div>
              <p className="text-2xl font-bold text-foreground dark:text-white">{orders.length}</p>
              <p className="text-sm text-muted">Total orders</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-emerald-600">payments</span>
            <div>
              <p className="text-xl font-bold text-foreground dark:text-white">
                {formatCurrency(String(totalSpent), currencyCode)}
              </p>
              <p className="text-sm text-muted">Total spent</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-sky-600">local_shipping</span>
            <div>
              <p className="text-2xl font-bold text-foreground dark:text-white">{counts.delivering ?? 0}</p>
              <p className="text-sm text-muted">On the way</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-green-600">done_all</span>
            <div>
              <p className="text-2xl font-bold text-foreground dark:text-white">{counts.delivered ?? 0}</p>
              <p className="text-sm text-muted">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order status breakdown */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Orders by status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {STATUS_KEYS.map((key) => {
            const conf = LABELS[key];
            const count = counts[key] ?? 0;
            return (
              <div
                key={key}
                className={`rounded-xl border p-4 flex flex-col items-center justify-center min-h-[90px] ${conf.color}`}
              >
                <span className="material-symbols-outlined text-2xl mb-1">{conf.icon}</span>
                <p className="font-bold text-xl">{count}</p>
                <p className="text-xs font-medium">{conf.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent orders */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground dark:text-white">Recent orders</h2>
          <Link to="/profile/orders" className="text-sm font-medium text-primary hover:underline">
            View all orders →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-muted py-8 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/30 text-center">
            You haven’t placed any orders yet.
          </p>
        ) : (
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-white dark:bg-stone-900/30 max-h-[280px] flex flex-col">
            <div className="overflow-y-auto min-h-0 flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-100 dark:bg-stone-800/80 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 font-medium">Order</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Total</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                      <td className="p-3 font-mono text-xs">{order.id.slice(0, 8)}…</td>
                      <td className="p-3">{order.status}</td>
                      <td className="p-3">{formatCurrency(order.total, order.currencyCode)}</td>
                      <td className="p-3 text-muted">{new Date(order.createdAt).toLocaleString()}</td>
                      <td className="p-3">
                        <Link
                          to={`/profile/orders?order=${order.id}`}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/profile/orders"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition"
          >
            <span className="material-symbols-outlined">receipt_long</span>
            View all orders
          </Link>
          <Link
            to="/profile/addresses"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-stone-300 dark:border-stone-600 font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <span className="material-symbols-outlined">location_on</span>
            Addresses
          </Link>
          <Link
            to="/profile/account"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-stone-300 dark:border-stone-600 font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <span className="material-symbols-outlined">person</span>
            Account
          </Link>
        </div>
      </section>
    </div>
  );
}
