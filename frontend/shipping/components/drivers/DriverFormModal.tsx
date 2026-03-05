"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/shipping/components/ui/Modal";
import { Button } from "@/shipping/components/ui/Button";
import {
  FormGroup,
  FormLabel,
  FormInput,
  FormActions,
  Toggle,
} from "@/shipping/components/ui/Form";
import type { Driver, DriverDTO } from "@/shipping/types";

interface DriverFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dto: DriverDTO) => Promise<void>;
  driver?: Driver | null;
}

const EMPTY_FORM: DriverDTO = { name: "", phone: "", active: true };

export function DriverFormModal({
  open,
  onClose,
  onSave,
  driver,
}: DriverFormModalProps) {
  const [form, setForm] = useState<DriverDTO>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<DriverDTO>>({});

  useEffect(() => {
    if (driver) {
      setForm({ name: driver.name, phone: driver.phone, active: driver.active });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [driver, open]);

  const validate = () => {
    const e: Partial<Record<keyof DriverDTO, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
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
    <Modal
      open={open}
      onClose={onClose}
      title={driver ? "Edit Driver" : "Add New Driver"}
      size="sm"
    >
      <FormGroup>
        <FormLabel required>Full Name</FormLabel>
        <FormInput
          placeholder="e.g. Amal Perera"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={errors.name as string}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel required>Phone Number</FormLabel>
        <FormInput
          placeholder="+94 77 123 4567"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          error={errors.phone as string}
        />
      </FormGroup>

      <FormGroup>
        <FormLabel>Status</FormLabel>
        <Toggle
          checked={form.active}
          onChange={(v) => setForm((f) => ({ ...f, active: v }))}
          label={form.active ? "Active" : "Inactive"}
        />
      </FormGroup>

      <FormActions>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          {driver ? "Save Changes" : "Add Driver"}
        </Button>
      </FormActions>
    </Modal>
  );
}
