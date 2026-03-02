import { cn } from "@/lib/utils";
import type { ShippingStatus, ShippingIntentStatus } from "@/types";
import { STATUS_CONFIG, INTENT_STATUS_CONFIG } from "@/lib/utils";

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
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium tracking-wide",
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dotColor ?? "bg-current")} />
      )}
      {children}
    </span>
  );
}

export function ShipmentStatusBadge({ status }: { status: ShippingStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge className={cfg.className} dot dotColor={cfg.dot}>
      {cfg.label}
    </Badge>
  );
}

export function IntentStatusBadge({ status }: { status: ShippingIntentStatus }) {
  const cfg = INTENT_STATUS_CONFIG[status];
  return (
    <Badge className={cfg.className} dot>
      {cfg.label}
    </Badge>
  );
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      className={
        active
          ? "bg-success/10 text-success border border-success/20"
          : "bg-muted/10 text-muted border border-muted/20"
      }
      dot
      dotColor={active ? "bg-success" : "bg-muted"}
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}
