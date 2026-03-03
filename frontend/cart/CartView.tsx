"use client";

import {
  CartBreadcrumbs,
  CartPageHeading,
  CartList,
  BackToBakeryLink,
  OrderSummaryCard,
} from "./components";

import { useCartViewModel } from "./viewmodel/useCartViewModel";

/** Default order summary when cart is empty or not loaded (for UI only). */
const defaultSummary = {
  subtotal: 0,
  delivery: 0,
  tax: 0,
  total: 0,
  message: "Add items to your basket to see your order summary.",
};

export function CartView() {
  const {
    cart,
    loading,
    error,
    promoCode,
    setPromoCode,
    promoError,
    isApplyingPromo,
    handleQuantityChange,
    handleRemove,
    handleApplyPromo,
    handleCheckout,
  } = useCartViewModel();

  if (loading) {
    return (
      <div className="flex flex-col px-4 md:px-10 lg:px-40 py-8">
        <CartBreadcrumbs />
        <div className="flex items-center justify-center py-24">
          <p className="text-muted">Loading your basket…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col px-4 md:px-10 lg:px-40 py-8">
        <CartBreadcrumbs />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-red-500">{error}</p>
          <p className="text-muted text-sm">
            Cart service may be unavailable. You can try again later.
          </p>
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const summary = cart?.summary ?? defaultSummary;
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <main className="flex-1 flex flex-col px-4 md:px-10 lg:px-40 py-8 bg-white dark:bg-background-dark text-foreground dark:text-white">
      <CartBreadcrumbs />
      <CartPageHeading itemCount={itemCount} />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <CartList
            items={items}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
          />
          <BackToBakeryLink />
        </div>
        <OrderSummaryCard
          summary={summary}
          promoCode={promoCode}
          onPromoCodeChange={setPromoCode}
          onApplyPromo={handleApplyPromo}
          onCheckout={handleCheckout}
          isApplyingPromo={isApplyingPromo}
          promoError={promoError}
        />
      </div>
    </main>
  );
}
