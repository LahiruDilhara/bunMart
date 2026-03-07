import { useState, useEffect } from "react";
import type { Address, AddressRequest } from "@/model/profile";
import { getApiErrorMessage } from "@/utils/apiError";

const ADDRESS_TYPES = [
  { value: "DELIVERY", label: "Delivery" },
  { value: "BILLING", label: "Billing" },
];

interface AddressFormModalProps {
  address: Address | null;
  onClose: () => void;
  onSubmit: (payload: AddressRequest) => Promise<void>;
  saving: boolean;
}

const emptyForm: AddressRequest = {
  type: "DELIVERY",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export function AddressFormModal({
  address,
  onClose,
  onSubmit,
  saving,
}: AddressFormModalProps) {
  const [form, setForm] = useState<AddressRequest>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const isEdit = address != null;

  useEffect(() => {
    if (address) {
      setForm({
        type: address.type || "DELIVERY",
        street: address.street ?? "",
        city: address.city ?? "",
        state: address.state ?? "",
        postalCode: address.postalCode ?? "",
        country: address.country ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.street?.trim()) {
      setError("Street is required.");
      return;
    }
    if (!form.city?.trim()) {
      setError("City is required.");
      return;
    }
    if (!form.postalCode?.trim()) {
      setError("Postal code is required.");
      return;
    }
    if (!form.country?.trim()) {
      setError("Country is required.");
      return;
    }
    try {
      await onSubmit({
        type: form.type,
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state?.trim() || undefined,
        postalCode: form.postalCode.trim(),
        country: form.country.trim(),
      });
      onClose();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-form-title"
    >
      <div
        className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="address-form-title" className="text-lg font-bold text-foreground dark:text-white mb-4">
            {isEdit ? "Edit address" : "Add address"}
          </h2>
          {error && (
            <p className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
              >
                {ADDRESS_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Street</label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">State / Province</label>
              <input
                type="text"
                value={form.state ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Postal code</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                required
              />
            </div>
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
                className="flex-1 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? "Saving…" : isEdit ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
