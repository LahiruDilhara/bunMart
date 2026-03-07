import { Outlet, Link } from "react-router-dom";

export function DriverLayout() {
  return (
    <div className="min-h-screen flex bg-background-light dark:bg-background-dark">
      <aside className="w-56 shrink-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark flex flex-col">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800">
          <span className="text-lg font-bold text-foreground dark:text-white tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-sky-600">delivery_dining</span>
            Driver
          </span>
        </div>
        <nav className="flex-1 p-3" aria-label="Driver">
          <Link
            to="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Admin
          </Link>
        </nav>
        <div className="p-3 border-t border-stone-200 dark:border-stone-800">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <span className="material-symbols-outlined text-lg">storefront</span>
            Back to store
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
