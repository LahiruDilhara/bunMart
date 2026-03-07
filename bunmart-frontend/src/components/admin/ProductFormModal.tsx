import { useState, useRef } from "react";
import type { Product, Category, AddProductRequest, UpdateProductRequest } from "@/model/product";

interface ProductFormModalProps {
  categories: Category[];
  product: Product | null;
  onClose: () => void;
  onSubmitCreate: (payload: AddProductRequest) => Promise<void>;
  onSubmitUpdate: (
    productId: string,
    payload: UpdateProductRequest,
    newImageBase64?: string
  ) => Promise<void>;
  saving: boolean;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64 ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductFormModal({
  categories,
  product,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  saving,
}: ProductFormModalProps) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState<number>(product?.categoryId ?? categories[0]?.id ?? 0);
  const [weight, setWeight] = useState(product?.weight ?? "");
  const [availability, setAvailability] = useState(product?.availability ?? true);
  const [tagsStr, setTagsStr] = useState(
    product?.tags?.length ? product.tags.join(", ") : ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file ?? null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const nameTrim = name.trim();
    if (!nameTrim) {
      setFormError("Name is required.");
      return;
    }
    if (!isEdit && !imageFile) {
      setFormError("Image is required when creating a product.");
      return;
    }
    const tags = tagsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (isEdit && product) {
        const payload: UpdateProductRequest = {
          name: nameTrim,
          description: description.trim() || undefined,
          categoryId: categoryId || undefined,
          weight: weight.trim() || undefined,
          availability,
          tags: tags.length ? tags : undefined,
        };
        let newImageBase64: string | undefined;
        if (imageFile) {
          newImageBase64 = await fileToBase64(imageFile);
        }
        await onSubmitUpdate(product.id, payload, newImageBase64);
      } else {
        if (!imageFile) return;
        const imageBase64 = await fileToBase64(imageFile);
        const payload: AddProductRequest = {
          categoryId,
          name: nameTrim,
          imageBase64,
          description: description.trim() || undefined,
          tags: tags.length ? tags : undefined,
          weight: weight.trim() || undefined,
          availability,
        };
        await onSubmitCreate(payload);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-form-title"
    >
      <div
        className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-stone-200 dark:border-stone-800">
          <h2 id="product-form-title" className="text-xl font-bold text-foreground dark:text-white">
            {isEdit ? "Edit product" : "Add product"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-foreground dark:text-white"
              placeholder="Product name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-foreground dark:text-white"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-foreground dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              {categories.length === 0 && (
                <option value={0}>No categories — create one first</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Weight
            </label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-foreground dark:text-white"
              placeholder="e.g. 500g"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-foreground dark:text-white"
              placeholder="e.g. organic, sourdough"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="availability"
              checked={availability}
              onChange={(e) => setAvailability(e.target.checked)}
              className="rounded border-stone-300 text-primary focus:ring-primary"
            />
            <label htmlFor="availability" className="text-sm text-stone-700 dark:text-stone-300">
              Available
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Image {!isEdit && "*"}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-stone-500 file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-medium"
            />
            {isEdit && (
              <p className="text-xs text-stone-500 mt-1">Leave empty to keep current image.</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-50 dark:hover:bg-stone-800"
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
  );
}
