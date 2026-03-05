"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, EmptyState } from "@/shipping/components/ui/Card";
import { Button } from "@/shipping/components/ui/Button";
import { Table, Thead, Th, Tbody, Tr } from "@/shipping/components/ui/Table";
import { ConfirmDialog } from "@/shipping/components/ui/ConfirmDialog";
import { FormSelect } from "@/shipping/components/ui/Form";
import {
  CreateShipmentModal,
  ViewShipmentModal,
  UpdateStatusModal,
  AssignModal,
} from "@/shipping/components/shipments/ShipmentModals";
import { ShipmentRow } from "@/shipping/components/shipments/ShipmentRow";
import * as shipmentAPI from "@/shipping/lib/services/shipmentService ";
import type { Shipment, ShipmentDTO, ShippingStatus } from "@/shipping/types";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "DISPATCHED", label: "Dispatched" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [viewShipment, setViewShipment] = useState<Shipment | null>(null);
  const [updateShipment, setUpdateShipment] = useState<Shipment | null>(null);
  const [assignShipment, setAssignShipment] = useState<Shipment | null>(null);
  const [deleteShipmentState, setDeleteShipmentState] = useState<Shipment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Fetch Shipments ─────────────────────────
  const fetchShipments = async () => {
    setLoading(true);
    try {
      const data = await shipmentAPI.getAllShipments();
      setShipments(data);
    } catch (err) {
      console.error("Failed to load shipments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const filtered = useMemo(
    () => shipments.filter((s) => !statusFilter || s.status === statusFilter),
    [shipments, statusFilter]
  );

  // ─── CRUD Handlers ──────────────────────────
  const handleCreate = async (dto: ShipmentDTO) => {
    await shipmentAPI.createShipment(dto);
    await fetchShipments();
  };

  const handleUpdateStatus = async (id: number, status: ShippingStatus) => {
    try {
      await shipmentAPI.updateShipmentStatus(id, status);
      await fetchShipments();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleAssign = async (shipmentId: number, driverId: number, vehicleId: number) => {
    await shipmentAPI.assignDriverAndVehicle(shipmentId, driverId, vehicleId);
    await fetchShipments();
  };

  const handleDelete = async () => {
    if (!deleteShipmentState) return;
    setDeleteLoading(true);
    try {
      await shipmentAPI.deleteShipment(deleteShipmentState.shipmentId);
      setDeleteShipmentState(null);
      await fetchShipments();
    } catch (err) {
      console.error("Failed to delete shipment", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{filtered.length} shipments found</p>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> Create Shipment
        </Button>
      </div>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Shipments</CardTitle>
          <div className="flex items-center gap-3">
            <Filter size={14} />
            <FormSelect
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-36 py-1.5 text-xs"
            />
          </div>
        </CardHeader>

        {loading ? (
          <div className="p-6 text-sm text-muted">Loading shipments...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No shipments found"
            description="Create your first shipment."
            action={
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                Create Shipment
              </Button>
            }
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Tracking</Th>
                <Th>Driver</Th>
                <Th>Vehicle</Th>
                <Th>Intent</Th>
                <Th>Status</Th>
                <Th>Started</Th>
                <Th>Delivered</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((shipment) => (
                <ShipmentRow
                  key={shipment.shipmentId}
                  shipment={shipment}
                  onView={setViewShipment}
                  onUpdateStatus={setUpdateShipment}
                  onAssign={setAssignShipment}
                  onDelete={setDeleteShipmentState}
                />
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      {/* Modals */}
      <CreateShipmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
      />
      <ViewShipmentModal
        open={!!viewShipment}
        onClose={() => setViewShipment(null)}
        shipment={viewShipment}
      />
      <UpdateStatusModal
        open={!!updateShipment}
        onClose={() => setUpdateShipment(null)}
        shipment={updateShipment}
        onUpdate={handleUpdateStatus}
      />
      <AssignModal
        open={!!assignShipment}
        onClose={() => setAssignShipment(null)}
        shipment={assignShipment}
        onAssign={handleAssign}
      />
      <ConfirmDialog
        open={!!deleteShipmentState}
        onClose={() => setDeleteShipmentState(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Shipment"
        description={`Delete shipment #${deleteShipmentState?.shipmentId}?`}
      />
    </div>
  );
}



