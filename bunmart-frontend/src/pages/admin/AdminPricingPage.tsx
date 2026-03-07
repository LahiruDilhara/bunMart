import { useState, useEffect } from "react";
import { getProducts } from "@/service/productService";
import {
  getPricingProducts,
  getDiscounts,
  getCoupons,
  createPricingProduct,
  updatePricingProduct,
  deletePricingProduct,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/service/pricingService";
import type { Product } from "@/model/product";
import type {
  PricingProduct,
  Discount,
  Coupon,
  CreatePricingProductRequest,
  UpdatePricingProductRequest,
  CreateDiscountRequest,
  UpdateDiscountRequest,
  CreateCouponRequest,
  UpdateCouponRequest,
} from "@/model/pricing";
import {
  PricingProductFormModal,
  DiscountFormModal,
  CouponFormModal,
  ConfirmModal,
} from "@/components/admin";
import { ProductImage } from "@/components/product/ProductImage";

export function AdminPricingPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [pricingProducts, setPricingProducts] = useState<PricingProduct[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "discounts" | "coupons">("products");
  const [saving, setSaving] = useState(false);

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PricingProduct | null>(null);
  const [preselectedProduct, setPreselectedProduct] = useState<Product | null>(null);
  const [deleteProductItem, setDeleteProductItem] = useState<PricingProduct | null>(null);

  const [discountFormOpen, setDiscountFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteDiscountItem, setDeleteDiscountItem] = useState<Discount | null>(null);

  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteCouponItem, setDeleteCouponItem] = useState<Coupon | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [products, pricing, disc, coup] = await Promise.all([
        getProducts(),
        getPricingProducts(),
        getDiscounts(),
        getCoupons(),
      ]);
      setAllProducts(products);
      setPricingProducts(pricing);
      setDiscounts(disc);
      setCoupons(coup);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pricing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setPreselectedProduct(null);
    setProductFormOpen(true);
  };
  const handleAddPricingForProduct = (product: Product) => {
    setEditingProduct(null);
    setPreselectedProduct(product);
    setProductFormOpen(true);
  };
  const handleEditProduct = (p: PricingProduct) => {
    setEditingProduct(p);
    setPreselectedProduct(null);
    setProductFormOpen(true);
  };
  const handleCloseProductForm = () => {
    setProductFormOpen(false);
    setEditingProduct(null);
    setPreselectedProduct(null);
  };
  const handleSubmitCreateProduct = async (payload: CreatePricingProductRequest) => {
    setSaving(true);
    try {
      await createPricingProduct(payload);
      await load();
      handleCloseProductForm();
    } finally {
      setSaving(false);
    }
  };
  const handleSubmitUpdateProduct = async (id: string, payload: UpdatePricingProductRequest) => {
    setSaving(true);
    try {
      await updatePricingProduct(id, payload);
      await load();
      handleCloseProductForm();
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteProductClick = (p: PricingProduct) => setDeleteProductItem(p);
  const handleConfirmDeleteProduct = async () => {
    if (!deleteProductItem) return;
    setSaving(true);
    try {
      await deletePricingProduct(deleteProductItem.id);
      await load();
      setDeleteProductItem(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDiscount = () => {
    setEditingDiscount(null);
    setDiscountFormOpen(true);
  };
  const handleEditDiscount = (d: Discount) => {
    setEditingDiscount(d);
    setDiscountFormOpen(true);
  };
  const handleCloseDiscountForm = () => {
    setDiscountFormOpen(false);
    setEditingDiscount(null);
  };
  const handleSubmitCreateDiscount = async (payload: CreateDiscountRequest) => {
    setSaving(true);
    try {
      await createDiscount(payload);
      await load();
      handleCloseDiscountForm();
    } finally {
      setSaving(false);
    }
  };
  const handleSubmitUpdateDiscount = async (id: number, payload: UpdateDiscountRequest) => {
    setSaving(true);
    try {
      await updateDiscount(id, payload);
      await load();
      handleCloseDiscountForm();
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteDiscountClick = (d: Discount) => setDeleteDiscountItem(d);
  const handleConfirmDeleteDiscount = async () => {
    if (!deleteDiscountItem) return;
    setSaving(true);
    try {
      await deleteDiscount(deleteDiscountItem.id);
      await load();
      setDeleteDiscountItem(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponFormOpen(true);
  };
  const handleEditCoupon = (c: Coupon) => {
    setEditingCoupon(c);
    setCouponFormOpen(true);
  };
  const handleCloseCouponForm = () => {
    setCouponFormOpen(false);
    setEditingCoupon(null);
  };
  const handleSubmitCreateCoupon = async (payload: CreateCouponRequest) => {
    setSaving(true);
    try {
      await createCoupon(payload);
      await load();
      handleCloseCouponForm();
    } finally {
      setSaving(false);
    }
  };
  const handleSubmitUpdateCoupon = async (id: number, payload: UpdateCouponRequest) => {
    setSaving(true);
    try {
      await updateCoupon(id, payload);
      await load();
      handleCloseCouponForm();
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteCouponClick = (c: Coupon) => setDeleteCouponItem(c);
  const handleConfirmDeleteCoupon = async () => {
    if (!deleteCouponItem) return;
    setSaving(true);
    try {
      await deleteCoupon(deleteCouponItem.id);
      await load();
      setDeleteCouponItem(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="text-muted">Loading pricing…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground dark:text-white mb-6">
        Pricing
      </h1>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-stone-200 dark:border-stone-800">
        {(["products", "discounts", "coupons"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-primary/15 text-primary dark:bg-primary/20"
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "products" && (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark overflow-hidden">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold text-foreground dark:text-white">Product prices</h2>
            <button
              type="button"
              onClick={handleCreateProduct}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90"
            >
              <span className="material-symbols-outlined">add</span>
              Add pricing
            </button>
          </div>
          <div className="overflow-x-auto">
            {allProducts.length === 0 ? (
              <div className="p-12 text-center text-muted">
                No products yet. Create a product in the Products section first, then add pricing here.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase w-16">Image</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Raw price</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Tax</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Shipping</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Active</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allProducts.map((prod) => {
                    const pricing = pricingProducts.find((p) => p.id === prod.id);
                    const hasPricing = pricing != null;
                    return (
                      <tr key={prod.id} className="border-b border-stone-100 dark:border-stone-800">
                        <td className="px-4 py-3 w-16">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                            <ProductImage
                              productId={prod.id}
                              hasImage={prod.hasImage}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">{prod.name}</td>
                        <td className="px-4 py-3">
                          {hasPricing ? (
                            <span className="text-green-600 dark:text-green-400 text-sm">Has pricing</span>
                          ) : (
                            <span className="text-stone-500 dark:text-stone-400 text-sm">No pricing</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{hasPricing ? pricing.rawPrice : "—"}</td>
                        <td className="px-4 py-3 text-sm">{hasPricing ? pricing.tax : "—"}</td>
                        <td className="px-4 py-3 text-sm">{hasPricing ? pricing.shippingCost : "—"}</td>
                        <td className="px-4 py-3">
                          {hasPricing ? (
                            <span className={pricing.isActive ? "text-green-600" : "text-stone-400"}>
                              {pricing.isActive ? "Yes" : "No"}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 flex gap-2 flex-wrap">
                          {hasPricing ? (
                            <>
                              <button type="button" onClick={() => handleEditProduct(pricing)} className="text-primary font-medium text-sm hover:underline">Edit</button>
                              <button type="button" onClick={() => handleDeleteProductClick(pricing)} className="text-red-600 dark:text-red-400 font-medium text-sm hover:underline">Delete</button>
                            </>
                          ) : (
                            <button type="button" onClick={() => handleAddPricingForProduct(prod)} className="text-primary font-medium text-sm hover:underline">Add pricing</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "discounts" && (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark overflow-hidden">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold text-foreground dark:text-white">Discounts</h2>
            <button
              type="button"
              onClick={handleCreateDiscount}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90"
            >
              <span className="material-symbols-outlined">add</span>
              Add discount
            </button>
          </div>
          <div className="overflow-x-auto">
            {(() => {
              const discountsForCurrentProducts = discounts.filter((d) =>
                allProducts.some((p) => p.id === d.productId)
              );
              return discountsForCurrentProducts.length === 0 ? (
                <div className="p-12 text-center text-muted">
                  No products with discounts yet. Add a discount for a product above.
                </div>
              ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Min qty</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Active</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discountsForCurrentProducts.map((d) => {
                    const product = allProducts.find((p) => p.id === d.productId);
                    const productLabel = product ? product.name : d.productId;
                    return (
                    <tr key={d.id} className="border-b border-stone-100 dark:border-stone-800">
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground dark:text-white">{productLabel}</span>
                        <span className="font-mono text-xs text-muted ml-1">({d.productId})</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{d.minQuantity}</td>
                      <td className="px-4 py-3 text-sm">{d.type}</td>
                      <td className="px-4 py-3 text-sm">{d.value}</td>
                      <td className="px-4 py-3">{d.isActive ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button type="button" onClick={() => handleEditDiscount(d)} className="text-primary font-medium text-sm hover:underline">Edit</button>
                        <button type="button" onClick={() => handleDeleteDiscountClick(d)} className="text-red-600 dark:text-red-400 font-medium text-sm hover:underline">Delete</button>
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === "coupons" && (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark overflow-hidden">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-semibold text-foreground dark:text-white">Coupons</h2>
            <button
              type="button"
              onClick={handleCreateCoupon}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90"
            >
              <span className="material-symbols-outlined">add</span>
              Add coupon
            </button>
          </div>
          <div className="overflow-x-auto">
            {coupons.length === 0 ? (
              <div className="p-12 text-center text-muted">No coupons yet.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Code</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Used</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Active</th>
                    <th className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-b border-stone-100 dark:border-stone-800">
                      <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                      <td className="px-4 py-3 text-sm">{c.type}</td>
                      <td className="px-4 py-3 text-sm">{c.value}</td>
                      <td className="px-4 py-3 text-sm">{c.usedCount ?? 0}</td>
                      <td className="px-4 py-3">{c.isActive ? "Yes" : "No"}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button type="button" onClick={() => handleEditCoupon(c)} className="text-primary font-medium text-sm hover:underline">Edit</button>
                        <button type="button" onClick={() => handleDeleteCouponClick(c)} className="text-red-600 dark:text-red-400 font-medium text-sm hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {productFormOpen && (
        <PricingProductFormModal
          product={editingProduct}
          preselectedProduct={preselectedProduct}
          onClose={handleCloseProductForm}
          onSubmitCreate={handleSubmitCreateProduct}
          onSubmitUpdate={handleSubmitUpdateProduct}
          saving={saving}
        />
      )}
      {discountFormOpen && (
        <DiscountFormModal
          discount={editingDiscount}
          products={allProducts}
          preselectedProduct={null}
          onClose={handleCloseDiscountForm}
          onSubmitCreate={handleSubmitCreateDiscount}
          onSubmitUpdate={handleSubmitUpdateDiscount}
          saving={saving}
        />
      )}
      {couponFormOpen && (
        <CouponFormModal
          coupon={editingCoupon}
          onClose={handleCloseCouponForm}
          onSubmitCreate={handleSubmitCreateCoupon}
          onSubmitUpdate={handleSubmitUpdateCoupon}
          saving={saving}
        />
      )}
      {deleteProductItem && (
        <ConfirmModal
          title="Delete pricing product"
          message={<>Are you sure you want to delete <strong>{deleteProductItem.name}</strong>? This cannot be undone.</>}
          confirmLabel="Delete"
          onClose={() => setDeleteProductItem(null)}
          onConfirm={handleConfirmDeleteProduct}
          saving={saving}
        />
      )}
      {deleteDiscountItem && (
        <ConfirmModal
          title="Delete discount"
          message={<>Are you sure you want to delete this discount for {allProducts.find((p) => p.id === deleteDiscountItem.productId)?.name ?? deleteDiscountItem.productId} (min qty {deleteDiscountItem.minQuantity})?</>}
          confirmLabel="Delete"
          onClose={() => setDeleteDiscountItem(null)}
          onConfirm={handleConfirmDeleteDiscount}
          saving={saving}
        />
      )}
      {deleteCouponItem && (
        <ConfirmModal
          title="Delete coupon"
          message={<>Are you sure you want to delete coupon <strong>{deleteCouponItem.code}</strong>?</>}
          confirmLabel="Delete"
          onClose={() => setDeleteCouponItem(null)}
          onConfirm={handleConfirmDeleteCoupon}
          saving={saving}
        />
      )}
    </div>
  );
}
