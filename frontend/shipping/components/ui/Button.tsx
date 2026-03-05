// ─── components/ui/Button.tsx ───────────────────────────────
import { cn } from "@/shipping/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "outline", size = "md", loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-150 rounded-lg border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
        variant === "primary" && "bg-orange-500 text-white border-transparent hover:bg-orange-600 active:scale-[0.98]",
        variant === "outline" && "bg-white text-orange-600 border-orange-300 hover:border-orange-500 hover:text-orange-700 active:scale-[0.98]",
        variant === "danger" && "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 active:scale-[0.98]",
        variant === "ghost" && "bg-white text-orange-600 border-transparent hover:bg-orange-50 hover:text-orange-700",
        size === "sm" && "text-[11px] px-3 py-1.5",
        size === "md" && "text-xs px-4 py-2.5",
        size === "lg" && "text-sm px-5 py-3",
        className
      )}
      {...props}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";