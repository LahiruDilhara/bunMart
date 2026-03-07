import { useState, useEffect, useMemo } from "react";
import { getProducts } from "@/service/productService";
import { getPricingProducts } from "@/service/pricingService";
import type { Product } from "@/model/product";
import type {
  PricingProduct,
  CreatePricingProductRequest,
  UpdatePricingProductRequest,
} from "@/model/pricing";

interface PricingProductFormModalProps {
  product: PricingProduct | null;
  /** When adding pricing, optionally preselect this product (e.g. from "Add pricing" on a row). */
  preselectedProduct?: Product | null;
  onClose: () => void;
  onSubmitCreate: (payload: CreatePricingProductRequest) => Promise<void>;
  onSubmitUpdate: (id: string, payload: UpdatePricingProductRequest) => Promise<void>;
  saving: boolean;
}

const emptyPriceForm = {
  rawPrice: 0,
  tax: 0,
  shippingCost: 0,
  currencyCode: "USD",
};

function matchProductSearch(p: Product, q: string): boolean {
  if (!q.trim()) return true;
  const lower = q.trim().toLowerCase();
  const name = (p.name ?? "").toLowerCase();
  const id = (p.id ?? "").toLowerCase();
  return name.includes(lower) || id.includes(lower);
}

export function PricingProductFormModal(props: PricingProductFormModalProps) {
  const { product, preselectedProduct, onClose, onSubmitCreate, onSubmitUpdate, saving } = props;
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pricingProductIds, setPricingProductIds] = useState<Set<string>>(new Set());
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(preselectedProduct ?? null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceForm, setPriceForm] = useState(emptyPriceForm);
  const [error, setError] = useState<string | null>(null);
  const isEdit = product != null;

  // Fetch products (for add mode) when modal opens in create mode; preselect product if provided
  useEffect(() => {
    if (!isEdit) {
      setProductsLoading(true);
      setSelectedProduct(preselectedProduct ?? null);
      setSearchQuery("");
      setPriceForm(emptyPriceForm);
      Promise.all([getProducts(), getPricingProducts()])
        .then(([products, pricingProducts]) => {
          setAllProducts(products);
          setPricingProductIds(new Set(pricingProducts.map((p) => p.id)));
        })
        .catch(() => setError("Failed to load products"))
        .finally(() => setProductsLoading(false));
    }
    setError(null);
  }, [isEdit, preselectedProduct]);

  // Edit mode: init form from existing pricing product
  useEffect(() => {
    if (product) {
      setPriceForm({
        rawPrice: product.rawPrice ?? 0,
        tax: product.tax ?? 0,
        shippingCost: product.shippingCost ?? 0,
        currencyCode: product.currencyCode ?? "USD",
      });
    }
    setError(null);
  }, [product]);

  const [editActive, setEditActive] = useState(true);
  useEffect(() => {
    if (product) setEditActive(product.isActive ?? true);
  }, [product]);

  const productsWithoutPricing = useMemo(() => {
    return allProducts.filter((p) => !pricingProductIds.has(p.id));
  }, [allProducts, pricingProductIds]);

  const filteredProducts = useMemo(() => {
    return productsWithoutPricing.filter((p) => matchProductSearch(p, searchQuery));
  }, [productsWithoutPricing, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (priceForm.rawPrice < 0 || priceForm.tax < 0 || priceForm.shippingCost < 0) {
      setError("Prices cannot be negative.");
      return;
    }
    try {
      if (isEdit && product) {
        await onSubmitUpdate(product.id, {
          name: product.name,
          rawPrice: priceForm.rawPrice,
          tax: priceForm.tax,
          shippingCost: priceForm.shippingCost,
          currencyCode: priceForm.currencyCode || undefined,
          isActive: editActive,
        });
      } else {
        if (!selectedProduct) {
          setError("Please select a product.");
          return;
        }
        await onSubmitCreate({
          id: selectedProduct.id,
          name: selectedProduct.name,
          rawPrice: priceForm.rawPrice,
          tax: priceForm.tax,
          shippingCost: priceForm.shippingCost,
          currencyCode: priceForm.currencyCode || undefined,
        });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    }
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setSearchQuery("");
    setPriceForm(emptyPriceForm);
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-product-form-title"
    >
      <div
        className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="pricing-product-form-title" className="text-lg font-bold text-foreground dark:text-white mb-4">
            {isEdit ? "Edit pricing" : "Add pricing for product"}
          </h2>
          {error && (
            <p className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </p>
          )}

          {isEdit ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Product</label>
                <p className="font-medium text-foreground dark:text-white">{product!.name}</p>
                <p className="font-mono text-xs text-muted">{product!.id}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Raw price</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={priceForm.rawPrice}
                    onChange={(e) => setPriceForm((f) => ({ ...f, rawPrice: Number(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Tax (%)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={priceForm.tax}
                    onChange={(e) => setPriceForm((f) => ({ ...f, tax: Number(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Shipping</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={priceForm.shippingCost}
                    onChange={(e) => setPriceForm((f) => ({ ...f, shippingCost: Number(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Currency</label>
                <input
                  type="text"
                  value={priceForm.currencyCode}
                  onChange={(e) => setPriceForm((f) => ({ ...f, currencyCode: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                  placeholder="USD"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-600"
                />
                <span className="text-sm text-stone-700 dark:text-stone-300">Active</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={handleClose} className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 font-medium hover:bg-stone-50 dark:hover:bg-stone-800">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60">
                  {saving ? "Saving…" : "Update"}
                </button>
              </div>
            </form>
          ) : (
            <>
              {!selectedProduct ? (
                <>
                  <p className="text-sm text-muted mb-3">Select a product to add pricing. Only products without pricing are listed.</p>
                  {productsLoading ? (
                    <p className="text-muted">Loading products…</p>
                  ) : (
                    <>
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or ID…"
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white placeholder:text-muted mb-3"
                        aria-label="Search products"
                      />
                      {filteredProducts.length === 0 ? (
                        <p className="text-muted text-sm">
                          {productsWithoutPricing.length === 0
                            ? "All products already have pricing."
                            : "No products match your search."}
                        </p>
                      ) : (
                        <ul className="max-h-48 overflow-y-auto border border-stone-200 dark:border-stone-700 rounded-lg divide-y divide-stone-200 dark:divide-stone-700">
                          {filteredProducts.map((p) => (
                            <li key={p.id}>
                              <button
                                type="button"
                                onClick={() => setSelectedProduct(p)}
                                className="w-full text-left px-3 py-2.5 hover:bg-stone-50 dark:hover:bg-stone-800/50 flex flex-col gap-0.5"
                              >
                                <span className="font-medium text-foreground dark:text-white">{p.name}</span>
                                <span className="font-mono text-xs text-muted">{p.id}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button type="button" onClick={handleClose} className="py-2.5 px-4 rounded-lg border border-stone-300 dark:border-stone-700 font-medium hover:bg-stone-50 dark:hover:bg-stone-800">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Product</label>
                    <p className="font-medium text-foreground dark:text-white">{selectedProduct.name}</p>
                    <p className="font-mono text-xs text-muted">{selectedProduct.id}</p>
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="mt-1 text-sm text-primary hover:underline"
                    >
                      Change product
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Raw price</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={priceForm.rawPrice}
                        onChange={(e) => setPriceForm((f) => ({ ...f, rawPrice: Number(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Tax (%)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={priceForm.tax}
                        onChange={(e) => setPriceForm((f) => ({ ...f, tax: Number(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Shipping</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={priceForm.shippingCost}
                        onChange={(e) => setPriceForm((f) => ({ ...f, shippingCost: Number(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Currency</label>
                    <input
                      type="text"
                      value={priceForm.currencyCode}
                      onChange={(e) => setPriceForm((f) => ({ ...f, currencyCode: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white"
                      placeholder="USD"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setSelectedProduct(null)} className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 font-medium hover:bg-stone-50 dark:hover:bg-stone-800">
                      Back
                    </button>
                    <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60">
                      {saving ? "Saving…" : "Add pricing"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
