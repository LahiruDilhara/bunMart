"use client";

import type { Subscription } from "@/models/profile";

interface SubscriptionsTabContentProps { subscriptions: Subscription[]; onManageSubscription: (id: string) => void; }

export function SubscriptionsTabContent({ subscriptions, onManageSubscription }: SubscriptionsTabContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="px-4 lg:px-0"><h2 className="text-[#181511] dark:text-white text-2xl font-bold">My Subscriptions</h2></div>
      {subscriptions.length === 0 ? (
        <div className="bg-white dark:bg-stone-900/50 p-12 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-600">calendar_month</span>
          <p className="text-stone-500 mt-3 text-sm">No active subscriptions. Check our plans for fresh deliveries!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="bg-white dark:bg-stone-900/50 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-4 items-center">
                  <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">{sub.iconName ?? "auto_awesome"}</span>
                  </div>
                  <div>
                    <p className="text-base font-bold dark:text-white">{sub.name}</p>
                    <p className="text-sm text-stone-500">Next delivery: {sub.nextDeliveryDate}</p>
                    <div className="flex gap-4 mt-2">
                      {sub.frequency && <span className="text-xs text-stone-400 flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{sub.frequency}</span>}
                      {sub.price && <span className="text-xs text-primary font-bold">${sub.price.toFixed(2)}/delivery</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onManageSubscription(sub.id)} className="px-5 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-sm font-bold dark:text-white hover:bg-stone-100 dark:hover:bg-stone-700 transition-all cursor-pointer">Manage</button>
                  <button className="px-5 py-2 rounded-lg text-sm font-bold text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer">Cancel</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}