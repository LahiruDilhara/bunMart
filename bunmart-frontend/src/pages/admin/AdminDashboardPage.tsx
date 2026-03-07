import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders, type OrderPage } from "@/service/orderService";
import { getProducts } from "@/service/productService";
import { getAllShippingPackages } from "@/service/shippingService";
import { getUserStats } from "@/service/userManagementService";
import { getApiErrorMessage } from "@/utils/apiError";
import type { Order } from "@/model/order";

const ORDER_STATUS_CONFIG: { status: string; label: string; icon: string; color: string }[] = [
  { status: "pending", label: "Pending", icon: "schedule", color: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  { status: "paid", label: "Paid", icon: "payments", color: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  { status: "prepared", label: "Prepared", icon: "restaurant", color: "bg-violet-500/15 text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-800" },
  { status: "shipped", label: "In transit", icon: "local_shipping", color: "bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800" },
  { status: "delivered", label: "Delivered", icon: "done_all", color: "bg-green-500/15 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800" },
  { status: "cancelled", label: "Cancelled", icon: "cancel", color: "bg-stone-400/15 text-stone-700 dark:text-stone-400 border-stone-200 dark:border-stone-700" },
];

const QUICK_LINKS = [
  { to: "/admin/users", label: "Users", icon: "group", description: "Block, allow, search users" },
  { to: "/admin/products", label: "Products", icon: "inventory_2", description: "Add, edit, categories" },
  { to: "/admin/pricing", label: "Pricing", icon: "sell", description: "Prices, discounts, coupons" },
  { to: "/admin/orders", label: "Orders", icon: "receipt_long", description: "View & manage orders" },
  { to: "/kitchen", label: "Kitchen", icon: "restaurant", description: "Kitchen queue & progress" },
  { to: "/admin/shipping", label: "Shipping", icon: "local_shipping", description: "Assign drivers, track" },
];

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState<number>(0);
  const [shippingTotal, setShippingTotal] = useState<number>(0);
  const [shippingInTransit, setShippingInTransit] = useState<number>(0);
  const [userStats, setUserStats] = useState<{ total: number; blocked: number }>({ total: 0, blocked: 0 });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getOrders({ page: 0, size: 1 }),
      getOrders({ page: 0, size: 5, sort: "createdAt,desc" }),
      getProducts(),
      getAllShippingPackages(),
      getUserStats(),
      ...ORDER_STATUS_CONFIG.map((c) =>
        getOrders({ status: c.status, page: 0, size: 1 })
      ),
    ])
      .then(([totalPage, recentPage, products, packages, stats, ...statusPages]) => {
        if (cancelled) return;
        setTotalOrders((totalPage as OrderPage).totalElements ?? 0);
        setRecentOrders((recentPage as OrderPage).content ?? []);
        setProductCount(products?.length ?? 0);
        setShippingTotal(packages?.length ?? 0);
        setShippingInTransit(
          (packages ?? []).filter((p: { status: string }) => p.status === "IN_TRANSIT").length
        );
        setUserStats(
          stats ? { total: stats.total, blocked: stats.blocked } : { total: 0, blocked: 0 }
        );
        const counts: Record<string, number> = {};
        (statusPages as OrderPage[]).forEach((p, i) => {
          const status = ORDER_STATUS_CONFIG[i]?.status ?? "";
          if (status) counts[status] = p.totalElements ?? 0;
        });
        setOrderCounts(counts);
      })
      .catch((e) => {
        if (!cancelled) setError(getApiErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        <p className="mt-4 text-muted">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Dashboard</h1>
        <p className="text-muted mt-1">Overview of orders, products, and shipping.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Top-level metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-primary">receipt_long</span>
            <div>
              <p className="text-2xl font-bold text-foreground dark:text-white">{totalOrders}</p>
              <p className="text-sm text-muted">Total orders</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-emerald-600">inventory_2</span>
            <div>
              <p className="text-2xl font-bold text-foreground dark:text-white">{productCount}</p>
              <p className="text-sm text-muted">Products</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-indigo-600">group</span>
            <div>
              <p className="text-2xl font-bold text-foreground dark:text-white">{userStats.total}</p>
              <p className="text-sm text-muted">Users</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-red-500">block</span>
            <div>
              <p className="text-2xl font-bold text-foreground dark:text-white">{userStats.blocked}</p>
              <p className="text-sm text-muted">Blocked</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-sky-600">local_shipping</span>
            <div>
              <p className="text-2xl font-bold text-foreground dark:text-white">{shippingTotal}</p>
              <p className="text-sm text-muted">Packages</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-amber-600">directions_car</span>
            <div>
              <p className="text-2xl font-bold text-foreground dark:text-white">{shippingInTransit}</p>
              <p className="text-sm text-muted">In transit</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders by status */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Orders by status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {ORDER_STATUS_CONFIG.map(({ status, label, icon, color }) => (
            <Link
              key={status}
              to={`/admin/orders${status ? `?status=${status}` : ""}`}
              className={`rounded-xl border p-4 flex flex-col items-center justify-center min-h-[90px] transition hover:opacity-90 ${color}`}
            >
              <span className="material-symbols-outlined text-2xl mb-1">{icon}</span>
              <p className="font-bold text-xl">{orderCounts[status] ?? 0}</p>
              <p className="text-xs font-medium">{label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent orders */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground dark:text-white">Recent orders</h2>
          <Link
            to="/admin/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-muted py-6 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/30 text-center">
            No orders yet.
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
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                      <td className="p-3 font-mono text-xs">{order.id.slice(0, 8)}…</td>
                      <td className="p-3">{order.status}</td>
                      <td className="p-3">{order.currencyCode === "USD" ? "$" : ""}{order.total} {order.currencyCode ?? "USD"}</td>
                      <td className="p-3 text-muted">{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-4 p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-3xl text-primary">{link.icon}</span>
              <div className="text-left">
                <h3 className="font-semibold text-foreground dark:text-white">{link.label}</h3>
                <p className="text-sm text-muted">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
