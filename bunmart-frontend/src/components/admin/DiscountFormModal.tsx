import { useState, useEffect } from "react";
import type {
  Discount,
  CreateDiscountRequest,
  UpdateDiscountRequest,
} from "@/model/pricing";
import type { Product } from "@/model/product";

const TYPES = ["PERCENT", "FIXED"] as const;

interface DiscountFormModalProps {
  discount: Discount | null;
  /** List of products to choose from (e.g. from AdminPricingPage). */
  products: Product[];
  /** When adding, optionally preselect this product. */
  preselectedProduct?: Product | null;
  onClose: () => void;
  onSubmitCreate: (payload: CreateDiscountRequest) => Promise<void>;
  onSubmitUpdate: (id: number, payload: UpdateDiscountRequest) => Promise<void>;
  saving: boolean;
}

const emptyForm: CreateDiscountRequest = {
  productId: "",
  minQuantity: 1,
  type: "PERCENT",
  value: 0,
  description: "",
};

export function DiscountFormModal({
  discount,
  products,
  preselectedProduct,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  saving,
}: DiscountFormModalProps) {
  const [form, setForm] = useState<CreateDiscountRequest & { isActive?: boolean }>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const isEdit = discount != null;

  useEffect(() => {
    if (discount) {
      setForm({
        productId: discount.productId,
        minQuantity: discount.minQuantity,
        type: discount.type,
        value: discount.value,
        description: discount.description ?? "",
        isActive: discount.isActive ?? true,
      });
    } else {
      setForm({
        ...emptyForm,
        productId: preselectedProduct?.id ?? "",
      });
    }
    setError(null);
  }, [discount, preselectedProduct?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.productId.trim()) {
      setError("Please select a product.");
      return;
    }
    if (form.minQuantity < 1) {
      setError("Min quantity must be at least 1.");
      return;
    }
    try {
      if (isEdit && discount) {
        await onSubmitUpdate(discount.id, {
          productId: form.productId,
          minQuantity: form.minQuantity,
          type: form.type,
          value: form.value,
          description: form.description || undefined,
          isActive: form.isActive,
        });
      } else {
        await onSubmitCreate({
          productId: form.productId.trim(),
          minQuantity: form.minQuantity,
          type: form.type,
          value: form.value,
          description: form.description?.trim() || undefined,
        });
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
      aria-labelledby="discount-form-title"
    >
      <div
        className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="discount-form-title" className="text-lg font-bold text-foreground dark:text-white mb-4">
            {isEdit ? "Edit discount" : "Add discount"}
          </h2>
          {error && (
            <p className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Product
              </label>
              <select
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                required
                disabled={isEdit}
                aria-label="Select product"
              >
                <option value="">Select a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
              {isEdit && (
                <p className="text-xs text-muted mt-1">Product cannot be changed when editing.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Min quantity
              </label>
              <input
                type="number"
                min={1}
                value={form.minQuantity}
                onChange={(e) => setForm((f) => ({ ...f, minQuantity: Number(e.target.value) || 1 }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
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
              {form.type === "PERCENT" && (
                <p className="text-xs text-muted mt-1">Percentage (e.g. 10 for 10%)</p>
              )}
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
