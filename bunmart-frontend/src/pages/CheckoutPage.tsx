import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCartUserId } from "@/service/cartService";
import { getCart } from "@/service/cartService";
import { getProfile, addAddress } from "@/service/profileService";
import { getPricingProducts, calculatePrice } from "@/service/pricingService";
import { getProducts } from "@/service/productService";
import { createOrder } from "@/service/orderService";
import { sendInAppNotification } from "@/service/notificationService";
import { getStoredUserId } from "@/service/api";
import { useIsLoggedIn } from "@/hooks/useIsLoggedIn";
import { AddressFormModal } from "@/components/profile";
import { getApiErrorMessage } from "@/utils/apiError";
import type { CartItem } from "@/model/cart";
import type { Address, AddressRequest } from "@/model/profile";
import type { OrderProductItem } from "@/model/order";
import type { CalculatePriceResponse } from "@/model/pricing";

function formatAddress(addr: Address): string {
  const parts = [
    addr.street,
    addr.city,
    addr.state,
    addr.postalCode,
    addr.country,
  ].filter(Boolean);
  return parts.join(", ");
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [priceSummary, setPriceSummary] = useState<CalculatePriceResponse | null>(null);
  const [priceSummaryLoading, setPriceSummaryLoading] = useState(false);
  const [unavailableProductIds, setUnavailableProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [customAddress, setCustomAddress] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const userId = getCartUserId();
  const isGuest = userId === "guest" || !userId;

  useEffect(() => {
    if (!isLoggedIn || isGuest) {
      navigate("/auth/signin", { replace: true });
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getCart(userId),
      getProfile(),
      getPricingProducts(),
      getProducts(),
    ])
      .then(([cart, profile, , products]) => {
        if (cancelled) return;
        const byId = new Map(products.map((p) => [p.id, p]));
        setUnavailableProductIds(new Set(products.filter((p) => p.availability === false).map((p) => p.id)));
        const cartItems: CartItem[] = cart.cartItems.map((it) => {
          const p = byId.get(it.productId);
          return {
            id: it.id,
            productId: it.productId,
            quantity: it.quantity,
            name: p?.name,
            description: p?.description ?? undefined,
            imageUrl: undefined,
            price: undefined,
          };
        });
        setItems(cartItems);
        const fromCart = (location.state as { selectedProductIds?: string[] } | null)?.selectedProductIds;
        const initialSelected =
          fromCart && fromCart.length > 0
            ? new Set(cartItems.filter((it) => fromCart.includes(it.productId)).map((it) => it.productId))
            : new Set(cartItems.map((it) => it.productId));
        setSelectedProductIds(initialSelected);
        setAddresses(profile.addresses || []);
        setPriceSummary(null);
        if ((profile.addresses?.length ?? 0) > 0) {
          setSelectedAddressId(String(profile.addresses![0].id));
        }
      })
      .catch((e) => {
        if (!cancelled) setError(getApiErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, isGuest, userId, navigate, location.state]);

  const handleAddAddressSubmit = async (payload: AddressRequest) => {
    setSavingAddress(true);
    try {
      const newAddr = await addAddress(payload);
      setAddresses((prev) => [...prev, newAddr]);
      setSelectedAddressId(String(newAddr.id));
    } finally {
      setSavingAddress(false);
    }
  };

  const selectedItems = items.filter((it) => selectedProductIds.has(it.productId));
  const hasUnavailableInSelection = selectedItems.some((it) => unavailableProductIds.has(it.productId));

  const selectionKey = useMemo(
    () =>
      selectedItems
        .map((i) => `${i.productId}:${i.quantity}`)
        .sort()
        .join(",") + "|" + (couponCode || ""),
    [items, selectedProductIds, couponCode]
  );

  useEffect(() => {
    if (selectedItems.length === 0) {
      setPriceSummary(null);
      return;
    }
    let cancelled = false;
    setPriceSummaryLoading(true);
    calculatePrice({
      items: selectedItems.map((it) => ({ productId: it.productId, quantity: it.quantity })),
      ...(couponCode.trim() ? { couponCode: couponCode.trim() } : {}),
    })
      .then((res) => {
        if (!cancelled) setPriceSummary(res);
      })
      .catch(() => {
        if (!cancelled) setPriceSummary(null);
      })
      .finally(() => {
        if (!cancelled) setPriceSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectionKey]);

  const subtotal = priceSummary?.subtotal ?? 0;
  const discountTotal = priceSummary?.discountTotal ?? 0;
  const shippingTotal = priceSummary?.shippingTotal ?? 0;
  const taxTotal = priceSummary?.taxTotal ?? 0;
  const total = priceSummary?.total ?? 0;
  const currencyCode = priceSummary?.currencyCode ?? "USD";

  const getItemTotal = (productId: string): number => {
    return priceSummary?.lineItems.find((l) => l.productId === productId)?.lineTotal ?? 0;
  };

  const toggleItemSelection = (productId: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const selectAll = () => setSelectedProductIds(new Set(items.map((it) => it.productId)));
  const selectNone = () => setSelectedProductIds(new Set());

  const getShippingAddress = (): string => {
    if (selectedAddressId === "custom") return customAddress.trim();
    const addr = addresses.find((a) => String(a.id) === selectedAddressId);
    return addr ? formatAddress(addr) : customAddress.trim();
  };

  const handlePlaceOrder = async () => {
    const shippingAddress = getShippingAddress();
    if (!shippingAddress) {
      setError("Please enter or select a shipping address.");
      return;
    }
    if (selectedItems.length === 0) {
      setError("Select at least one item to include in this order.");
      return;
    }
    if (hasUnavailableInSelection) {
      setError("Some selected items are no longer available. Remove them from your selection to place the order.");
      return;
    }
    setError(null);
    setPlacing(true);
    try {
      const products: OrderProductItem[] = selectedItems.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      }));
      const order = await createOrder({
        userId,
        shippingAddress,
        products,
        subtotal: subtotal.toFixed(2),
        discountTotal: discountTotal.toFixed(2),
        shippingTotal: shippingTotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        total: total.toFixed(2),
        currencyCode: currencyCode || "USD",
      });
      if (userId) {
        sendInAppNotification({
          userId,
          subject: "Order placed",
          body: "Your order has been placed successfully. You can pay from My account → Orders.",
          referenceType: "ORDER",
          referenceId: order.id,
        }).catch(() => {});
      }
      navigate("/profile/orders?order=" + order.id + "&placed=1", { replace: true });
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setPlacing(false);
    }
  };

  if (!isLoggedIn || isGuest) return null;

  if (loading) {
    return (
      <main className="flex-1 px-4 md:px-10 lg:px-40 py-8">
        <div className="flex flex-col items-center justify-center py-24">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="mt-4 text-muted">Loading checkout…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 md:px-10 lg:px-40 py-8">
      <nav className="text-sm text-muted mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/cart" className="hover:text-primary">Cart</Link>
        <span className="mx-2">/</span>
        <span>Checkout</span>
      </nav>

      <h1 className="text-2xl font-bold text-foreground dark:text-white mb-6">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="py-12 text-center text-muted">
          <p className="mb-4">Your cart is empty.</p>
          <Link to="/cart" className="text-primary font-semibold hover:underline">Back to cart</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold text-foreground dark:text-white mb-4">Shipping address</h2>
            {addresses.length > 0 && (
              <div className="space-y-2 mb-4">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 ${
                      selectedAddressId === String(addr.id)
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-stone-200 dark:border-stone-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === String(addr.id)}
                      onChange={() => setSelectedAddressId(String(addr.id))}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="font-semibold text-foreground dark:text-white capitalize">{addr.type}</p>
                      <p className="text-foreground dark:text-white">{addr.street}</p>
                      <p className="text-muted">
                        {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(", ")}
                        {addr.country ? `, ${addr.country}` : ""}
                      </p>
                    </div>
                  </label>
                ))}
                <label className="flex items-start gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50">
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === "custom"}
                    onChange={() => setSelectedAddressId("custom")}
                    className="mt-1"
                  />
                  <span className="text-sm text-foreground dark:text-white">Use a different address (one-time)</span>
                </label>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => setShowAddAddressModal(true)}
                className="text-sm py-2 px-3 rounded-lg border border-primary text-primary dark:border-primary dark:text-primary font-medium hover:bg-primary/10"
              >
                + Add new address (save to profile)
              </button>
            </div>
            {selectedAddressId === "custom" && (
              <textarea
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="Street, city, state, postal code, country"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white placeholder:text-muted"
              />
            )}
            {addresses.length === 0 && (
              <textarea
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="Enter full shipping address"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white placeholder:text-muted"
              />
            )}
          </section>

          <section className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark p-6">
            <h2 className="text-lg font-semibold text-foreground dark:text-white mb-2">Order summary</h2>
            <p className="text-sm text-muted mb-4">Select the items you want to include in this order.</p>
            <div className="flex flex-wrap gap-2 mb-4">
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
            <ul className="space-y-2 mb-4">
              {items.map((it) => {
                const selected = selectedProductIds.has(it.productId);
                return (
                  <li
                    key={it.productId}
                    className={`flex items-center justify-between gap-3 text-sm p-2 rounded-lg border ${
                      selected ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-stone-200 dark:border-stone-700"
                    }`}
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleItemSelection(it.productId)}
                        className="rounded border-stone-300 dark:border-stone-600"
                      />
                      <span className="text-foreground dark:text-white truncate">
                        {it.name ?? it.productId} × {it.quantity}
                        {unavailableProductIds.has(it.productId) && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            Unavailable
                          </span>
                        )}
                      </span>
                    </label>
                    <span className="font-medium flex-shrink-0">
                      ${currencyCode === "USD" ? "$" : ""}{getItemTotal(it.productId).toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-stone-200 dark:border-stone-700 pt-4 space-y-1">
              <div className="flex flex-wrap gap-2 mb-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 min-w-[120px] px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-foreground dark:text-white text-sm placeholder:text-muted"
                  aria-label="Coupon code"
                />
              </div>
              {priceSummaryLoading ? (
                <p className="text-sm text-muted">Calculating prices…</p>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal ({selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""})</span>
                    <span>{currencyCode === "USD" ? "$" : ""}{subtotal.toFixed(2)}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>−{currencyCode === "USD" ? "$" : ""}{discountTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Shipping</span>
                    <span>{currencyCode === "USD" ? "$" : ""}{shippingTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Tax</span>
                    <span>{currencyCode === "USD" ? "$" : ""}{taxTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg mt-2">
                    <span>Total</span>
                    <span>{currencyCode === "USD" ? "$" : ""}{total.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            {selectedItems.length === 0 && (
              <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                Select at least one item to place an order.
              </p>
            )}
            {hasUnavailableInSelection && selectedItems.length > 0 && (
              <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                Some selected items are no longer available. Deselect them to place your order.
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <Link
                to="/cart"
                className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-stone-600 font-medium text-center hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                Back to cart
              </Link>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placing || selectedItems.length === 0 || hasUnavailableInSelection}
                className="flex-1 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? "Placing order…" : "Place order"}
              </button>
            </div>
          </section>
        </div>
      )}

      {showAddAddressModal && (
        <AddressFormModal
          address={null}
          onClose={() => setShowAddAddressModal(false)}
          onSubmit={handleAddAddressSubmit}
          saving={savingAddress}
        />
      )}
    </main>
  );
}
