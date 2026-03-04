import { Check, Package, Truck, CheckCircle2 } from "lucide-react";
import type { ShippingStatus } from "@/types";

interface Props {
  currentStatus: ShippingStatus;
  startedAt: string | null;
  deliveredAt: string | null;
}

// Order of status for timeline
const STATUS_ORDER: ShippingStatus[] = [
  "PENDING",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
];

export function TrackingTimeline({
  currentStatus,
  startedAt,
  deliveredAt,
}: Props) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  // Simple date formatting (no library)
  const formatDate = (date: string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString(); // e.g., "3/3/2026, 4:45:00 PM"
  };

  const steps = [
    { label: "Pending", icon: <Package size={12} />, timestamp: startedAt },
    { label: "Dispatched", icon: <Truck size={12} />, timestamp: startedAt },
    { label: "In Transit", icon: <Truck size={12} />, timestamp: startedAt },
    { label: "Delivered", icon: <CheckCircle2 size={12} />, timestamp: deliveredAt },
  ];

  return (
    <div className="space-y-6">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.label} className="flex items-center gap-4">
            {/* Circle / Icon */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                isDone
                  ? "bg-green-500 text-white"
                  : isCurrent
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-400"
              }`}
            >
              {isDone ? <Check size={10} /> : step.icon}
            </div>

            {/* Content */}
            <div>
              <div className="text-sm font-medium">{step.label}</div>
              {step.timestamp && (
                <div className="text-xs text-muted">{formatDate(step.timestamp)}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}