"use client";

import type { ProfileTab } from "../viewModel/useProfileViewModel";

interface SidebarNavItem {
  key: ProfileTab;
  label: string;
  icon: string;
}

const navItems: SidebarNavItem[] = [
  { key: "profile", label: "Profile Info", icon: "person" },
  { key: "orders", label: "My Orders", icon: "package_2" },
  { key: "wishlist", label: "Wishlist", icon: "favorite" },
  { key: "addresses", label: "Saved Addresses", icon: "location_on" },
  { key: "subscriptions", label: "Subscriptions", icon: "loyalty" },
];

interface ProfileSidebarProps {
  userName: string;
  membershipTier: string;
  avatarUrl?: string;
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  onLogout: () => void;
}

export function ProfileSidebar({ userName, membershipTier, avatarUrl, activeTab, onTabChange, onLogout }: ProfileSidebarProps) {
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-6 bg-white dark:bg-stone-900/50 p-6 rounded-xl border border-stone-200 dark:border-stone-800 h-fit">
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          {avatarUrl ? (
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12" role="img" aria-label={`${userName} profile photo`} style={{ backgroundImage: `url("${avatarUrl}")` }} />
          ) : (
            <div className="flex items-center justify-center rounded-full size-12 bg-primary text-white font-bold text-sm">{initials}</div>
          )}
          <div className="flex flex-col">
            <h1 className="text-[#181511] dark:text-white text-base font-bold leading-normal">{userName}</h1>
            <p className="text-primary text-xs font-semibold uppercase tracking-wider">{membershipTier} Member</p>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button key={item.key} onClick={() => onTabChange(item.key)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${isActive ? "bg-primary text-white" : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"}`}>
                <span className="material-symbols-outlined">{item.icon}</span>
                <p className="text-sm font-medium leading-normal">{item.label}</p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="border-t border-stone-200 dark:border-stone-800 pt-4 flex flex-col gap-1">
        <button onClick={() => onTabChange("settings")} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${activeTab === "settings" ? "bg-primary text-white" : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"}`}>
          <span className="material-symbols-outlined">settings</span>
          <p className="text-sm font-medium leading-normal">Settings</p>
        </button>
        <button onClick={onLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all cursor-pointer">
          <span className="material-symbols-outlined">logout</span>
          <p className="text-sm font-medium leading-normal">Logout</p>
        </button>
      </div>
    </aside>
  );
}