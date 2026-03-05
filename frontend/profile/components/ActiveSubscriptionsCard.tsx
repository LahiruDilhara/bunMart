"use client";

import type { Subscription } from "@/models/profile";

interface ActiveSubscriptionsCardProps {
  subscriptions: Subscription[];
  onManageSubscription: (id: string) => void;
}

export function ActiveSubscriptionsCard({ subscriptions, onManageSubscription }: ActiveSubscriptionsCardProps) {
  return (
    <div className="md:col-span-2 flex flex-col gap-4 bg-white dark:bg-stone-900/50 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl">calendar_today</span>
        <h2 className="text-[#181511] dark:text-white text-lg font-bold">Active Subscriptions</h2>
      </div>
      <div className="flex flex-wrap gap-4">
        {subscriptions.length === 0 ? (
          <p className="text-stone-500 text-sm">No active subscriptions. Browse our plans to get started!</p>
        ) : (
          subscriptions.map((sub) => (
            <div key={sub.id} className="flex-1 min-w-[280px] p-4 bg-stone-50 dark:bg-stone-800/40 rounded-lg flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{sub.iconName ?? "auto_awesome"}</span>
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">{sub.name}</p>
                  <p className="text-xs text-stone-500">Next delivery: {sub.nextDeliveryDate}</p>
                </div>
              </div>
              <button onClick={() => onManageSubscription(sub.id)} className="px-4 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-bold dark:text-white hover:bg-stone-100 dark:hover:bg-stone-700 transition-all cursor-pointer">Manage</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}