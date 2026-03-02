"use client";

import { WEEKLY_DELIVERIES } from "@/lib/dummy-data";

export function WeeklyChart() {
  const max = Math.max(...WEEKLY_DELIVERIES.map((d) => d.count));

  return (
    <div className="px-5 py-4">
      <div className="text-[10px] tracking-[1.5px] text-muted uppercase mb-3">
        Deliveries This Week
      </div>
      <div className="flex items-end gap-2 h-16">
        {WEEKLY_DELIVERIES.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-sm bg-accent/20 hover:bg-accent transition-colors duration-150 cursor-pointer"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: "4px" }}
              title={`${d.day}: ${d.count}`}
            />
            <span className="text-[9px] text-muted">{d.day}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border">
        <div>
          <div className="text-[9px] tracking-wide text-muted uppercase mb-1">Total</div>
          <div className="font-syne font-bold text-lg text-white">
            {WEEKLY_DELIVERIES.reduce((a, b) => a + b.count, 0)}
          </div>
        </div>
        <div>
          <div className="text-[9px] tracking-wide text-muted uppercase mb-1">Peak Day</div>
          <div className="font-syne font-bold text-lg text-accent">
            {WEEKLY_DELIVERIES.reduce((a, b) => (a.count > b.count ? a : b)).day}
          </div>
        </div>
        <div>
          <div className="text-[9px] tracking-wide text-muted uppercase mb-1">Avg / Day</div>
          <div className="font-syne font-bold text-lg text-white">
            {Math.round(WEEKLY_DELIVERIES.reduce((a, b) => a + b.count, 0) / WEEKLY_DELIVERIES.length)}
          </div>
        </div>
      </div>
    </div>
  );
}
