"use client";

import type { OrderSummary } from "@/models/cart";

type OrderSummaryCardProps = {
  summary: OrderSummary;
  promoCode: string;
  onPromoCodeChange: (value: string) => void;
  onApplyPromo: () => void;
  onCheckout: () => void;
  isApplyingPromo?: boolean;
  promoError?: string | null;
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function OrderSummaryCard({
  summary,
  promoCode,
  onPromoCodeChange,
  onApplyPromo,
  onCheckout,
  isApplyingPromo = false,
  promoError = null,
}: OrderSummaryCardProps) {
  return (
    <div className="w-full lg:w-[400px]">
      <div className="bg-white dark:bg-surface-dark rounded-xl border border-primary/10 shadow-lg p-6 lg:sticky lg:top-24">
        <h2 className="text-xl font-black mb-6 border-b border-primary/10 pb-4">
          Order Summary
        </h2>
        <div className="mb-6">
          <label className="text-sm font-bold text-muted mb-2 block">
            Promo Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
              placeholder="BUNLOVER20"
              className="flex-1 bg-background-light dark:bg-background-dark border border-primary/20 rounded-lg text-sm focus:ring-primary focus:border-primary px-3 py-2 text-foreground dark:text-white"
            />
            <button
              type="button"
              onClick={onApplyPromo}
              disabled={isApplyingPromo}
              className="bg-primary/20 text-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplyingPromo ? "Applying…" : "Apply"}
            </button>
          </div>
          {promoError && (
            <p className="text-red-500 text-xs mt-1">{promoError}</p>
          )}
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-muted">
            <span className="text-base">Subtotal</span>
            <span className="text-base font-medium">
              {formatPrice(summary.subtotal)}
            </span>
          </div>
          <div className="flex justify-between items-center text-muted">
            <span className="text-base">Estimated Delivery</span>
            <span className="text-base font-medium">
              {formatPrice(summary.delivery)}
            </span>
          </div>
          <div className="flex justify-between items-center text-muted">
            <span className="text-base">Tax</span>
            <span className="text-base font-medium">
              {formatPrice(summary.tax)}
            </span>
          </div>
          <div className="pt-3 mt-3 border-t border-primary/10 flex justify-between items-center">
            <span className="text-lg font-black">Total</span>
            <span className="text-2xl font-black text-primary">
              {formatPrice(summary.total)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          className="w-full bg-primary text-white py-4 rounded-xl font-black text-lg shadow-md shadow-primary/30 hover:bg-primary-hover transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 cursor-pointer"
        >
          Proceed to Checkout
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
        <TrustBadges message={summary.message} />
      </div>
    </div>
  );
}

function TrustBadges({ message }: { message?: string }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="flex items-center gap-4">
        <div className="text-muted flex flex-col items-center">
          <span className="material-symbols-outlined text-2xl">lock</span>
          <span className="text-[10px] uppercase font-bold tracking-widest mt-1">
            Secure
          </span>
        </div>
        <div className="text-muted flex flex-col items-center">
          <span className="material-symbols-outlined text-2xl">
            local_shipping
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest mt-1">
            Insured
          </span>
        </div>
        <div className="text-muted flex flex-col items-center">
          <span className="material-symbols-outlined text-2xl">eco</span>
          <span className="text-[10px] uppercase font-bold tracking-widest mt-1">
            Fresh
          </span>
        </div>
      </div>
      {message && (
        <p className="text-[11px] text-muted text-center px-4">{message}</p>
      )}
    </div>
  );
}
