import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ShippingStatus, ShippingIntentStatus, VehicleType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const STATUS_CONFIG: Record<
  ShippingStatus,
  { label: string; className: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20",
    dot: "bg-yellow-400",
  },
  DISPATCHED: {
    label: "Dispatched",
    className: "bg-accent/10 text-accent border border-accent/20",
    dot: "bg-accent",
  },
  IN_TRANSIT: {
    label: "In Transit",
    className: "bg-info/10 text-indigo-400 border border-info/20",
    dot: "bg-indigo-400",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-success/10 text-success border border-success/20",
    dot: "bg-success",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-danger/10 text-danger border border-danger/20",
    dot: "bg-danger",
  },
};

export const INTENT_STATUS_CONFIG: Record<
  ShippingIntentStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-info/10 text-indigo-400 border border-info/20",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-success/10 text-success border border-success/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-danger/10 text-danger border border-danger/20",
  },
};

export const VEHICLE_ICON: Record<VehicleType, string> = {
  VAN: "🚐",
  CAR: "🚗",
  BIKE: "🏍️",
  TRUCK: "🚚",
};
