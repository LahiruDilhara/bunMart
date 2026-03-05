"use client";

import { useEffect, useState } from "react";
import { Plus, Truck } from "lucide-react";
import { Button } from "@/shipping/components/ui/Button";
import { ConfirmDialog } from "@/shipping/components/ui/ConfirmDialog";
import {
  VehicleCard,
  VehicleCardPlaceholder,
} from "@/shipping/components/vehicles/VehicleCard";
import { VehicleFormModal } from "@/shipping/components/vehicles/VehicleFormModal";
import { vehicleService } from "@/shipping/lib/services/vehicleService";
import type { Vehicle, VehicleDTO } from "@/shipping/types";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load data from backend
  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = vehicles.filter((v) => v.active).length;

  const openCreate = () => {
    setEditVehicle(null);
    setFormOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setFormOpen(true);
  };

  // Create + Update
  const handleSave = async (dto: VehicleDTO) => {
    try {
      if (editVehicle) {
        const updated = await vehicleService.update(
          editVehicle.vehicle_id,
          dto
        );

        setVehicles((prev) =>
          prev.map((v) =>
            v.vehicle_id === editVehicle.vehicle_id ? updated : v
          )
        );
      } else {
        const created = await vehicleService.create(dto);
        setVehicles((prev) => [...prev, created]);
      }
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteVehicle) return;

    setDeleteLoading(true);

    try {
      await vehicleService.delete(deleteVehicle.vehicle_id);

      setVehicles((prev) =>
        prev.filter((v) => v.vehicle_id !== deleteVehicle.vehicle_id)
      );

      setDeleteVehicle(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <p>Loading vehicles...</p>;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-full w-9 h-9 bg-info/10">
            <Truck size={18} className="text-indigo-400" />
          </div>

          <p className="text-xs text-muted">
            {activeCount} active ·{" "}
            {vehicles.length - activeCount} inactive ·{" "}
            {vehicles.length} total
          </p>
        </div>

        <Button variant="primary" onClick={openCreate}>
          <Plus size={14} /> Add Vehicle
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.vehicle_id}
            vehicle={vehicle}
            onEdit={openEdit}
            onDelete={(v) => setDeleteVehicle(v)}
          />
        ))}

        <VehicleCardPlaceholder onClick={openCreate} />
      </div>

      {/* Modals */}
      <VehicleFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        vehicle={editVehicle}
      />

      <ConfirmDialog
        open={!!deleteVehicle}
        onClose={() => setDeleteVehicle(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Remove Vehicle"
        description={`Remove ${deleteVehicle?.plate_number} from fleet?`}
      />
    </div>
  );
}