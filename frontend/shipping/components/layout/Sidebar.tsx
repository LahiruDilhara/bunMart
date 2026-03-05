"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  UserCircle,
  Truck,
  Search,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { cn } from "@/shipping/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Track Shipment", href: "/tracking", icon: Search },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Shipments", href: "/shipments", icon: Package },
      { label: "Shipping Intents", href: "/shipping-intents", icon: ClipboardList },
      { label: "Drivers", href: "/drivers", icon: UserCircle },
      { label: "Vehicles", href: "/vehicles", icon: Truck },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 border-b py-7 border-border">
        <div className="text-xl font-black tracking-tight font-syne">
          Bun<span className="text-accent">Mart</span>
        </div>
        <div className="text-[10px] tracking-[3px] text-muted uppercase mt-1">
          Shipping Control
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-6">
            <div className="text-[9px] tracking-[2.5px] text-muted uppercase px-3 mb-2 font-medium">
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 mb-0.5 border",
                    isActive
                      ? "bg-accent/10 text-accent border-accent/25"
                      : "text-muted border-transparent hover:bg-surface2 hover:text-white"
                  )}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Activity size={12} className="text-success" />
          <span className="text-success text-[10px] tracking-wide">
            API Connected
          </span>
        </div>
        <div className="text-[10px] text-muted mt-1 tracking-wide">
          localhost:8080
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed z-50 p-2 text-white border rounded-lg lg:hidden top-4 left-4 bg-surface border-border"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full w-60 bg-surface border-r border-border z-50 transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed flex-col hidden h-full border-r lg:flex w-60 bg-surface border-border">
        <SidebarContent />
      </aside>
    </>
  );
}
