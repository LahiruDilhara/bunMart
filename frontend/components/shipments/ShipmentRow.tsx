"use client";

import { Eye, RefreshCw, UserCheck, Trash2 } from "lucide-react";
import { Tr, Td } from "@/components/ui/Table";
import { ShipmentStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateShort } from "@/lib/utils";
import type { Shipment } from "@/types";

interface ShipmentRowProps {
  shipment: Shipment;
  onView: (shipment: Shipment) => void;
  onUpdateStatus: (shipment: Shipment) => void;
  onAssign: (shipment: Shipment) => void;
  onDelete: (shipment: Shipment) => void;
}

export function ShipmentRow({
  shipment,
  onView,
  onUpdateStatus,
  onAssign,
  onDelete,
}: ShipmentRowProps) {
  const {
    shipmentId,
    trackingNumber,
    driverId,
    vehicleId,
    shippingIntentId,
    status,
    startedAt,
    deliveredAt,
  } = shipment;

  const isPending = status === "PENDING";
  const isDelivered = status === "DELIVERED";

  return (
    <Tr>
      {/* Shipment ID */}
      <Td>
        <span className="text-xs font-bold font-syne">
          #{shipmentId}
        </span>
      </Td>

      {/* Tracking Number */}
      <Td>
        <span className="mr-1 text-xs text-muted">TRK-</span>
        <span className="font-medium">
          {String(trackingNumber).padStart(4, "0")}
        </span>
      </Td>

      {/* Driver */}
      <Td>
        {driverId ? (
          <span>Driver #{driverId}</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </Td>

      {/* Vehicle */}
      <Td>
        {vehicleId ? (
          <span>Vehicle #{vehicleId}</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </Td>

      {/* Shipping Intent */}
      <Td>
        <span className="text-xs text-muted">
          SI-{shippingIntentId}
        </span>
      </Td>

      {/* Status */}
      <Td>
        <ShipmentStatusBadge status={status} />
      </Td>

      {/* Started At */}
      <Td className="text-xs text-muted">
        {formatDateShort(startedAt)}
      </Td>

      {/* Delivered At */}
      <Td className="text-xs text-muted">
        {formatDateShort(deliveredAt)}
      </Td>

      {/* Actions */}
      <Td>
        <div className="flex items-center gap-2">

          {/* View */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onView(shipment)}
            title="View"
          >
            <Eye size={14} />
          </Button>

          {/* Update Status (only if not delivered) */}
          {!isDelivered && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onUpdateStatus(shipment)}
              title="Update Status"
            >
              <RefreshCw size={14} />
            </Button>
          )}

          {/* Assign (only if pending) */}
          {isPending && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAssign(shipment)}
              title="Assign Driver & Vehicle"
            >
              <UserCheck size={14} />
              <span className="ml-1">Assign</span>
            </Button>
          )}

          {/* Delete (not allowed if delivered) */}
          {!isDelivered && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(shipment)}
              title="Delete"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </Td>
    </Tr>
  );
}


