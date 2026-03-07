import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getProducts, getCategories } from "@/service/productService";
import { getPricingProducts } from "@/service/pricingService";
import type { Product } from "@/model/product";
import type { Category } from "@/model/product";
import type { PricingProduct } from "@/model/pricing";
import { ProductCard } from "@/components/product";

function matchSearch(product: Product, q: string): boolean {
  if (!q.trim()) return true;
  const lower = q.trim().toLowerCase();
  const name = (product.name ?? "").toLowerCase();
  const desc = (product.description ?? "").toLowerCase();
  const tags = (product.tags ?? []).join(" ").toLowerCase();
  return name.includes(lower) || desc.includes(lower) || tags.includes(lower);
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pricing, setPricing] = useState<PricingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(q);

  const categoryIdFilter =
    categoryParam === ""
      ? null
      : (() => {
          const n = Number(categoryParam);
          return Number.isNaN(n) ? null : n;
        })();

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getProducts({ availableOnly: false }),
      getCategories(),
      getPricingProducts(),
    ])
      .then(([prods, cats, prices]) => {
        if (cancelled) return;
        setProducts(prods);
        setCategories(cats);
        setPricing(prices);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pricingByProductId = useMemo(() => {
    const map = new Map<string, PricingProduct>();
    pricing.forEach((p) => map.set(p.id, p));
    return map;
  }, [pricing]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!matchSearch(p, q)) return false;
      if (categoryIdFilter != null && p.categoryId !== categoryIdFilter) return false;
      if (!pricingByProductId.has(p.id)) return false;
      return true;
    });
  }, [products, q, categoryIdFilter, pricingByProductId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set("q", searchInput.trim());
    } else {
      next.delete("q");
    }
    setSearchParams(next, { replace: true });
  };

  const setCategory = (id: number | null) => {
    const next = new URLSearchParams(searchParams);
    if (id != null) {
      next.set("category", String(id));
    } else {
      next.delete("category");
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="flex flex-col min-h-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 to-white dark:from-stone-900 dark:to-surface-dark border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-6 md:px-10 lg:px-24 py-14 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground dark:text-white tracking-tight">
            Fresh from the oven
          </h1>
          <p className="mt-5 text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
            Artisanal bread and pastries, baked daily. Order online or visit a BunMart bakery near you.
          </p>
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-lg mx-auto">
            <div className="flex rounded-2xl overflow-hidden border-2 border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <span className="flex items-center pl-5 text-stone-400">
                <span className="material-symbols-outlined text-2xl">search</span>
              </span>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products…"
                className="flex-1 min-w-0 py-4 px-4 bg-transparent text-foreground dark:text-white placeholder:text-stone-400 focus:outline-none text-base"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
          <div className="mt-8">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              View cart
            </Link>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-6 md:px-10 lg:px-24 py-8 md:py-10 w-full flex-1">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Filtering section */}
        <div className="mb-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
                Filter by category
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCategory(null)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    categoryIdFilter === null
                      ? "bg-primary text-white shadow-md"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      categoryIdFilter === cat.id
                        ? "bg-primary text-white shadow-md"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            {!loading && (
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-28">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">progress_activity</span>
            <p className="mt-5 text-muted text-lg">Loading products…</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/30">
            <span className="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-600">inventory_2</span>
            <p className="mt-4 text-lg font-medium text-stone-600 dark:text-stone-400">No products match your search.</p>
            <p className="mt-1 text-sm text-stone-500">Try a different search term or category.</p>
            <button
              type="button"
              onClick={() => {
                setSearchParams({}, { replace: true });
                setSearchInput("");
                setCategory(null);
              }}
              className="mt-6 px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                pricing={pricingByProductId.get(product.id) ?? null}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
