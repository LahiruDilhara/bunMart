"use client";

import type { RecentOrder, OrderStatus } from "@/models/profile";

interface RecentOrdersCardProps {
  orders: RecentOrder[];
  onViewAll: () => void;
}

const statusStyles: Record<OrderStatus, string> = {
  Baking: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Out for Delivery": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function RecentOrdersCard({ orders, onViewAll }: RecentOrdersCardProps) {
  const displayOrders = orders.slice(0, 2);

  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-stone-900/50 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
      <div className="flex justify-between items-center">
        <h2 className="text-[#181511] dark:text-white text-lg font-bold">Recent Orders</h2>
        <button onClick={onViewAll} className="text-primary text-sm font-bold cursor-pointer hover:underline">View All</button>
      </div>
      <div className="flex flex-col gap-3">
        {displayOrders.length === 0 ? (
          <p className="text-stone-500 text-sm text-center py-4">No recent orders yet.</p>
        ) : (
          displayOrders.map((order) => {
            const summary = order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ");
            return (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-[#f8f7f5] dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700">
                <div className="flex items-center gap-3">
                  {order.imageUrl && <div className="size-12 rounded bg-cover bg-center flex-shrink-0" role="img" aria-label={summary} style={{ backgroundImage: `url('${order.imageUrl}')` }} />}
                  <div>
                    <p className="text-sm font-bold dark:text-white">{order.orderNumber}</p>
                    <p className="text-xs text-stone-500">{summary}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusStyles[order.status]}`}>{order.status}</span>
                  <p className="text-sm font-bold mt-1">${order.total.toFixed(2)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}