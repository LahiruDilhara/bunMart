"use client";

import type { CartItem } from "@/models/cart";
import { CartItemCard } from "./CartItemCard";

type CartListProps = {
  items: CartItem[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
};

export function CartList({
  items,
  onQuantityChange,
  onRemove,
}: CartListProps) {
  return (
    <div className="flex-1 space-y-4">
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted border-b border-primary/10">
        <div className="col-span-6">Product</div>
        <div className="col-span-2 text-center">Price</div>
        <div className="col-span-2 text-center">Quantity</div>
        <div className="col-span-2 text-right">Total</div>
      </div>
      {items.map((item) => (
        <CartItemCard
          key={item.id}
          item={item}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
