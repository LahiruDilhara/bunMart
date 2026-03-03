"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormGroup, FormLabel, FormInput, FormSelect, FormActions, FormRow } from "@/components/ui/Form";
import type { ShippingIntent, ShippingIntentDTO, ShippingIntentStatus } from "@/types";

// ─── Create Intent Modal ───────────────────────────────
interface CreateIntentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dto: ShippingIntentDTO) => Promise<void>;
}

const EMPTY_INTENT: ShippingIntentDTO = { orderId: "", userId: 0, addressId: 0 };

export function CreateIntentModal({ open, onClose, onSave }: CreateIntentModalProps) {
  const [form, setForm] = useState<ShippingIntentDTO>(EMPTY_INTENT);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(EMPTY_INTENT);
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.orderId.trim()) e.orderId = "Order ID required";
    if (!form.userId) e.userId = "User ID required";
    if (!form.addressId) e.addressId = "Address ID required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
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
    <Modal open={open} onClose={onClose} title="Create Shipping Intent" size="md">
      <div className="px-4 py-3 mb-5 text-xs text-indigo-300 border rounded-lg bg-info/5 border-info/20">
        ℹ️ Status will be automatically set to <strong>PENDING</strong> when created.
      </div>

      <FormGroup>
        <FormLabel required>Order ID</FormLabel>
        <FormInput
          placeholder="e.g. ORD-1099"
          value={form.orderId}
          onChange={(e) => setForm(f => ({ ...f, orderId: e.target.value }))}
          error={errors.orderId}
        />
      </FormGroup>

      <FormRow>
        <FormGroup>
          <FormLabel required>User ID</FormLabel>
          <FormInput
            type="number"
            placeholder="e.g. 230"
            value={form.userId || ""}
            onChange={(e) => setForm(f => ({ ...f, userId: Number(e.target.value) }))}
            error={errors.userId}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel required>Address ID</FormLabel>
          <FormInput
            type="number"
            placeholder="e.g. 17"
            value={form.addressId || ""}
            onChange={(e) => setForm(f => ({ ...f, addressId: Number(e.target.value) }))}
            error={errors.addressId}
          />
        </FormGroup>
      </FormRow>

      <FormActions>
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>Create Intent</Button>
      </FormActions>
    </Modal>
  );
}

// ─── Update Intent Status Modal ───────────────────────
const INTENT_STATUSES: { value: ShippingIntentStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

interface UpdateIntentStatusModalProps {
  open: boolean;
  onClose: () => void;
  intent: ShippingIntent | null;
  onUpdate: (id: number, status: ShippingIntentStatus) => Promise<void>;
}

export function UpdateIntentStatusModal({
  open,
  onClose,
  intent,
  onUpdate,
}: UpdateIntentStatusModalProps) {
  const [status, setStatus] = useState<ShippingIntentStatus>("PENDING");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (intent) setStatus(intent.status);
  }, [intent]);

  const handleSubmit = async () => {
    if (!intent) return;
    setLoading(true);
    try {
      await onUpdate(intent.shipping_intent_id, status);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Update Intent Status" size="sm">
      <FormGroup>
        <FormLabel>Current Intent</FormLabel>
        <div className="px-4 py-3 text-xs rounded-lg text-muted bg-surface2">
          Intent #{intent?.shipping_intent_id} · Order {intent?.orderId}
        </div>
      </FormGroup>

      <FormGroup>
        <FormLabel>New Status</FormLabel>
        <FormSelect
          options={INTENT_STATUSES}
          value={status}
          onChange={(e) => setStatus(e.target.value as ShippingIntentStatus)}
        />
      </FormGroup>

      <FormActions>
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>Update</Button>
      </FormActions>
    </Modal>
  );
}