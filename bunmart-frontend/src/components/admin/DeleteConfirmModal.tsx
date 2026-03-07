interface DeleteConfirmModalProps {
  productName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  saving: boolean;
}

export function DeleteConfirmModal({
  productName,
  onClose,
  onConfirm,
  saving,
}: DeleteConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div
        className="bg-white dark:bg-surface-dark rounded-xl shadow-xl max-w-sm w-full p-6 border border-stone-200 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-title" className="text-lg font-bold text-foreground dark:text-white mb-2">
          Delete product
        </h2>
        <p className="text-stone-600 dark:text-stone-400 text-sm mb-6">
          Are you sure you want to delete <strong>{productName}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-50 dark:hover:bg-stone-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
