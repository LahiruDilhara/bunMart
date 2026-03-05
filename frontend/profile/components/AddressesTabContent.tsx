"use client";

import type { SavedAddress } from "@/models/profile";

interface AddressesTabContentProps { addresses: SavedAddress[]; onAddAddress: () => void; onDeleteAddress: (id: string) => void; }

function formatStreet(a: SavedAddress) { return [a.line1, a.line2].filter(Boolean).join(", "); }
function formatLocation(a: SavedAddress) { return `${[a.city, a.state, a.country].filter(Boolean).join(", ")} • ${a.postalCode}`; }

export function AddressesTabContent({ addresses, onAddAddress, onDeleteAddress }: AddressesTabContentProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 lg:px-0">
        <h2 className="text-[#181511] dark:text-white text-2xl font-bold">Saved Addresses</h2>
        <button onClick={onAddAddress} className="bg-primary text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-primary/90 transition-all cursor-pointer">
          <span className="material-symbols-outlined text-sm">add</span>Add Address
        </button>
      </div>
      {addresses.length === 0 ? (
        <div className="bg-white dark:bg-stone-900/50 p-12 rounded-xl border border-stone-200 dark:border-stone-800 text-center">
          <span className="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-600">location_off</span>
          <p className="text-stone-500 mt-3 text-sm">No saved addresses yet. Add one to speed up checkout!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className={`p-5 rounded-xl relative ${addr.isPrimary ? "border-2 border-primary/30 bg-primary/5" : "border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50"}`}>
              {addr.isPrimary && <span className="absolute top-4 right-4 text-primary"><span className="material-symbols-outlined text-xl">check_circle</span></span>}
              <p className={`text-xs font-bold uppercase mb-2 ${addr.isPrimary ? "text-primary" : "text-stone-500"}`}>{addr.type}</p>
              <p className="text-sm font-medium dark:text-white">{formatStreet(addr)}</p>
              <p className="text-sm text-stone-500">{formatLocation(addr)}</p>
              <div className="flex gap-2 mt-4">
                {!addr.isPrimary && (
                  <button onClick={() => onDeleteAddress(addr.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors cursor-pointer">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}