
// ─── components/ui/Badge.tsx ───────────────────────────────────
import { cn } from "@/shipping/lib/utils";
import type { ShippingStatus, ShippingIntentStatus } from "@/shipping/types";

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
  dotColor?: string;
}

export function Badge({ className, children, dot, dotColor }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium tracking-wide bg-white border border-orange-200 text-orange-600",
        className
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColor ?? "bg-orange-500")} />}
      {children}
    </span>
  );
}

export function ShipmentStatusBadge({ status }: { status: ShippingStatus }) {
  const STATUS_CONFIG: Record<ShippingStatus, { label: string; className: string; dot: string }> = {
    PENDING: { label: "Pending", className: "bg-white text-orange-600 border border-orange-200", dot: "bg-orange-500" },
    DISPATCHED: { label: "Dispatched", className: "bg-white text-orange-600 border border-orange-200", dot: "bg-orange-500" },
    IN_TRANSIT: { label: "In Transit", className: "bg-white text-orange-600 border border-orange-200", dot: "bg-orange-500" },
    DELIVERED: { label: "Delivered", className: "bg-white text-green-600 border border-green-200", dot: "bg-green-500" },
    CANCELLED: { label: "Cancelled", className: "bg-white text-red-600 border border-red-200", dot: "bg-red-500" },
  };
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-800", dot: "bg-gray-400" };
  return <Badge className={cfg.className} dot dotColor={cfg.dot}>{cfg.label}</Badge>;
}

export function IntentStatusBadge({ status }: { status: ShippingIntentStatus }) {
  const INTENT_STATUS_CONFIG: Record<ShippingIntentStatus, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "bg-white text-orange-600 border border-orange-200" },
    ASSIGNED: { label: "Assigned", className: "bg-white text-orange-600 border border-orange-200" },
    COMPLETED: { label: "Completed", className: "bg-white text-green-600 border border-green-200" },
    CANCELLED: { label: "Cancelled", className: "bg-white text-red-600 border border-red-200" },
  };
  const cfg = INTENT_STATUS_CONFIG[status];
  return <Badge className={cfg?.className} dot>{cfg?.label ?? "Unknown"}</Badge>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      className={active ? "bg-white text-orange-600 border border-orange-200" : "bg-white text-gray-500 border border-gray-200"}
      dotColor={active ? "bg-orange-500" : "bg-gray-400"}
      dot
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}