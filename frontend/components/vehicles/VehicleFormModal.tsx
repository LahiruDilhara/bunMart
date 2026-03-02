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
  Toggle,
} from "@/components/ui/Form";
import type { Vehicle, VehicleDTO, VehicleType } from "@/types";

interface VehicleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dto: VehicleDTO) => Promise<void>;
  vehicle?: Vehicle | null;
}

// Vehicle type options
const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "VAN", label: "🚐 Van" },
  { value: "CAR", label: "🚗 Car" },
  { value: "BIKE", label: "🏍️ Bike" },
  { value: "TRUCK", label: "🚚 Truck" },
];

// Empty form template
const EMPTY_FORM: VehicleDTO = {
  plate_number: "",
  type: "VAN",
  active: true,
};

export function VehicleFormModal({
  open,
  onClose,
  onSave,
  vehicle,
}: VehicleFormModalProps) {
  const [form, setForm] = useState<VehicleDTO>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof VehicleDTO, string>>>({});

  // Sync form state with passed vehicle for edit
  useEffect(() => {
    if (vehicle) {
      setForm({
        plate_number: vehicle.plate_number,
        type: vehicle.type,
        active: vehicle.active,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [vehicle, open]);

  // Validate form
  const validate = () => {
    const e: Partial<Record<keyof VehicleDTO, string>> = {};
    if (!form.plate_number.trim()) {
      e.plate_number = "Plate number is required";
    }
    return e;
  };

  // Submit form
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
      console.error("Save failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vehicle ? "Edit Vehicle" : "Add New Vehicle"}
      size="sm"
    >
      {/* Plate Number */}
      <FormGroup>
        <FormLabel required>Plate Number</FormLabel>
        <FormInput
          value={form.plate_number}
          placeholder="WP-VAN-5512"
          onChange={(e) =>
            setForm((prev) => ({ ...prev, plate_number: e.target.value }))
          }
          error={errors.plate_number}
        />
      </FormGroup>

      {/* Vehicle Type */}
      <FormGroup>
        <FormLabel required>Vehicle Type</FormLabel>
        <FormSelect
          options={VEHICLE_TYPES}
          value={form.type}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, type: e.target.value as VehicleType }))
          }
        />
      </FormGroup>

      {/* Active Status */}
      <FormGroup>
        <FormLabel>Status</FormLabel>
        <Toggle
          checked={form.active}
          onChange={(value) => setForm((prev) => ({ ...prev, active: value }))}
          label={form.active ? "Active" : "Inactive"}
        />
      </FormGroup>

      {/* Actions */}
      <FormActions>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading}>
          {vehicle ? "Save Changes" : "Add Vehicle"}
        </Button>
      </FormActions>
    </Modal>
  );
}