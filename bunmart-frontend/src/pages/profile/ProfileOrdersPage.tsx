import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getOrdersByUser, cancelOrder } from "@/service/orderService";
import { createPaymentForOrder } from "@/service/paymentService";
import { getKitchenOrdersByOrderId } from "@/service/kitchenService";
import { getStoredUserId } from "@/service/api";
import { getApiErrorMessage } from "@/utils/apiError";
import { isUnpaidOrder, canCancelOrder, getOrderStatusGroup, type Order } from "@/model/order";
import type { KitchenOrderResponseDTO } from "@/model/kitchen";

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "processing", label: "Processing" },
  { value: "on_kitchen", label: "Preparing / On kitchen" },
  { value: "delivering", label: "Delivering" },
  { value: "delivered", label: "Delivered" },
  { value: "other", label: "Other" },
];

function filterOrdersByStatus(orders: Order[], statusFilter: string): Order[] {
  if (!statusFilter || statusFilter === "all") return orders;
  return orders.filter((o) => getOrderStatusGroup(o.status) === statusFilter);
}

/** True if this order might have kitchen progress (paid and sent to kitchen, or in progress, or prepared). */
function canHaveKitchenProgress(status: string): boolean {
  const s = (status || "").toLowerCase();
  return s === "paid" || s === "in_progress" || s === "prepared";
}

export function ProfileOrdersPage() {
  const [searchParams] = useSearchParams();
  const placedOrderId = searchParams.get("order");
  const placed = searchParams.get("placed") === "1";

  const userId = getStoredUserId();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [kitchenByOrderId, setKitchenByOrderId] = useState<Record<string, KitchenOrderResponseDTO | null>>({});
  const [expandedProgressOrderId, setExpandedProgressOrderId] = useState<string | null>(null);
  const [loadingProgressOrderId, setLoadingProgressOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || userId === "guest") return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getOrdersByUser(userId)
      .then((data) => { if (!cancelled) setOrders(data); })
      .catch((e) => { if (!cancelled) setError(getApiErrorMessage(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  const handlePayOrder = async (orderId: string) => {
    if (!userId) return;
    setPayingOrderId(orderId);
    setError(null);
    try {
      const { redirectUrl } = await createPaymentForOrder(orderId, userId);
      window.location.href = redirectUrl;
    } catch (e) {
      setError(getApiErrorMessage(e));
      setPayingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setCancellingOrderId(orderId);
    setError(null);
    try {
      const updated = await cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleToggleProgress = async (orderId: string) => {
    if (expandedProgressOrderId === orderId) {
      setExpandedProgressOrderId(null);
      return;
    }
    if (kitchenByOrderId[orderId] !== undefined) {
      setExpandedProgressOrderId(orderId);
      return;
    }
    setLoadingProgressOrderId(orderId);
    setError(null);
    try {
      const list = await getKitchenOrdersByOrderId(orderId);
      const ko = list?.[0] ?? null;
      setKitchenByOrderId((prev) => ({ ...prev, [orderId]: ko }));
      setExpandedProgressOrderId(orderId);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoadingProgressOrderId(null);
    }
  };

  const filteredOrders = filterOrdersByStatus(orders, statusFilter);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[40vh]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        <p className="mt-4 text-muted">Loading orders…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground dark:text-white mb-6">Orders</h1>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {placed && placedOrderId && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
          Order placed successfully. You can pay for it below.
        </div>
      )}

      {orders.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Filter by status</label>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === opt.value
                    ? "bg-primary text-white"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <p className="text-muted">
          {orders.length === 0 ? "No orders yet." : "No orders match the selected filter."}
        </p>
      ) : (
        <ul className="space-y-4">
          {filteredOrders.map((order) => (
            <li
              key={order.id}
              id={placedOrderId === order.id ? "placed-order" : undefined}
              className={`p-4 rounded-xl border bg-stone-50/50 dark:bg-stone-900/50 ${
                placedOrderId === order.id ? "border-primary ring-2 ring-primary/30" : "border-stone-200 dark:border-stone-800"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground dark:text-white">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted">
                    {new Date(order.createdAt).toLocaleString()} · {order.status}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    Total: {order.currencyCode === "USD" ? "$" : ""}{order.total} {order.currencyCode ?? "USD"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isUnpaidOrder(order.status) && (
                    <button
                      type="button"
                      onClick={() => handlePayOrder(order.id)}
                      disabled={!userId || payingOrderId === order.id}
                      className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
                    >
                      {payingOrderId === order.id ? "Redirecting…" : "Pay now"}
                    </button>
                  )}
                  {canCancelOrder(order.status) && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrderId === order.id}
                      className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                    >
                      {cancellingOrderId === order.id ? "Cancelling…" : "Cancel order"}
                    </button>
                  )}
                </div>
              </div>
              {order.shippingAddress && (
                <p className="text-xs text-muted mt-2 truncate" title={order.shippingAddress}>
                  {order.shippingAddress}
                </p>
              )}
              {canHaveKitchenProgress(order.status) && (
                <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => handleToggleProgress(order.id)}
                    disabled={loadingProgressOrderId === order.id}
                    className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    <span className="material-symbols-outlined text-lg">restaurant</span>
                    {loadingProgressOrderId === order.id
                      ? "Loading…"
                      : expandedProgressOrderId === order.id
                        ? "Hide preparing progress"
                        : "View preparing progress"}
                  </button>
                  {expandedProgressOrderId === order.id && kitchenByOrderId[order.id] && (
                    <div className="mt-2 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-2">Kitchen status: {kitchenByOrderId[order.id]!.status}</p>
                      <ul className="space-y-1.5 text-sm">
                        {kitchenByOrderId[order.id]!.lines?.map((line) => (
                          <li key={line.id} className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-muted">Product {line.productId.slice(0, 8)}…</span>
                            <span>×{line.quantity}</span>
                            <span className="text-muted">—</span>
                            <span className="font-medium">{line.progress}%</span>
                            <span className="px-1.5 py-0.5 rounded text-xs bg-stone-200 dark:bg-stone-700">{line.status}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {expandedProgressOrderId === order.id && kitchenByOrderId[order.id] === null && (
                    <p className="mt-2 text-sm text-muted">Not yet sent to kitchen.</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
