import { Link, NavLink, useNavigate } from "react-router-dom";
import { logout } from "@/service/authService";
import { useState } from "react";

const navItems = [
  { to: "/profile", label: "Dashboard", icon: "dashboard" },
  { to: "/profile/notifications", label: "Notifications", icon: "notifications" },
  { to: "/profile/orders", label: "Orders", icon: "receipt_long" },
  { to: "/profile/addresses", label: "Addresses", icon: "location_on" },
  { to: "/profile/account", label: "Account", icon: "person" },
];

export function ProfileSidebar() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside className="w-56 shrink-0 border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-surface-dark flex flex-col">
      <div className="p-4 border-b border-stone-200 dark:border-stone-800">
        <Link
          to="/profile"
          className="text-lg font-bold text-foreground dark:text-white tracking-tight"
        >
          My account
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5" aria-label="Profile">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/profile"}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary dark:bg-primary/20"
                  : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              }`
            }
          >
            <span className="material-symbols-outlined text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-stone-200 dark:border-stone-800 space-y-0.5">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-primary hover:bg-stone-100 dark:hover:bg-stone-800"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to store
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
        >
          {loggingOut ? (
            <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-lg">logout</span>
          )}
          {loggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </aside>
  );
}
