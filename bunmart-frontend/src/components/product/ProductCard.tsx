import { useState } from "react";
import { Link } from "react-router-dom";
import { ProductImage } from "@/components/product/ProductImage";
import type { Product } from "@/model/product";
import type { PricingProduct } from "@/model/pricing";
import { addCartItem, getCartUserId } from "@/service/cartService";

interface ProductCardProps {
  product: Product;
  pricing: PricingProduct | null;
}

function formatPrice(p: PricingProduct): string {
  const total = Number(p.rawPrice) + Number(p.tax) + Number(p.shippingCost);
  const code = p.currencyCode || "USD";
  return code === "USD" ? `$${total.toFixed(2)}` : `${total.toFixed(2)} ${code}`;
}

export function ProductCard({ product, pricing }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    setError(null);
    setAdding(true);
    try {
      const userId = getCartUserId();
      await addCartItem(userId, { productId: product.id, quantity: 1 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const unavailable = product.availability === false;

  return (
    <article className={`flex flex-col w-full min-w-0 max-w-full rounded-2xl border bg-white dark:bg-surface-dark overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md ${
      unavailable
        ? "border-stone-200 dark:border-stone-800 opacity-90"
        : "border-stone-200 dark:border-stone-800 hover:border-primary/40 hover:shadow-lg"
    }`}>
      <div className="p-4 pb-0 flex-shrink-0 relative">
        {unavailable ? (
          <div className="block rounded-xl overflow-hidden cursor-not-allowed bg-stone-100 dark:bg-stone-800">
            <ProductImage
              productId={product.id}
              hasImage={product.hasImage}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
            <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-700/90 text-white shadow">
              Unavailable
            </span>
          </div>
        ) : (
          <Link to={`/?product=${product.id}`} className="block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset rounded-xl overflow-hidden">
            <ProductImage
              productId={product.id}
              hasImage={product.hasImage}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          </Link>
        )}
      </div>
      <div className="p-5 pt-4 flex flex-col flex-1 min-w-0">
        {unavailable ? (
          <h3 className="text-lg font-semibold text-foreground dark:text-white line-clamp-2 cursor-default">
            {product.name}
          </h3>
        ) : (
          <Link to={`/?product=${product.id}`} className="focus:outline-none focus:ring-2 focus:ring-primary rounded">
            <h3 className="text-lg font-semibold text-foreground dark:text-white line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
        )}
        {product.description && (
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 line-clamp-2 flex-1 min-h-0">
            {product.description}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {pricing && pricing.isActive !== false ? (
            <span className="text-lg font-bold text-primary whitespace-nowrap">{formatPrice(pricing)}</span>
          ) : (
            <span className="text-sm text-muted whitespace-nowrap">Price on request</span>
          )}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={unavailable || adding}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-base font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto min-w-[9rem] transition-colors"
          >
            {adding ? (
              <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
            )}
            <span className="whitespace-nowrap">{adding ? "Adding…" : "Add to cart"}</span>
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </article>
  );
}
