// ─── components/ui/Card.tsx ───────────────────────────────
import { cn } from "@/shipping/lib/utils";
import { type ReactNode } from "react";

interface CardProps { children: ReactNode; className?: string; hover?: boolean; }
export function Card({ children, className, hover }: CardProps) {
  return <div className={cn("bg-white border border-gray-200 rounded-xl", hover && "hover:border-orange-400 transition-colors cursor-pointer", className)}>{children}</div>;
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between px-5 py-4 border-b border-gray-200", className)}>{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) { return <h3 className="text-sm font-bold tracking-tight text-gray-800 font-syne">{children}</h3>; }

// ─── StatCard ─────────────────────────────────────────────
const STAT_COLORS = {
  orange: { value: "text-orange-600", glow: "bg-orange-200" },
  green: { value: "text-green-600", glow: "bg-green-200" },
  blue: { value: "text-blue-600", glow: "bg-blue-200" },
  red: { value: "text-red-600", glow: "bg-red-200" },
};

interface StatCardProps { label: string; value: string | number; sub: string; color: keyof typeof STAT_COLORS; icon?: ReactNode; }
export function StatCard({ label, value, sub, color, icon }: StatCardProps) {
  const colors = STAT_COLORS[color] ?? { value: "text-gray-600", glow: "bg-gray-200" };

  return (
    <div className="relative p-5 overflow-hidden transition-all duration-200 bg-white border border-gray-200 rounded-xl hover:border-orange-300 group">
      <div className={cn("absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl transition-opacity group-hover:opacity-20", colors.glow)} />
      <div className="text-[10px] tracking-[2px] text-gray-500 uppercase mb-3 font-medium">{label}</div>
      <div className={cn("font-syne font-black text-3xl leading-none tracking-tight mb-2", colors.value)}>{value}</div>
      <div className="text-[11px] text-gray-500">{sub}</div>
      {icon && <div className="absolute text-4xl text-gray-200 bottom-4 right-4">{icon}</div>}
    </div>
  );
}

// ─── EmptyState ─────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-4xl text-gray-200">{icon}</div>
      <div className="mb-2 text-base font-bold text-gray-500 font-syne">{title}</div>
      {description && <div className="mb-6 text-xs text-gray-400">{description}</div>}
      {action}
    </div>
  );
}