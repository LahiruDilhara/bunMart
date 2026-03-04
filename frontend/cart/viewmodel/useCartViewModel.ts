"use client";

import { useState, useEffect, useCallback } from "react";
import type { Cart } from "@/models/cart";
import * as cartService from "@/service/cartService";

export function useCartViewModel() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cart");
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = useCallback(
    async (itemId: string, quantity: number) => {
      if (!cart) return;
      setUpdatingItemId(itemId);
      setError(null);
      try {
        const updated = await cartService.updateItemQuantity({ itemId, quantity });
        setCart(updated);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update quantity");
      } finally {
        setUpdatingItemId(null);
      }
    },
    [cart]
  );

  const handleRemove = useCallback(
    async (itemId: string) => {
      if (!cart) return;
      setError(null);
      try {
        const updated = await cartService.removeItem(itemId);
        setCart(updated);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to remove item");
      }
    },
    [cart]
  );

  const handleApplyPromo = useCallback(async () => {
    const code = promoCode.trim();
    if (!code) return;
    setIsApplyingPromo(true);
    setPromoError(null);
    try {
      const result = await cartService.applyPromoCode({ code });
      if (result.success && result.summary && cart) {
        setCart({ ...cart, summary: result.summary, promoCode: code });
      } else {
        setPromoError(result.message ?? "Invalid code");
      }
    } catch (e) {
      setPromoError("Could not apply code");
    } finally {
      setIsApplyingPromo(false);
    }
  }, [promoCode, cart]);

  const handleCheckout = useCallback(() => {
    // Placeholder: navigate to checkout or open auth when ready
    if (typeof window !== "undefined") {
      window.alert("Checkout not yet implemented. Auth will be added by the team.");
    }
  }, []);

  return {
    cart,
    loading,
    error,
    promoCode,
    setPromoCode,
    promoError,
    isApplyingPromo,
    updatingItemId,
    handleQuantityChange,
    handleRemove,
    handleApplyPromo,
    handleCheckout,
    loadCart,
  };
}
