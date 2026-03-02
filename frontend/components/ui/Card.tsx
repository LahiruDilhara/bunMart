import { cn } from "@/lib/utils";

// ─── Base Card ─────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl",
        hover && "hover:border-accent/40 transition-colors cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Card Header ───────────────────────────────────────────────────────────
export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-4 border-b border-border",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-syne font-bold text-sm tracking-tight">{children}</h3>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
const STAT_COLORS = {
  orange: {
    value: "text-accent",
    glow: "bg-accent",
  },
  green: {
    value: "text-success",
    glow: "bg-success",
  },
  blue: {
    value: "text-indigo-400",
    glow: "bg-indigo-400",
  },
  yellow: {
    value: "text-yellow-400",
    glow: "bg-yellow-400",
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  color: keyof typeof STAT_COLORS;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, sub, color, icon }: StatCardProps) {
  const colors = STAT_COLORS[color];

  return (
    <div className="relative bg-surface border border-border rounded-xl p-5 overflow-hidden hover:border-white/20 transition-all duration-200 group">
      {/* Background glow blob */}
      <div
        className={cn(
          "absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-[0.06] blur-xl transition-opacity group-hover:opacity-10",
          colors.glow
        )}
      />

      <div className="text-[10px] tracking-[2px] text-muted uppercase mb-3 font-medium">
        {label}
      </div>

      <div className={cn("font-syne font-black text-3xl leading-none tracking-tight mb-2", colors.value)}>
        {value}
      </div>

      <div className="text-[11px] text-muted">{sub}</div>

      {icon && (
        <div className="absolute bottom-4 right-4 text-white/5 text-4xl">{icon}</div>
      )}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-4xl opacity-20 mb-4">{icon}</div>
      <div className="font-syne font-bold text-base mb-2 text-white/50">{title}</div>
      {description && (
        <div className="text-xs text-muted mb-6">{description}</div>
      )}
      {action}
    </div>
  );
}
