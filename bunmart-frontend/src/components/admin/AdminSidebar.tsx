import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/admin/users", label: "Users", icon: "group", end: false },
  { to: "/admin/notifications", label: "Notifications", icon: "notifications", end: false },
  { to: "/admin/orders", label: "Orders", icon: "receipt_long", end: false },
  { to: "/admin/shipping", label: "Shipping", icon: "local_shipping", end: false },
  { to: "/admin/drivers", label: "Drivers", icon: "directions_car", end: false },
  { to: "/admin/products", label: "Products", icon: "inventory_2", end: false },
  { to: "/admin/pricing", label: "Pricing", icon: "sell", end: false },
  { to: "/kitchen", label: "Kitchen", icon: "restaurant", end: true },
  { to: "/driver", label: "Driver", icon: "delivery_dining", end: true },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 shrink-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark flex flex-col">
      <div className="p-4 border-b border-stone-200 dark:border-stone-800">
        <Link
          to="/admin"
          className="text-lg font-bold text-foreground dark:text-white tracking-tight"
        >
          BunMart
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5" aria-label="Management">
        {navItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to + "/") || location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary dark:bg-primary/20"
                  : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-stone-200 dark:border-stone-800">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to store
        </Link>
      </div>
    </aside>
  );
}
