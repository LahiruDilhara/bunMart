"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  FormGroup,
  FormLabel,
  FormInput,
  FormSelect,
  FormActions,
  FormRow,
} from "@/components/ui/Form";
import { ShipmentStatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Shipment, ShipmentDTO, ShippingStatus } from "@/types";

const SHIPPING_STATUSES: { value: ShippingStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

// ─── Create Shipment Modal ─────────────────────────────────────────────────
interface CreateShipmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dto: ShipmentDTO) => Promise<void>;
}

const EMPTY_SHIPMENT: ShipmentDTO = {
  driverId: 0,
  vehicleId: 0,
  shippingIntentId: 0,
  trackingNumber: 0,
  status: "PENDING",
};

export function CreateShipmentModal({ open, onClose, onSave }: CreateShipmentModalProps) {
  const [form, setForm] = useState<ShipmentDTO>(EMPTY_SHIPMENT);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) { setForm(EMPTY_SHIPMENT); setErrors({}); }
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.shippingIntentId) e.shippingIntentId = "Required";
    if (!form.driverId) e.driverId = "Required";
    if (!form.vehicleId) e.vehicleId = "Required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
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
          placeholder="e.g. 41"
          value={form.shippingIntentId || ""}
          onChange={(e) => setForm((f) => ({ ...f, shippingIntentId: Number(e.target.value) }))}
          error={errors.shippingIntentId}
        />
      </FormGroup>

      <FormRow>
        <FormGroup>
          <FormLabel required>Driver ID</FormLabel>
          <FormInput
            type="number"
            placeholder="e.g. 1"
            value={form.driverId || ""}
            onChange={(e) => setForm((f) => ({ ...f, driverId: Number(e.target.value) }))}
            error={errors.driverId}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel required>Vehicle ID</FormLabel>
          <FormInput
            type="number"
            placeholder="e.g. 2"
            value={form.vehicleId || ""}
            onChange={(e) => setForm((f) => ({ ...f, vehicleId: Number(e.target.value) }))}
            error={errors.vehicleId}
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <FormLabel>Tracking Number</FormLabel>
          <FormInput
            type="number"
            placeholder="Auto-generated"
            value={form.trackingNumber || ""}
            onChange={(e) => setForm((f) => ({ ...f, trackingNumber: Number(e.target.value) }))}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Status</FormLabel>
          <FormSelect
            options={SHIPPING_STATUSES}
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          />
        </FormGroup>
      </FormRow>

      <FormActions>
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>Create Shipment</Button>
      </FormActions>
    </Modal>
  );
}

// ─── View Shipment Modal ───────────────────────────────────────────────────
interface ViewShipmentModalProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment | null;
}

export function ViewShipmentModal({ open, onClose, shipment }: ViewShipmentModalProps) {
  if (!shipment) return null;

  const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <div className="text-[10px] tracking-[1.5px] uppercase text-muted mb-1">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Shipment Details" size="md">
      <div className="grid grid-cols-2 gap-5">
        <Detail label="Shipment ID" value={<span className="font-syne font-bold text-base">#{shipment.shipmentId}</span>} />
        <Detail label="Tracking #" value={`TRK-${String(shipment.trackingNumber).padStart(4, "0")}`} />
        <Detail label="Status" value={<ShipmentStatusBadge status={shipment.status} />} />
        <Detail label="Intent ID" value={`SI-${shipment.shippingIntentId}`} />
        <Detail label="Driver ID" value={shipment.driverId ? `#${shipment.driverId}` : "—"} />
        <Detail label="Vehicle ID" value={shipment.vehicleId ? `#${shipment.vehicleId}` : "—"} />
        <Detail label="Started At" value={formatDate(shipment.startedAt)} />
        <Detail label="Delivered At" value={formatDate(shipment.deliveredAt)} />
      </div>

      <FormActions>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </FormActions>
    </Modal>
  );
}

// ─── Update Status Modal ───────────────────────────────────────────────────
interface UpdateStatusModalProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  onUpdate: (id: number, status: ShippingStatus) => Promise<void>;
}

export function UpdateStatusModal({ open, onClose, shipment, onUpdate }: UpdateStatusModalProps) {
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Shipment Status" size="sm">
      <FormGroup>
        <FormLabel>Shipment</FormLabel>
        <div className="bg-surface2 rounded-lg px-4 py-3 text-xs text-muted">
          #{shipment?.shipmentId} · TRK-{String(shipment?.trackingNumber ?? "").padStart(4, "0")}
        </div>
      </FormGroup>

      <FormGroup>
        <FormLabel>New Status</FormLabel>
        <FormSelect
          options={SHIPPING_STATUSES}
          value={status}
          onChange={(e) => setStatus(e.target.value as ShippingStatus)}
        />
      </FormGroup>

      <FormActions>
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>Update Status</Button>
      </FormActions>
    </Modal>
  );
}

// ─── Assign Driver & Vehicle Modal ─────────────────────────────────────────
interface AssignModalProps {
  open: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  onAssign: (shipmentId: number, driverId: number, vehicleId: number) => Promise<void>;
}

export function AssignModal({ open, onClose, shipment, onAssign }: AssignModalProps) {
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) { setDriverId(""); setVehicleId(""); setErrors({}); }
  }, [open]);

  const handleSubmit = async () => {
    const e: Record<string, string> = {};
    if (!driverId) e.driverId = "Required";
    if (!vehicleId) e.vehicleId = "Required";
    if (Object.keys(e).length) { setErrors(e); return; }

    if (!shipment) return;
    setLoading(true);
    try {
      await onAssign(shipment.shipmentId, Number(driverId), Number(vehicleId));
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Driver & Vehicle" size="sm">
      <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 mb-5 text-xs text-amber-300">
        ⚡ Only <strong>active</strong> drivers and vehicles can be assigned. Status will auto-change to <strong>DISPATCHED</strong>.
      </div>

      <FormGroup>
        <FormLabel required>Driver ID</FormLabel>
        <FormInput
          type="number"
          placeholder="Enter active driver ID"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          error={errors.driverId}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel required>Vehicle ID</FormLabel>
        <FormInput
          type="number"
          placeholder="Enter active vehicle ID"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          error={errors.vehicleId}
        />
      </FormGroup>

      <FormActions>
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>Assign & Dispatch</Button>
      </FormActions>
    </Modal>
  );
}
