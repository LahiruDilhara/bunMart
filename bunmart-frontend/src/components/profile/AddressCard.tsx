import type { Address } from "@/model/profile";

interface AddressCardProps {
  address: Address;
  /** When set, show Edit and Delete buttons (e.g. on profile addresses page). */
  onEdit?: (address: Address) => void;
  onDelete?: (address: Address) => void;
}

export function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  return (
    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-foreground dark:text-white capitalize">{address.type}</p>
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(address)}
                className="text-sm text-primary hover:underline"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(address)}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      <dl className="grid grid-cols-1 gap-1 text-sm">
        {address.street && (
          <div>
            <dt className="text-stone-500 dark:text-stone-400 inline">Street</dt>
            <dd className="text-foreground dark:text-white font-medium">{address.street}</dd>
          </div>
        )}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {address.city && (
            <div>
              <dt className="text-stone-500 dark:text-stone-400 inline">City</dt>
              <dd className="text-foreground dark:text-white font-medium">{address.city}</dd>
            </div>
          )}
          {address.state && (
            <div>
              <dt className="text-stone-500 dark:text-stone-400 inline">State / Province</dt>
              <dd className="text-foreground dark:text-white font-medium">{address.state}</dd>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {address.postalCode && (
            <div>
              <dt className="text-stone-500 dark:text-stone-400 inline">Postal code</dt>
              <dd className="text-foreground dark:text-white font-medium">{address.postalCode}</dd>
            </div>
          )}
          {address.country && (
            <div>
              <dt className="text-stone-500 dark:text-stone-400 inline">Country</dt>
              <dd className="text-foreground dark:text-white font-medium">{address.country}</dd>
            </div>
          )}
        </div>
      </dl>
    </div>
  );
}
