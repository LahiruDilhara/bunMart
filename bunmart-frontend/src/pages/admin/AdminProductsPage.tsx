import { useState, useEffect } from "react";
import type { Product, Category } from "@/model/product";
import type { AddProductRequest, UpdateProductRequest } from "@/model/product";
import {
  getProducts,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductImage,
} from "@/service/productService";
import { ProductFormModal, ProductTable, DeleteConfirmModal, AddCategoryModal } from "@/components/admin";

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductItem, setDeleteProductItem] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleSubmitCreate = async (payload: AddProductRequest) => {
    setSaving(true);
    try {
      await addProduct(payload);
      await load();
      handleCloseForm();
    } catch (e) {
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitUpdate = async (
    productId: string,
    payload: UpdateProductRequest,
    newImageBase64?: string
  ) => {
    setSaving(true);
    try {
      await updateProduct(productId, payload);
      if (newImageBase64) {
        await updateProductImage(productId, { imageBase64: newImageBase64 });
      }
      await load();
      handleCloseForm();
    } catch (e) {
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (product: Product) => setDeleteProductItem(product);
  const handleCloseDelete = () => setDeleteProductItem(null);

  const handleConfirmDelete = async () => {
    if (!deleteProductItem) return;
    setSaving(true);
    try {
      await deleteProduct(deleteProductItem.id);
      await load();
      handleCloseDelete();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="text-muted">Loading products…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">
          Products
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <span className="material-symbols-outlined">category</span>
            Add category
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            Add product
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <ProductTable
        products={products}
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {formOpen && (
        <ProductFormModal
          categories={categories}
          product={editingProduct}
          onClose={handleCloseForm}
          onSubmitCreate={handleSubmitCreate}
          onSubmitUpdate={handleSubmitUpdate}
          saving={saving}
        />
      )}

      {deleteProductItem && (
        <DeleteConfirmModal
          productName={deleteProductItem.name}
          onClose={handleCloseDelete}
          onConfirm={handleConfirmDelete}
          saving={saving}
        />
      )}

      {categoryModalOpen && (
        <AddCategoryModal
          onClose={() => setCategoryModalOpen(false)}
          onAdded={() => {
            load();
            setCategoryModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
