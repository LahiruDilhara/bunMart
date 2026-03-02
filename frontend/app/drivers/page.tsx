"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DriverCard, DriverCardPlaceholder } from "@/components/drivers/DriverCard";
import { DriverFormModal } from "@/components/drivers/DriverFormModal";
import { driverService } from "@/lib/services/driverService";
import type { Driver, DriverDTO } from "@/types";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [deleteDriver, setDeleteDriver] = useState<Driver | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = drivers.filter((d) => d.active).length;

  const openCreate = () => {
    setEditDriver(null);
    setFormOpen(true);
  };

  const openEdit = (driver: Driver) => {
    setEditDriver(driver);
    setFormOpen(true);
  };

  const handleSave = async (dto: DriverDTO) => {
    if (editDriver) {
      const updated = await driverService.update(editDriver.driver_id, dto);
      setDrivers((prev) =>
        prev.map((d) => (d.driver_id === editDriver.driver_id ? updated : d))
      );
    } else {
      const created = await driverService.create(dto);
      setDrivers((prev) => [...prev, created]);
    }
  };

  const handleDelete = async () => {
    if (!deleteDriver) return;

    setDeleteLoading(true);
    try {
      await driverService.delete(deleteDriver.driver_id);
      setDrivers((prev) =>
        prev.filter((d) => d.driver_id !== deleteDriver.driver_id)
      );
      setDeleteDriver(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <p>Loading drivers...</p>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">
            {activeCount} active · {drivers.length - activeCount} inactive
          </p>
        </div>

        <Button variant="primary" onClick={openCreate}>
          <Plus size={14} /> Add Driver
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {drivers.map((driver) => (
          <DriverCard
            key={driver.driver_id}
            driver={driver}
            onEdit={openEdit}
            onDelete={(d) => setDeleteDriver(d)}
          />
        ))}

        <DriverCardPlaceholder onClick={openCreate} />
      </div>

      {/* Modals */}
      <DriverFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        driver={editDriver}
      />

      <ConfirmDialog
        open={!!deleteDriver}
        onClose={() => setDeleteDriver(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Remove Driver"
        description={`Are you sure you want to remove ${deleteDriver?.name}?`}
      />
    </div>
  );
}