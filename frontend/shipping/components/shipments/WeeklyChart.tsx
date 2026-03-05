"use client";

import { WEEKLY_DELIVERIES } from "@/shipping/lib/dummy-data";

export function WeeklyChart() {
  const max = Math.max(...WEEKLY_DELIVERIES.map((d) => d.count));

  return (
    <div className="px-5 py-4">
      <div className="text-[10px] tracking-[1.5px] text-muted uppercase mb-3">
        Deliveries This Week
      </div>
      <div className="flex items-end h-16 gap-2">
        {WEEKLY_DELIVERIES.map((d) => (
          <div key={d.day} className="flex flex-col items-center flex-1 gap-1">
            <div
              className="w-full transition-colors duration-150 rounded-sm cursor-pointer bg-accent/20 hover:bg-accent"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: "4px" }}
              title={`${d.day}: ${d.count}`}
            />
            <span className="text-[9px] text-muted">{d.day}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 pt-4 mt-5 border-t border-border">
        <div>
          <div className="text-[9px] tracking-wide text-muted uppercase mb-1">Total</div>
          <div className="text-lg font-bold text-white font-syne">
            {WEEKLY_DELIVERIES.reduce((a, b) => a + b.count, 0)}
          </div>
        </div>
        <div>
          <div className="text-[9px] tracking-wide text-muted uppercase mb-1">Peak Day</div>
          <div className="text-lg font-bold font-syne text-accent">
            {WEEKLY_DELIVERIES.reduce((a, b) => (a.count > b.count ? a : b)).day}
          </div>
        </div>
        <div>
          <div className="text-[9px] tracking-wide text-muted uppercase mb-1">Avg / Day</div>
          <div className="text-lg font-bold text-white font-syne">
            {Math.round(WEEKLY_DELIVERIES.reduce((a, b) => a + b.count, 0) / WEEKLY_DELIVERIES.length)}
          </div>
        </div>
      </div>
    </div>
  );
}
