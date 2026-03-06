/* eslint-disable react-hooks/static-components */
"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/shipping/components/ui/Modal";
import { Button } from "@/shipping/components/ui/Button";
import {
  FormGroup,
  FormLabel,
  FormInput,
  FormSelect,
  FormActions,
  FormRow,
} from "@/shipping/components/ui/Form";
import { ShipmentStatusBadge } from "@/shipping/components/ui/Badge";
import { formatDate } from "@/shipping/lib/utils";
import type { Shipment, ShipmentDTO, ShippingStatus } from "@/shipping/types";



const SHIPPING_STATUSES: { value: ShippingStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];



interface CreateShipmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dto: ShipmentDTO) => Promise<void>;
}

const EMPTY_FORM: ShipmentDTO = {
  driverId: 0,
  vehicleId: 0,
  shippingIntentId: 0,
  trackingNumber: 0,
  status: "PENDING",
};

export function CreateShipmentModal({
  open,
  onClose,
  onSave,
}: CreateShipmentModalProps) {
  const [form, setForm] = useState<ShipmentDTO>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.shippingIntentId) e.shippingIntentId = "Required";
    if (!form.driverId) e.driverId = "Required";
    if (!form.vehicleId) e.vehicleId = "Required";
    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error("Create shipment failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Shipment" size="md">
      <FormGroup>
        <FormLabel required>Shipping Intent ID</FormLabel>
        <FormInput
          type="number"
          value={form.shippingIntentId || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, shippingIntentId: Number(e.target.value) }))
          }
          error={errors.shippingIntentId}
        />
      </FormGroup>

      <FormRow>
        <FormGroup>
          <FormLabel required>Driver ID</FormLabel>
          <FormInput
            type="number"
            value={form.driverId || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, driverId: Number(e.target.value) }))
            }
            error={errors.driverId}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel required>Vehicle ID</FormLabel>
          <FormInput
            type="number"
            value={form.vehicleId || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, vehicleId: Number(e.target.value) }))
            }
            error={errors.vehicleId}
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <FormLabel>Tracking Number</FormLabel>
          <FormInput
            type="number"
            value={form.trackingNumber || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, trackingNumber: Number(e.target.value) }))
            }
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Status</FormLabel>
          <FormSelect
            options={SHIPPING_STATUSES}
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value }))
            }
          />
        </FormGroup>
      </FormRow>

      <FormActions>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          Create Shipment
        </Button>
      </FormActions>
    </Modal>
  );
}

/* =========================================================
   VIEW SHIPMENT MODAL
========================================================= */

interface ViewShipmentModalProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment | null;
}

export function ViewShipmentModal({
  open,
  onClose,
  shipment,
}: ViewShipmentModalProps) {
  if (!shipment) return null;

  const Detail = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => (
    <div>
      <div className="mb-1 text-xs uppercase text-muted">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Shipment Details" size="md">
      <div className="grid grid-cols-2 gap-4">
        <Detail label="Shipment ID" value={`#${shipment.shipmentId}`} />
        <Detail
          label="Tracking #"
          value={`TRK-${String(shipment.trackingNumber).padStart(4, "0")}`}
        />
        <Detail
          label="Status"
          value={<ShipmentStatusBadge status={shipment.status} />}
        />
        <Detail label="Intent ID" value={`SI-${shipment.shippingIntentId}`} />
        <Detail label="Driver ID" value={shipment.driverId || "—"} />
        <Detail label="Vehicle ID" value={shipment.vehicleId || "—"} />
        <Detail label="Started At" value={formatDate(shipment.startedAt)} />
        <Detail label="Delivered At" value={formatDate(shipment.deliveredAt)} />
      </div>

      <FormActions>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </FormActions>
    </Modal>
  );
}

/* =========================================================
   UPDATE STATUS MODAL
========================================================= */

interface UpdateStatusModalProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  onUpdate: (id: number, status: ShippingStatus) => Promise<void>;
}

export function UpdateStatusModal({
  open,
  onClose,
  shipment,
  onUpdate,
}: UpdateStatusModalProps) {
  const [status, setStatus] = useState<ShippingStatus>("PENDING");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shipment) setStatus(shipment.status);
  }, [shipment]);

  const handleSubmit = async () => {
    if (!shipment) return;

    setLoading(true);
    try {
      await onUpdate(shipment.shipmentId, status);
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Status" size="sm">
      <FormGroup>
        <FormLabel>Shipment</FormLabel>
        <div className="px-4 py-3 text-xs rounded-lg bg-surface2 text-muted">
          #{shipment?.shipmentId}
        </div>
      </FormGroup>

      <FormGroup>
        <FormLabel>New Status</FormLabel>
        <FormSelect
          options={SHIPPING_STATUSES}
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as ShippingStatus)
          }
        />
      </FormGroup>

      <FormActions>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          Update
        </Button>
      </FormActions>
    </Modal>
  );
}

/* =========================================================
   ASSIGN DRIVER & VEHICLE MODAL
========================================================= */

interface AssignModalProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  onAssign: (
    shipmentId: number,
    driverId: number,
    vehicleId: number
  ) => Promise<void>;
}

export function AssignModal({
  open,
  onClose,
  shipment,
  onAssign,
}: AssignModalProps) {
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setDriverId("");
      setVehicleId("");
      setErrors({});
    }
  }, [open]);

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!driverId) e.driverId = "Required";
    if (!vehicleId) e.vehicleId = "Required";

    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    if (!shipment) return;

    setLoading(true);
    try {
      await onAssign(
        shipment.shipmentId,
        Number(driverId),
        Number(vehicleId)
      );
      onClose();
    } catch (error) {
      console.error("Assign failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Driver & Vehicle" size="sm">
      <FormGroup>
        <FormLabel required>Driver ID</FormLabel>
        <FormInput
          type="number"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          error={errors.driverId}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel required>Vehicle ID</FormLabel>
        <FormInput
          type="number"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          error={errors.vehicleId}
        />
      </FormGroup>

      <FormActions>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          Assign
        </Button>
      </FormActions>
    </Modal>
  );
}