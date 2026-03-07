import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders, type OrderPage } from "@/service/orderService";
import { createKitchenOrder } from "@/service/kitchenService";
import { createShippingPackage } from "@/service/shippingService";
import { getApiErrorMessage } from "@/utils/apiError";
import type { Order } from "@/model/order";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "await_payment", label: "Awaiting payment" },
  { value: "paid", label: "Paid" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In progress" },
  { value: "prepared", label: "Prepared" },
  { value: "shipped", label: "In transit (shipped)" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function AdminOrdersPage() {
  const [page, setPage] = useState<OrderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [sendingOrderId, setSendingOrderId] = useState<string | null>(null);
  const [sentOrderIds, setSentOrderIds] = useState<Set<string>>(new Set());
  const [sendingToShippingOrderId, setSendingToShippingOrderId] = useState<string | null>(null);
  const [sentToShippingOrderIds, setSentToShippingOrderIds] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getOrders({
        status: statusFilter || undefined,
        sort: "createdAt,desc",
        page: pageIndex,
        size: 20,
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
  }, [statusFilter, pageIndex]);

  const handleSendToKitchen = async (order: Order) => {
    if (!order.products?.length) return;
    setSendingOrderId(order.id);
    setError(null);
    try {
      await createKitchenOrder({
        userId: order.userId,
        orderId: order.id,
        lines: order.products.map((p) => ({ productId: p.productId, quantity: p.quantity })),
      });
      setSentOrderIds((prev) => new Set(prev).add(order.id));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSendingOrderId(null);
    }
  };

  const handleSendToShipping = async (order: Order) => {
    setSendingToShippingOrderId(order.id);
    setError(null);
    try {
      await createShippingPackage({
        weight: 1,
        destinationAddress: order.shippingAddress || "Address not set",
        sourceAddress: "Warehouse",
        totalPrice: order.total,
        orderId: order.id,
        userId: order.userId,
      });
      setSentToShippingOrderIds((prev) => new Set(prev).add(order.id));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSendingToShippingOrderId(null);
    }
  };

  const orders = page?.content ?? [];
  const totalPages = page?.totalPages ?? 0;
  const isFirst = page?.first ?? true;
  const isLast = page?.last ?? true;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Orders</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/kitchen"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700"
          >
            <span className="material-symbols-outlined text-lg">restaurant</span>
            Kitchen
          </Link>
          <Link
            to="/admin/shipping"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-lg">local_shipping</span>
            Shipping
          </Link>
          <Link
            to="/driver"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <span className="material-symbols-outlined text-lg">directions_car</span>
            Driver
          </Link>
        </div>
      </div>
      <p className="text-muted text-sm mb-4">Orders are placed into the kitchen only when you click &quot;Send to kitchen&quot; for a paid order. Until then they do not appear on the Kitchen page.</p>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          Filter by status
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPageIndex(0); }}
            className="rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm min-w-[180px]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
        <span className="text-sm text-muted">
          {statusFilter ? `Showing: ${STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? statusFilter}` : "Showing: All orders"}
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="mt-4 text-muted">Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-muted">No orders match the filter.</p>
      ) : (
        <>
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-100 dark:bg-stone-800/80">
                <tr>
                  <th className="p-3 font-medium">Order</th>
                  <th className="p-3 font-medium">User</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Total</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <td className="p-3 font-mono text-xs">{order.id.slice(0, 8)}…</td>
                    <td className="p-3 font-mono text-xs">{order.userId.slice(0, 8)}…</td>
                    <td className="p-3">{order.status}</td>
                    <td className="p-3">{order.currencyCode === "USD" ? "$" : ""}{order.total} {order.currencyCode ?? "USD"}</td>
                    <td className="p-3 text-muted">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="p-3">
                      {order.status?.toLowerCase() === "paid" && (
                        <button
                          type="button"
                          disabled={sendingOrderId === order.id || sentOrderIds.has(order.id)}
                          onClick={() => handleSendToKitchen(order)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
                        >
                          {sendingOrderId === order.id ? "Sending…" : sentOrderIds.has(order.id) ? "Sent" : "Send to kitchen"}
                        </button>
                      )}
                      {order.status?.toLowerCase() === "prepared" && (
                        <button
                          type="button"
                          disabled={sendingToShippingOrderId === order.id || sentToShippingOrderIds.has(order.id)}
                          onClick={() => handleSendToShipping(order)}
                          className="ml-2 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-50"
                        >
                          {sendingToShippingOrderId === order.id ? "Sending…" : sentToShippingOrderIds.has(order.id) ? "Sent" : "Send to shipping"}
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
