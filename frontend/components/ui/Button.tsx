import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "outline", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-mono-custom font-medium tracking-wide transition-all duration-150 rounded-lg border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
          // variants
          variant === "primary" &&
            "bg-accent text-bg border-transparent hover:bg-amber-400 active:scale-[0.98]",
          variant === "outline" &&
            "bg-transparent border-border text-white hover:border-accent/60 hover:text-accent active:scale-[0.98]",
          variant === "danger" &&
            "bg-danger/10 border-danger/40 text-danger hover:bg-danger/20 active:scale-[0.98]",
          variant === "ghost" &&
            "bg-transparent border-transparent text-muted hover:text-white hover:bg-surface2",
          // sizes
          size === "sm" && "text-[11px] px-3 py-1.5",
          size === "md" && "text-xs px-4 py-2.5",
          size === "lg" && "text-sm px-5 py-3",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
