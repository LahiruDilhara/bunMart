"use client";

import type { SavedAddress } from "@/models/profile";

interface SavedAddressesCardProps {
  addresses: SavedAddress[];
  onManage: () => void;
  onAddAddress: () => void;
}

function formatStreet(addr: SavedAddress): string {
  return [addr.line1, addr.line2].filter(Boolean).join(", ");
}

function formatLocation(addr: SavedAddress): string {
  const parts = [addr.city, addr.state, addr.country].filter(Boolean).join(", ");
  return `${parts} • ${addr.postalCode}`;
}

export function SavedAddressesCard({ addresses, onManage, onAddAddress }: SavedAddressesCardProps) {
  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-stone-900/50 p-6 rounded-xl border border-stone-200 dark:border-stone-800">
      <div className="flex justify-between items-center">
        <h2 className="text-[#181511] dark:text-white text-lg font-bold">Saved Addresses</h2>
        <button onClick={onManage} className="text-primary text-sm font-bold cursor-pointer hover:underline">Manage</button>
      </div>
      <div className="flex flex-col gap-3">
        {addresses.map((addr) => (
          <div key={addr.id} className={addr.isPrimary ? "p-4 rounded-lg border-2 border-primary/30 bg-primary/5 relative" : "p-4 rounded-lg border border-stone-200 dark:border-stone-700"}>
            {addr.isPrimary && (
              <span className="absolute top-3 right-3 text-primary">
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </span>
            )}
            <p className={`text-xs font-bold uppercase mb-1 ${addr.isPrimary ? "text-primary" : "text-stone-500"}`}>{addr.type}</p>
            <p className="text-sm font-medium dark:text-white">{formatStreet(addr)}</p>
            <p className="text-sm text-stone-500">{formatLocation(addr)}</p>
          </div>
        ))}
        <button onClick={onAddAddress} className="flex items-center justify-center gap-2 p-3 border border-dashed border-stone-300 dark:border-stone-700 rounded-lg text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer">
          <span className="material-symbols-outlined">add_location</span>
          <span className="text-sm font-bold">Add New Address</span>
        </button>
      </div>
    </div>
  );
}