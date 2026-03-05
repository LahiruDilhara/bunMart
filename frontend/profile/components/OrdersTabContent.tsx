"use client";

import { useState } from "react";
import type { RecentOrder, OrderStatus } from "@/models/profile";

interface OrdersTabContentProps { orders: RecentOrder[]; }

const statusStyles: Record<OrderStatus, string> = {
  Baking: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Out for Delivery": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const allStatuses: ("All" | OrderStatus)[] = ["All", "Baking", "Out for Delivery", "Delivered", "Cancelled"];

export function OrdersTabContent({ orders }: OrdersTabContentProps) {
  const [filter, setFilter] = useState<"All" | OrderStatus>("All");
  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 lg:px-0"><h2 className="text-[#181511] dark:text-white text-2xl font-bold">My Orders</h2></div>
      <div className="flex flex-wrap gap-2 px-4 lg:px-0">
        {allStatuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${filter === s ? "bg-primary text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"}`}>{s}</button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-stone-900/50 p-8 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
            <span className="material-symbols-outlined text-4xl text-stone-300 dark:text-stone-600">inventory_2</span>
            <p className="text-stone-500 mt-2">No orders found.</p>
          </div>
        ) : filtered.map((order) => {
          const summary = order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ");
          return (
            <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-4">
                {order.imageUrl && <div className="size-14 rounded-lg bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url('${order.imageUrl}')` }} />}
                <div>
                  <p className="text-sm font-bold dark:text-white">{order.orderNumber}</p>
                  <p className="text-xs text-stone-500">{summary}</p>
                  {order.date && <p className="text-xs text-stone-400 mt-0.5">{order.date}</p>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${statusStyles[order.status]}`}>{order.status}</span>
                <p className="text-sm font-bold">${order.total.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}