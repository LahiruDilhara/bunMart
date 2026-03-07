import { useState, useEffect } from "react";
import type {
  Coupon,
  CreateCouponRequest,
  UpdateCouponRequest,
} from "@/model/pricing";

const TYPES = ["PERCENT", "FIXED"] as const;

interface CouponFormModalProps {
  coupon: Coupon | null;
  onClose: () => void;
  onSubmitCreate: (payload: CreateCouponRequest) => Promise<void>;
  onSubmitUpdate: (id: number, payload: UpdateCouponRequest) => Promise<void>;
  saving: boolean;
}

const emptyForm: CreateCouponRequest = {
  code: "",
  type: "PERCENT",
  value: 0,
  description: "",
  productId: "",
  minQuantity: undefined,
  minOrderAmount: undefined,
  usageLimit: undefined,
  expiresAt: undefined,
};

function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

export function CouponFormModal({
  coupon,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  saving,
}: CouponFormModalProps) {
  const [form, setForm] = useState<CreateCouponRequest & { isActive?: boolean; expiresAtInput?: string }>({
    ...emptyForm,
    expiresAtInput: "",
  });
  const [error, setError] = useState<string | null>(null);

  const isEdit = coupon != null;

  useEffect(() => {
    if (coupon) {
      setForm({
        code: coupon.code,
        productId: coupon.productId ?? "",
        minQuantity: coupon.minQuantity ?? undefined,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description ?? "",
        minOrderAmount: coupon.minOrderAmount ?? undefined,
        usageLimit: coupon.usageLimit ?? undefined,
        expiresAt: coupon.expiresAt ?? undefined,
        isActive: coupon.isActive ?? true,
        expiresAtInput: toDateInput(coupon.expiresAt),
      });
    } else {
      setForm({ ...emptyForm, expiresAtInput: "" });
    }
    setError(null);
  }, [coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.code.trim()) {
      setError("Code is required.");
      return;
    }
    try {
      const payload = {
        code: form.code.trim(),
        productId: form.productId?.trim() || undefined,
        minQuantity: form.minQuantity,
        type: form.type,
        value: form.value,
        description: form.description?.trim() || undefined,
        minOrderAmount: form.minOrderAmount,
        usageLimit: form.usageLimit,
        expiresAt: form.expiresAtInput ? new Date(form.expiresAtInput).toISOString() : undefined,
      };
      if (isEdit && coupon) {
        await onSubmitUpdate(coupon.id, { ...payload, isActive: form.isActive });
      } else {
        await onSubmitCreate(payload);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="coupon-form-title"
    >
      <div
        className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="coupon-form-title" className="text-lg font-bold text-foreground dark:text-white mb-4">
            {isEdit ? "Edit coupon" : "Add coupon"}
          </h2>
          {error && (
            <p className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Code
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Value
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Product ID (optional)
              </label>
              <input
                type="text"
                value={form.productId ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Min quantity (optional)
              </label>
              <input
                type="number"
                min={0}
                value={form.minQuantity ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, minQuantity: e.target.value === "" ? undefined : Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Min order amount (optional)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.minOrderAmount ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: e.target.value === "" ? undefined : Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Usage limit (optional)
              </label>
              <input
                type="number"
                min={0}
                value={form.usageLimit ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value === "" ? undefined : Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Expires at (optional)
              </label>
              <input
                type="datetime-local"
                value={form.expiresAtInput ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, expiresAtInput: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
              />
            </div>
            {isEdit && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-stone-300 dark:border-stone-600"
                />
                <span className="text-sm text-stone-700 dark:text-stone-300">Active</span>
              </label>
            )}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 font-medium hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? "Saving…" : isEdit ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
