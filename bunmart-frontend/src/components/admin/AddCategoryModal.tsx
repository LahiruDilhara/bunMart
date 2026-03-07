import { useState } from "react";
import type { Category } from "@/model/product";
import { addCategory } from "@/service/productService";

interface AddCategoryModalProps {
  onClose: () => void;
  onAdded: (category: Category) => void;
}

export function AddCategoryModal({ onClose, onAdded }: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameTrim = name.trim();
    if (!nameTrim) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const category = await addCategory({
        name: nameTrim,
        description: description.trim() || undefined,
      });
      onAdded(category);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-sm w-full p-6 border border-stone-200 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-foreground dark:text-white mb-4">
          Add category
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              placeholder="e.g. Bread"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
              placeholder="Optional"
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
              className="flex-1 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
