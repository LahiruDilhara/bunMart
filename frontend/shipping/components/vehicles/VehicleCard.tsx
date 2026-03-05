import { Pencil, Trash2 } from "lucide-react";
import { ActiveBadge } from "@/shipping/components/ui/Badge";
import { Button } from "@/shipping/components/ui/Button";
import { VEHICLE_ICON } from "@/shipping/lib/utils";
import type { Vehicle } from "@/shipping/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (v: Vehicle) => void;
  onDelete: (v: Vehicle) => void;
}

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  const icon = VEHICLE_ICON?.[vehicle.type] ?? "🚗";

  return (
    <div className="p-5 transition-all duration-200 border bg-surface border-border rounded-xl hover:border-info/30 group">
      <div className="flex items-center justify-center mb-4 text-xl transition-colors border rounded-full w-11 h-11 bg-info/10 border-info/20 group-hover:bg-info/15">
        {icon}
      </div>

      <h3 className="mb-1 text-sm font-bold font-syne">
        {vehicle.plate_number}
      </h3>

      <div className="text-[11px] text-muted mb-4 uppercase tracking-wide">
        {vehicle.type} · ID #{vehicle.vehicle_id}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <ActiveBadge active={vehicle.active} />

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(vehicle)}
          >
            <Pencil size={12} />
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(vehicle)}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function VehicleCardPlaceholder({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-surface border border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center min-h-[160px] hover:border-info/40 hover:bg-info/5 transition-all duration-200 w-full cursor-pointer"
    >
      <div className="mb-2 text-3xl opacity-20">+</div>
      <div className="text-xs text-muted">Add New Vehicle</div>
    </button>
  );
}