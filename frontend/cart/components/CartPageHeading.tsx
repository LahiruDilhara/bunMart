"use client";

type CartPageHeadingProps = {
  itemCount: number;
};

export function CartPageHeading({ itemCount }: CartPageHeadingProps) {
  return (
    <div className="flex flex-wrap justify-between gap-3 mb-8">
      <div className="flex min-w-72 flex-col gap-1">
        <h1 className="text-foreground dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
          Your Basket
        </h1>
        <p className="text-muted text-base font-normal">
          {itemCount} {itemCount === 1 ? "item" : "items"} waiting for checkout
        </p>
      </div>
    </div>
  );
}
