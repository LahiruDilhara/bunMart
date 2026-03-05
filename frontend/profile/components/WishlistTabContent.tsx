"use client";

import type { WishlistItem } from "@/models/profile";

interface WishlistTabContentProps { items: WishlistItem[]; onRemove: (id: string) => void; onAddToCart: (productId: string) => void; }

export function WishlistTabContent({ items, onRemove, onAddToCart }: WishlistTabContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 lg:px-0">
        <h2 className="text-[#181511] dark:text-white text-2xl font-bold">My Wishlist</h2>
        <p className="text-stone-500 text-sm">{items.length} items saved</p>
      </div>
      {items.length === 0 ? (
        <div className="bg-white dark:bg-stone-900/50 p-12 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-600">favorite_border</span>
          <p className="text-stone-500 mt-3 text-sm">Your wishlist is empty. Browse the bakery to save your favourites!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-sm transition-shadow">
              {item.imageUrl && <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url('${item.imageUrl}')` }} />}
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <p className="text-sm font-bold dark:text-white">{item.name}</p>
                  <p className="text-primary font-bold text-sm mt-1">${item.price.toFixed(2)}</p>
                  {!item.inStock && <p className="text-xs text-red-500 mt-1">Out of stock</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onAddToCart(item.productId)} disabled={!item.inStock} className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Add to Cart</button>
                  <button onClick={() => onRemove(item.id)} className="px-3 py-2 rounded-lg text-xs font-bold text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}