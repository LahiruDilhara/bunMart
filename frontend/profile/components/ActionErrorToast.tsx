"use client";

interface ActionErrorToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function ActionErrorToast({ message, onDismiss }: ActionErrorToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[200] max-w-md animate-[slideUp_0.3s_ease-out]">
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg flex items-start gap-3">
        <span className="material-symbols-outlined text-red-500 text-xl flex-shrink-0 mt-0.5">error</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{message}</p>
        </div>
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600 cursor-pointer flex-shrink-0">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
}
