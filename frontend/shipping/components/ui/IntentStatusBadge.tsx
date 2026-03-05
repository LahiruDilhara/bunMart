// components/ui/Badge.tsx
import { Badge } from "@/shipping/components/ui/Badge"; // your actual Badge component
import type { ShippingIntentStatus } from "@/shipping/types";

const INTENT_STATUS_CONFIG: Record<ShippingIntentStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "text-yellow-500 bg-yellow-50" },
  ASSIGNED: { label: "Assigned", className: "text-blue-500 bg-blue-50" }, // match backend exactly
  COMPLETED: { label: "Completed", className: "text-green-500 bg-green-50" },
  CANCELLED: { label: "Cancelled", className: "text-red-500 bg-red-50" },
};

export function IntentStatusBadge({ status }: { status: ShippingIntentStatus }) {
  const cfg = INTENT_STATUS_CONFIG[status];
  if (!cfg) {
    console.warn("Unknown status for badge:", status);
    return <Badge>Unknown</Badge>; // fallback so app doesn't crash
  }
  return <Badge className={cfg.className} dot>{cfg.label}</Badge>;
}