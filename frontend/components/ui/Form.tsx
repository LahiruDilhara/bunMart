import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, type SelectHTMLAttributes, forwardRef } from "react";

// ─── Label ─────────────────────────────────────────────────────────────────
export function FormLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-[10px] tracking-[1.5px] text-muted uppercase mb-1.5 font-medium">
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div>
      <input
        ref={ref}
        className={cn(
          "w-full bg-surface2 border rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-muted outline-none transition-colors font-mono-custom",
          error ? "border-danger focus:border-danger" : "border-border focus:border-accent",
          className
        )}
        {...props}
      />
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  )
);
FormInput.displayName = "FormInput";

// ─── Select ────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({ options, error, className, ...props }: SelectProps) {
  return (
    <div>
      <select
        className={cn(
          "w-full bg-surface2 border rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors font-mono-custom appearance-none cursor-pointer",
          error ? "border-danger" : "border-border focus:border-accent",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface2">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Toggle ────────────────────────────────────────────────────────────────
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={cn(
            "w-10 h-5 rounded-full transition-colors duration-200",
            checked ? "bg-accent/30" : "bg-border"
          )}
        />
        <div
          className={cn(
            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-200",
            checked ? "translate-x-5 bg-accent" : "translate-x-0 bg-muted"
          )}
        />
      </div>
      {label && <span className="text-xs text-white">{label}</span>}
    </label>
  );
}

// ─── Form Group ────────────────────────────────────────────────────────────
export function FormGroup({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

// ─── Form Row ──────────────────────────────────────────────────────────────
export function FormRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

// ─── Form Actions ──────────────────────────────────────────────────────────
export function FormActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
      {children}
    </div>
  );
}
