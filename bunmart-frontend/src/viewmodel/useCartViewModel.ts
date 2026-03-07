import { useState, useEffect, useCallback } from "react";
import type { Cart, CartItem } from "@/model/cart";
import * as cartService from "@/service/cartService";
import { getProducts } from "@/service/productService";

export function useCartViewModel() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    const userId = cartService.getCartUserId();
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart(userId);
      setCart(data);
      const productIds = [...new Set(data.cartItems.map((i) => i.productId))];
      let enriched: CartItem[] = data.cartItems.map((it) => ({
        ...it,
        id: it.id,
        productId: it.productId,
        quantity: it.quantity,
      }));
      if (productIds.length > 0) {
        try {
          const products = await getProducts();
          const byId = new Map(products.map((p) => [p.id, p]));
          enriched = data.cartItems.map((it) => {
            const p = byId.get(it.productId);
            return {
              ...it,
              name: p?.name,
              description: p?.description ?? undefined,
              imageUrl: undefined,
              price: undefined,
              hasImage: p?.hasImage ?? false,
            };
          });
        } catch {
          // keep ids only
        }
      }
      setItems(enriched);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cart");
      setCart(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = useCallback(
    async (productId: string, quantity: number) => {
      const userId = cartService.getCartUserId();
      if (!cart) return;
      setUpdatingProductId(productId);
      setError(null);
      try {
        const updated = await cartService.updateItemQuantity(userId, {
          productId,
          quantity,
        });
        setCart(updated);
        setItems((prev) =>
          prev.map((it) =>
            it.productId === productId ? { ...it, quantity } : it
          )
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update quantity");
      } finally {
        setUpdatingProductId(null);
      }
    },
    [cart]
  );

  const handleRemove = useCallback(
    async (productId: string) => {
      const userId = cartService.getCartUserId();
      if (!cart) return;
      setError(null);
      try {
        const updated = await cartService.removeItem(userId, productId);
        setCart(updated);
        setItems((prev) => prev.filter((it) => it.productId !== productId));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to remove item");
      }
    },
    [cart]
  );

  const handleClearCart = useCallback(async () => {
    const userId = cartService.getCartUserId();
    setError(null);
    try {
      const updated = await cartService.clearCart(userId);
      setCart(updated);
      setItems([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to clear cart");
    }
  }, []);

  const handleApplyPromo = useCallback(async () => {
    const code = promoCode.trim();
    if (!code) return;
    const userId = cartService.getCartUserId();
    setIsApplyingPromo(true);
    setPromoError(null);
    try {
      const result = await cartService.applyPromoCode(userId, { code });
      if (result.success) {
        setPromoError(null);
      } else {
        setPromoError(result.message ?? "Invalid code");
      }
    } catch {
      setPromoError("Could not apply code");
    } finally {
      setIsApplyingPromo(false);
    }
  }, [promoCode]);

  const handleCheckout = useCallback(() => {
    window.alert("Checkout not yet implemented.");
  }, []);

  return {
    cart,
    items,
    loading,
    error,
    promoCode,
    setPromoCode,
    promoError,
    isApplyingPromo,
    updatingProductId,
    handleQuantityChange,
    handleRemove,
    handleClearCart,
    handleApplyPromo,
    handleCheckout,
    loadCart,
  };
}
