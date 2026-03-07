import { useState, useEffect } from "react";
import {
  getAllKitchenOrders,
  updateLineProgress,
  updateLineStatus,
  updateKitchenOrderStatus,
  stopKitchenOrder,
} from "@/service/kitchenService";
import { getApiErrorMessage } from "@/utils/apiError";
import type { KitchenOrderResponseDTO, KitchenOrderLineDTO } from "@/model/kitchen";

const LINE_STATUSES = ["PENDING", "IN_PROGRESS", "DONE"] as const;
const ORDER_STATUSES = ["ACTIVE", "STOPPED", "COMPLETED"] as const;

/** True if every line has status DONE (required before setting order to COMPLETED). */
function allLinesDone(ko: KitchenOrderResponseDTO): boolean {
  if (!ko.lines?.length) return true;
  return ko.lines.every((line) => (line.status || "").toUpperCase() === "DONE");
}

export function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrderResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  /** Per-line draft for direct percentage input; key = line.id */
  const [progressDraft, setProgressDraft] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAllKitchenOrders();
      // Only show kitchen orders (each is created when admin clicks "Send to kitchen").
      // Pending/paid or any order not sent by admin must not appear here.
      const sentOnly = (list ?? []).filter((ko) => ko.orderId);
      setOrders(sentOnly);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLineProgress = async (ko: KitchenOrderResponseDTO, line: KitchenOrderLineDTO, value: number) => {
    if (ko.status === "COMPLETED") return;
    const progress = Math.round(Math.min(100, Math.max(0, value)));
    const key = `${ko.id}-${line.id}-progress`;
    setUpdating(key);
    setError(null);
    try {
      const updated = await updateLineProgress(ko.id, line.id, progress);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setUpdating(null);
    }
  };

  const handleLineStatus = async (ko: KitchenOrderResponseDTO, line: KitchenOrderLineDTO, status: string) => {
    if (ko.status === "COMPLETED") return;
    const key = `${ko.id}-${line.id}-status`;
    setUpdating(key);
    setError(null);
    try {
      const updated = await updateLineStatus(ko.id, line.id, status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setUpdating(null);
    }
  };

  const handleOrderStatus = async (ko: KitchenOrderResponseDTO, status: string) => {
    if (ko.status === "COMPLETED") return; // no further changes once completed
    setUpdating(ko.id);
    setError(null);
    try {
      let updated: KitchenOrderResponseDTO;
      if (status === "STOPPED") {
        updated = await stopKitchenOrder(ko.id);
      } else {
        updated = await updateKitchenOrderStatus(ko.id, status);
      }
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <span className="material-symbols-outlined text-4xl text-amber-600 animate-spin">progress_activity</span>
        <p className="mt-4 text-muted">Loading kitchen orders…</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2 flex items-center gap-2">
        <span className="material-symbols-outlined text-amber-600">restaurant</span>
        Kitchen Orders
      </h1>
      <p className="text-muted text-sm mb-6">
        Only orders that an admin has sent to the kitchen appear here. Pending, paid, or any other orders do not show until an admin sends them from Admin → Orders.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-muted">No kitchen orders. Pending, paid, and other orders are not shown here—only those sent to the kitchen by an admin from Admin → Orders.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((ko) => (
            <li
              key={ko.id}
              className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId((id) => (id === ko.id ? null : ko.id))}
                className="w-full flex flex-wrap items-center justify-between gap-4 p-4 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-mono text-sm font-medium">Order #{ko.orderId.slice(0, 8)}</span>
                  <span className="text-xs text-muted">User: {ko.userId.slice(0, 8)}…</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      ko.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : ko.status === "COMPLETED"
                          ? "bg-stone-200 text-stone-700 dark:bg-stone-600 dark:text-stone-200"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {ko.status}
                  </span>
                </div>
                <div className="text-xs text-muted">
                  {new Date(ko.createdAt).toLocaleString()}
                </div>
                <span className="material-symbols-outlined text-stone-400">
                  {expandedId === ko.id ? "expand_less" : "expand_more"}
                </span>
              </button>

              {expandedId === ko.id && (
                <div className="border-t border-stone-200 dark:border-stone-800 p-4 bg-stone-50/50 dark:bg-stone-900/80">
                  {(() => {
                    const isCompleted = ko.status === "COMPLETED";
                    return (
                      <>
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Order status:</span>
                          {isCompleted ? (
                            <span className="px-2 py-1 rounded bg-stone-200 dark:bg-stone-600 text-sm font-medium">COMPLETED (read-only)</span>
                          ) : (
                            <>
                              <select
                                value={ko.status}
                                disabled={updating === ko.id}
                                onChange={(e) => handleOrderStatus(ko, e.target.value)}
                                className="rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-1.5 text-sm"
                              >
                                {ORDER_STATUSES.map((s) => (
                                  <option key={s} value={s} disabled={s === "COMPLETED" && !allLinesDone(ko)}>
                                    {s === "COMPLETED" && !allLinesDone(ko) ? "COMPLETED (set all lines to DONE first)" : s}
                                  </option>
                                ))}
                              </select>
                              {!allLinesDone(ko) && (
                                <span className="text-xs text-amber-700 dark:text-amber-400">Set all line statuses to DONE to complete the order.</span>
                              )}
                            </>
                          )}
                        </div>

                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted border-b border-stone-200 dark:border-stone-700">
                              <th className="pb-2 pr-4">Product ID</th>
                              <th className="pb-2 pr-4">Qty</th>
                              <th className="pb-2 pr-4">Progress</th>
                              <th className="pb-2 pr-4">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ko.lines?.map((line) => (
                              <tr key={line.id} className="border-b border-stone-100 dark:border-stone-800 last:border-0">
                                <td className="py-2 pr-4 font-mono text-xs">{line.productId.slice(0, 8)}…</td>
                                <td className="py-2 pr-4">{line.quantity}</td>
                                <td className="py-2 pr-4">
                                  {isCompleted ? (
                                    <span className="text-muted">{line.progress}%</span>
                                  ) : (line.status || "").toUpperCase() === "IN_PROGRESS" ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={line.progress}
                                        disabled={updating !== null}
                                        onChange={(e) => handleLineProgress(ko, line, Number(e.target.value))}
                                        className="w-20 shrink-0"
                                      />
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={progressDraft[line.id] ?? String(line.progress)}
                                        disabled={updating !== null}
                                        onChange={(e) => setProgressDraft((prev) => ({ ...prev, [line.id]: e.target.value }))}
                                        onBlur={(e) => {
                                          const raw = e.target.value === "" ? String(line.progress) : e.target.value;
                                          const v = Number(raw);
                                          if (!Number.isNaN(v)) handleLineProgress(ko, line, v);
                                          setProgressDraft((prev) => {
                                            const next = { ...prev };
                                            delete next[line.id];
                                            return next;
                                          });
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            const raw = e.currentTarget.value === "" ? String(line.progress) : e.currentTarget.value;
                                            const v = Number(raw);
                                            if (!Number.isNaN(v)) handleLineProgress(ko, line, v);
                                            setProgressDraft((prev) => {
                                              const next = { ...prev };
                                              delete next[line.id];
                                              return next;
                                            });
                                            e.currentTarget.blur();
                                          }
                                        }}
                                        className="w-14 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-2 py-1 text-xs text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                      <span className="text-xs text-muted">%</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted" title="Set line status to IN_PROGRESS to edit progress">
                                      {line.progress}%
                                    </span>
                                  )}
                                </td>
                                <td className="py-2">
                                  {isCompleted ? (
                                    <span className="text-muted">{line.status}</span>
                                  ) : (
                                    <select
                                      value={line.status}
                                      disabled={updating !== null}
                                      onChange={(e) => handleLineStatus(ko, line, e.target.value)}
                                      className="rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-2 py-1 text-xs"
                                    >
                                      {LINE_STATUSES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                      ))}
                                    </select>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    );
                  })()}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
