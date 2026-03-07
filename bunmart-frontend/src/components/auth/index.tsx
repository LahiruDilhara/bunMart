import type React from "react";
import { Link } from "react-router-dom";

interface AuthHeaderProps {
  imageUrl?: string;
  /** When true, the BunMart title links to home */
  linkToHome?: boolean;
}

export function AuthHeader({ imageUrl, linkToHome }: AuthHeaderProps) {
  return (
    <div className="relative h-36 flex items-center justify-center bg-primary/10 overflow-hidden">
      {imageUrl && (
        <div className="absolute inset-0 opacity-20">
          <img src={imageUrl} alt="Warm bakery background" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="bg-primary p-2 rounded-lg shadow-lg">
            <span className="material-symbols-outlined text-white text-3xl">bakery_dining</span>
          </div>
        </div>
        {linkToHome ? (
          <Link to="/" className="text-2xl font-bold text-stone-900 dark:text-stone-100 hover:text-primary transition-colors">
            BunMart
          </Link>
        ) : (
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">BunMart</h1>
        )}
      </div>
    </div>
  );
}

interface AuthInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: string;
  rightSlot?: React.ReactNode;
}

export function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon,
  rightSlot,
}: AuthInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-stone-400 text-sm">{icon}</span>
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "block w-full py-2.5 border bg-white dark:bg-stone-800",
            "text-stone-900 dark:text-stone-100 rounded-lg",
            "focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all",
            icon ? "pl-10" : "pl-3",
            rightSlot ? "pr-10" : "pr-3",
            error ? "border-red-400 dark:border-red-500" : "border-stone-300 dark:border-stone-700",
          ].join(" ")}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">{rightSlot}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function AuthErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">error_outline</span>
        {message}
      </p>
    </div>
  );
}

export function AuthDivider({ label = "Or continue with" }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-stone-200 dark:border-stone-800" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white dark:bg-stone-900 text-stone-500 dark:text-stone-400">
          {label}
        </span>
      </div>
    </div>
  );
}

export function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        className="flex items-center justify-center px-4 py-2.5 border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        aria-label="Continue with Google"
      >
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Google</span>
      </button>
      <button
        type="button"
        className="flex items-center justify-center px-4 py-2.5 border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
        aria-label="Continue with Apple"
      >
        <span className="material-symbols-outlined text-stone-700 dark:text-stone-300 mr-2 text-xl">apple</span>
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Apple</span>
      </button>
    </div>
  );
}

export function AuthFooterLinks() {
  return (
    <div className="mt-8 text-center">
      <div className="inline-flex space-x-4 text-xs text-stone-500 dark:text-stone-600">
        <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
        <span>•</span>
        <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
        <span>•</span>
        <a href="/support" className="hover:text-primary transition-colors">Contact Support</a>
      </div>
    </div>
  );
}

export function SubmitButton({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {loading ? "Please wait…" : label}
    </button>
  );
}
