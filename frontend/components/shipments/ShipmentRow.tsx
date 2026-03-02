import { Eye, RefreshCw, UserCheck, Trash2 } from "lucide-react";
import { Tr, Td } from "@/components/ui/Table";
import { ShipmentStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateShort } from "@/lib/utils";
import type { Shipment } from "@/types";

interface ShipmentRowProps {
  shipment: Shipment;
  onView: (s: Shipment) => void;
  onUpdateStatus: (s: Shipment) => void;
  onAssign: (s: Shipment) => void;
  onDelete: (s: Shipment) => void;
}

export function ShipmentRow({
  shipment,
  onView,
  onUpdateStatus,
  onAssign,
  onDelete,
}: ShipmentRowProps) {
  const isPending = shipment.status === "PENDING";
  const isDelivered = shipment.status === "DELIVERED";

  return (
    <Tr>
      <Td>
        <span className="font-syne font-bold text-xs">#{shipment.shipmentId}</span>
      </Td>
      <Td>
        <span className="text-muted">TRK-</span>
        {String(shipment.trackingNumber).padStart(4, "0")}
      </Td>
      <Td>{shipment.driverId ? `Driver #${shipment.driverId}` : <span className="text-muted">—</span>}</Td>
      <Td>{shipment.vehicleId ? `Vehicle #${shipment.vehicleId}` : <span className="text-muted">—</span>}</Td>
      <Td>
        <span className="text-muted text-xs">SI-{shipment.shippingIntentId}</span>
      </Td>
      <Td>
        <ShipmentStatusBadge status={shipment.status} />
      </Td>
      <Td className="text-muted">{formatDateShort(shipment.startedAt)}</Td>
      <Td className="text-muted">{formatDateShort(shipment.deliveredAt)}</Td>
      <Td>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => onView(shipment)}>
            <Eye size={12} />
          </Button>
          {!isPending && (
            <Button size="sm" variant="ghost" onClick={() => onUpdateStatus(shipment)}>
              <RefreshCw size={12} />
            </Button>
          )}
          {isPending && (
            <Button size="sm" variant="outline" onClick={() => onAssign(shipment)}>
              <UserCheck size={12} />
              <span>Assign</span>
            </Button>
          )}
          {!isDelivered && (
            <Button size="sm" variant="danger" onClick={() => onDelete(shipment)}>
              <Trash2 size={12} />
            </Button>
          )}
        </div>
      </Td>
    </Tr>
  );
}
