"use client";

type QuantityStepperProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
  max?: number;
};

export function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  min = 1,
  max = 99,
}: QuantityStepperProps) {
  const canDecrease = quantity > min;
  const canIncrease = quantity < max;

  return (
    <div className="flex items-center gap-3 bg-background-light dark:bg-background-dark/50 p-1.5 rounded-full border border-primary/20">
      <button
        type="button"
        onClick={onDecrease}
        disabled={!canDecrease}
        aria-label="Decrease quantity"
        className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-surface-darker shadow-sm text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-primary"
      >
        <span className="material-symbols-outlined text-lg">remove</span>
      </button>
      <span className="w-4 text-center font-bold">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={!canIncrease}
        aria-label="Increase quantity"
        className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-surface-darker shadow-sm text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-primary"
      >
        <span className="material-symbols-outlined text-lg">add</span>
      </button>
    </div>
  );
}
