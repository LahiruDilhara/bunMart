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
      { label: "Dashboard", href: "/shipping/dashboard", icon: LayoutDashboard },
      { label: "Track Shipment", href: "/shipping/tracking", icon: Search },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Shipments", href: "/shipping/shipments", icon: Package },
      { label: "Shipping Intents", href: "/shipping/shipping-intents", icon: ClipboardList },
      { label: "Drivers", href: "/shipping/drivers", icon: UserCircle },
      { label: "Vehicles", href: "/shipping/vehicles", icon: Truck },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-[#dee2e6]">
      {/* Logo */}
      <div className="px-6 border-b py-7 border-[#dee2e6]">
        <div className="text-xl font-black tracking-tight font-syne text-[#212529]">
          Bun<span className="text-[#f5a623]">Mart</span>
        </div>
        <div className="text-[10px] tracking-[3px] text-[#6c757d] uppercase mt-1">
          Shipping Control
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-6">
            <div className="text-[9px] tracking-[2.5px] text-[#6c757d] uppercase px-3 mb-2 font-semibold">
              {section.label}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 mb-0.5 border",
                    isActive
                      ? "bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30"
                      : "text-[#495057] border-transparent hover:bg-[#f8f9fa] hover:text-[#212529]"
                  )}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#dee2e6] bg-[#f8f9fa]">
        <div className="flex items-center gap-2 text-xs text-[#6c757d]">
          <Activity size={12} className="text-[#28a745]" />
          <span className="text-[#28a745] text-[10px] tracking-wide font-bold">
            API CONNECTED
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed z-[100] p-2 text-[#212529] border rounded-lg lg:hidden top-4 left-4 bg-white shadow-md border-[#dee2e6]"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden shadow-sm w-60 lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 lg:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 transition-transform duration-300 lg:hidden bg-white shadow-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}