// ─── components/ui/Form.tsx ───────────────────────────────
import { cn } from "@/shipping/lib/utils";
import { type InputHTMLAttributes, type SelectHTMLAttributes, forwardRef } from "react";

// ─── Label
export function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] tracking-[1.5px] text-gray-600 uppercase mb-1.5 font-medium">
      {children}{required && <span className="text-red-600 ml-0.5">*</span>}
    </label>
  );
}

// ─── Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { error?: string; }
export const FormInput = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <div>
    <input
      ref={ref}
      className={cn("w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors",
        error ? "border-red-600 focus:border-red-600" : "border-gray-200 focus:border-orange-400",
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
FormInput.displayName = "FormInput";

// ─── Select
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { error?: string; options: { value: string; label: string }[]; }
export function FormSelect({ options, error, className, ...props }: SelectProps) {
  return (
    <div>
      <select className={cn("w-full bg-white border rounded-lg px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-colors appearance-none cursor-pointer",
        error ? "border-red-600" : "border-gray-200 focus:border-orange-400",
        className
      )} {...props}>
        {options.map(opt => <option key={opt.value} value={opt.value} className="text-gray-800 bg-white">{opt.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Toggle
interface ToggleProps { checked: boolean; onChange: (v: boolean) => void; label?: string; }
export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
        <div className={cn("w-10 h-5 rounded-full transition-colors duration-200 border",
          checked ? "bg-orange-200 border-orange-400" : "bg-gray-200 border-gray-300"
        )} />
        <div className={cn("absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-200 border",
          checked ? "translate-x-5 bg-orange-500 border-orange-500" : "translate-x-0 bg-white border-gray-400"
        )} />
      </div>
      {label && <span className="text-xs text-gray-800">{label}</span>}
    </label>
  );
}

// ─── Form Layout Components
export function FormGroup({ children }: { children: React.ReactNode }) { return <div className="mb-4">{children}</div>; }
export function FormRow({ children }: { children: React.ReactNode }) { return <div className="grid grid-cols-2 gap-4">{children}</div>; }
export function FormActions({ children }: { children: React.ReactNode }) { return <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-gray-200">{children}</div>; }