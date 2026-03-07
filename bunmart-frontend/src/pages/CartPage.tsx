import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartViewModel } from "@/viewmodel/useCartViewModel";
import { ProductImage } from "@/components/product/ProductImage";

export function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    loading,
    error,
    updatingProductId,
    handleQuantityChange,
    handleRemove,
    handleClearCart,
  } = useCartViewModel();

  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (items.length > 0) {
      setSelectedProductIds((prev) => {
        const ids = new Set(items.map((i) => i.productId));
        const next = new Set([...prev].filter((id) => ids.has(id)));
        ids.forEach((id) => {
          if (!prev.has(id)) next.add(id);
        });
        return next.size > 0 ? next : ids;
      });
    } else {
      setSelectedProductIds(new Set());
    }
  }, [items]);

  const toggleSelection = (productId: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const selectAll = () => setSelectedProductIds(new Set(items.map((i) => i.productId)));
  const selectNone = () => setSelectedProductIds(new Set());

  const selectedCount = selectedProductIds.size;
  const handlePlaceOrder = () => {
    if (selectedCount === 0) return;
    navigate("/checkout", { state: { selectedProductIds: Array.from(selectedProductIds) } });
  };

  if (loading) {
    return (
      <div className="flex flex-col px-4 md:px-10 lg:px-40 py-8">
        <div className="flex items-center justify-center py-24">
          <p className="text-muted">Loading your basket…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col px-4 md:px-10 lg:px-40 py-8">
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-red-500">{error}</p>
          <p className="text-muted text-sm">Cart service may be unavailable. Try again later.</p>
          <Link to="/" className="text-primary font-semibold hover:underline">Back to home</Link>
        </div>
      </div>
    );
  }

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <main className="flex-1 flex flex-col px-4 md:px-10 lg:px-40 py-8 bg-white dark:bg-background-dark text-foreground dark:text-white">
      <nav className="text-sm text-muted mb-4">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <span>Cart</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6">
        Your basket {itemCount > 0 && `(${itemCount} item${itemCount !== 1 ? "s" : ""})`}
      </h1>
      {items.length === 0 ? (
        <div className="py-12 text-center text-muted">
          <p className="mb-4">Your basket is empty.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">Select the items you want to include when you place your order.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-sm py-1.5 px-3 rounded-lg border border-stone-300 dark:border-stone-600 font-medium hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={selectNone}
              className="text-sm py-1.5 px-3 rounded-lg border border-stone-300 dark:border-stone-600 font-medium hover:bg-stone-50 dark:hover:bg-stone-800"
            >
              Select none
            </button>
          </div>
          {items.map((item) => {
            const selected = selectedProductIds.has(item.productId);
            return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => toggleSelection(item.productId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleSelection(item.productId);
                }
              }}
              className={`flex flex-wrap items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                selected ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50"
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800">
                <ProductImage
                  productId={item.productId}
                  hasImage={item.hasImage ?? false}
                  alt={item.name ?? item.productId}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                  selected
                    ? "border-primary bg-primary text-white"
                    : "border-stone-300 dark:border-stone-500 bg-white dark:bg-stone-800"
                }`}
                aria-hidden
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleSelection(item.productId)}
                  className="sr-only"
                  aria-label={`Include ${item.name ?? item.productId} in order`}
                />
                {selected && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{item.name ?? item.productId}</p>
                <p className="text-sm text-muted">
                  Qty: {item.quantity}
                  {item.price != null && ` × $${item.price.toFixed(2)}`}
                </p>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  className="w-8 h-8 rounded border border-stone-300 dark:border-stone-600 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-50"
                  disabled={updatingProductId === item.productId || item.quantity <= 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(item.productId, item.quantity - 1);
                  }}
                >
                  −
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  className="w-8 h-8 rounded border border-stone-300 dark:border-stone-600 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-50"
                  disabled={updatingProductId === item.productId}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(item.productId, item.quantity + 1);
                  }}
                >
                  +
                </button>
              </div>
              {item.price != null && (
                <p className="font-semibold w-24 text-right">
                  ${(item.quantity * item.price).toFixed(2)}
                </p>
              )}
              <button
                type="button"
                className="text-red-600 dark:text-red-400 text-sm font-medium hover:underline disabled:opacity-50"
                disabled={updatingProductId === item.productId}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item.productId);
                }}
              >
                Remove
              </button>
            </div>
          );})}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 font-medium"
              onClick={handleClearCart}
            >
              Clear cart
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 font-medium"
            >
              Continue shopping
            </Link>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Place order {selectedCount > 0 && `(${selectedCount} selected)`}
            </button>
          </div>
          {selectedCount === 0 && items.length > 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Select at least one item to place an order.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
