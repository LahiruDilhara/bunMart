"use client";

import { useMemo } from "react";
import { Shipment } from "@/shipping/types";
import { WEEKLY_DELIVERIES } from "@/shipping/lib/dummy-data"; // Import your existing dummy counts

interface WeeklyChartProps {
  shipments: Shipment[];
}

export function WeeklyChart({ shipments }: WeeklyChartProps) {
  const chartData = useMemo(() => {
    // If we have actual shipments from the backend, process them
    if (shipments && shipments.length > 0) {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const counts = new Array(7).fill(0);

      shipments.forEach((s) => {
        if (s.startedAt) {
          const dayIndex = new Date(s.startedAt).getDay();
          counts[dayIndex]++;
        }
      });
      return days.map((day, i) => ({ day, count: counts[i] }));
    }

    // FALLBACK: Use dummy data if shipments array is empty
    return WEEKLY_DELIVERIES;
  }, [shipments]);

  // Find max count to scale the bars correctly
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div className="w-full h-[250px] flex items-end justify-between gap-2 pt-10 px-2">
      {chartData.map((item) => (
        <div key={item.day} className="flex flex-col items-center flex-1 gap-2">
          <div 
            className="relative w-full transition-all duration-700 bg-orange-100 rounded-t-md group"
            style={{ height: `${(item.count / maxCount) * 100}%` }}
          >
            {/* Tooltip on hover */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
              {item.count} Deliveries
            </div>
            {/* Inner Bar Fill */}
            <div className="absolute inset-0 transition-opacity bg-orange-500 opacity-30 group-hover:opacity-60 rounded-t-md" />
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            {item.day}
          </span>
        </div>
      ))}
    </div>
  );
}