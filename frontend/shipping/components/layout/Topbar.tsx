"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useState } from "react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/shipments": "Shipments",
  "/shipping-intents": "Shipping Intents",
  "/drivers": "Drivers",
  "/vehicles": "Vehicles",
  "/tracking": "Track Shipment",
};

export function Topbar() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const title =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ??
    "BunMart Shipping";

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
      <h1 className="font-syne font-bold text-base sm:text-lg tracking-tight pl-10 lg:pl-0">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="bg-surface2 border border-border rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-muted outline-none focus:border-accent transition-colors w-44 lg:w-56"
          />
        </div>
        <button className="relative p-2 rounded-lg border border-border hover:border-accent/50 transition-colors text-muted hover:text-white">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold font-syne">
          A
        </div>
      </div>
    </header>
  );
}
