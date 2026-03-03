"use client";

import type { CartItem } from "@/models/cart";
import { QuantityStepper } from "./QuantityStepper";

type CartItemCardProps = {
  item: CartItem;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function CartItemCard({
  item,
  onQuantityChange,
  onRemove,
}: CartItemCardProps) {
  const lineTotal = item.price * item.quantity;
  const description = [item.unit, item.description].filter(Boolean).join(" • ");

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-primary/5 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 md:gap-6">
        <div className="col-span-1 md:col-span-6 flex items-center gap-4">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 md:size-20 shrink-0"
            style={
              item.imageUrl
                ? { backgroundImage: `url("${item.imageUrl}")` }
                : { backgroundColor: "var(--color-muted)" }
            }
            role="img"
            aria-label={item.name}
          />
          <div className="flex flex-col">
            <h3 className="text-foreground dark:text-white text-lg font-bold">
              {item.name}
            </h3>
            {description && (
              <p className="text-muted text-sm">{description}</p>
            )}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">delete</span>{" "}
              Remove
            </button>
          </div>
        </div>
        <div className="hidden md:block col-span-2 text-center font-medium">
          {formatPrice(item.price)}
        </div>
        <div className="col-span-1 md:col-span-2 flex justify-center">
          <QuantityStepper
            quantity={item.quantity}
            onDecrease={() =>
              onQuantityChange(item.id, Math.max(1, item.quantity - 1))
            }
            onIncrease={() => onQuantityChange(item.id, item.quantity + 1)}
          />
        </div>
        <div className="col-span-1 md:col-span-2 text-right text-lg font-black text-primary">
          {formatPrice(lineTotal)}
        </div>
      </div>
    </div>
  );
}
