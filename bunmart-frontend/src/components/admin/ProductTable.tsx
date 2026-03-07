import type { Product, Category } from "@/model/product";
import { ProductImage } from "@/components/product/ProductImage";

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

function getCategoryName(categories: Category[], categoryId: number | null): string {
  if (categoryId == null) return "—";
  const c = categories.find((x) => x.id === categoryId);
  return c?.name ?? String(categoryId);
}

export function ProductTable({
  products,
  categories,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-600 mb-4 block">
          inventory_2
        </span>
        <p className="text-stone-500 dark:text-stone-400">No products yet. Add your first product.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider w-16">
                Image
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Weight
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Has image
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/30"
              >
                <td className="px-4 py-3 w-16">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                    <ProductImage
                      productId={p.id}
                      hasImage={p.hasImage}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground dark:text-white">{p.name}</span>
                  {p.description && (
                    <p className="text-xs text-stone-500 truncate max-w-[200px]">{p.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">
                  {getCategoryName(categories, p.categoryId)}
                </td>
                <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">
                  {p.weight ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      p.availability
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400"
                    }`}
                  >
                    {p.availability ? "Available" : "Unavailable"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-stone-600 dark:text-stone-300">
                  {p.hasImage ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="p-2 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 hover:text-primary transition-colors"
                      aria-label="Edit"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      className="p-2 rounded-lg text-stone-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                      aria-label="Delete"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
