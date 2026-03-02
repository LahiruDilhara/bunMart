import { UserCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Driver } from "@/types";

interface Props {
  driver: Driver;
  onEdit: (driver: Driver) => void;
  onDelete: (driver: Driver) => void;
}

export function DriverCard({ driver, onEdit, onDelete }: Props) {
  return (
    <div className="p-4 border rounded-xl">
      <UserCircle size={32} />

      <h3 className="mt-2 font-bold">{driver.name}</h3>
      <p className="text-sm">{driver.phone}</p>
      <p className="mt-1 text-xs">
        {driver.active ? "Active" : "Inactive"}
      </p>

      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={() => onEdit(driver)}>
          <Pencil size={14} />
        </Button>

        <Button size="sm" variant="danger" onClick={() => onDelete(driver)}>
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

export function DriverCardPlaceholder({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-4 text-center border border-dashed rounded-xl"
    >
      + Add New Driver
    </button>
  );
}