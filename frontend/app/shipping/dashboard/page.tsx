"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Users, Truck, ArrowRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { StatCard, Card, CardHeader, CardTitle } from "@/shipping/components/ui/Card";
import { ShipmentStatusBadge } from "@/shipping/components/ui/Badge";
import { Button } from "@/shipping/components/ui/Button";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/shipping/components/ui/Table";
import { WeeklyChart } from "@/shipping/components/shipments/WeeklyChart";
import { CreateShipmentModal } from "@/shipping/components/shipments/ShipmentModals";
import {
  DUMMY_SHIPMENTS,
  DUMMY_DRIVERS,
  DUMMY_VEHICLES,
  DUMMY_SHIPPING_INTENTS,
} from "@/shipping/lib/dummy-data";
import { formatDateShort } from "@/shipping/lib/utils";
import type { ShipmentDTO } from "@/shipping/types";

const recentShipments = DUMMY_SHIPMENTS.slice(0, 5);
const activeDrivers = DUMMY_DRIVERS.filter((d) => d.active).length;
const pendingIntents = DUMMY_SHIPPING_INTENTS.filter((i) => i.status === "PENDING").length;
const availableVehicles = DUMMY_VEHICLES.filter((v) => v.active).length;
const deliveredCount = DUMMY_SHIPMENTS.filter((s) => s.status === "DELIVERED").length;
const inTransitCount = DUMMY_SHIPMENTS.filter((s) => s.status === "IN_TRANSIT" || s.status === "DISPATCHED").length;

export default function DashboardPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const handleCreateShipment = async (dto: ShipmentDTO) => {
    console.log("Creating shipment:", dto);
    // await shipmentService.create(dto);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight font-syne">
            Good morning 👋
          </h2>
          <p className="mt-1 text-sm text-muted">
            Here&apos;s what&apos;s happening with your shipments today.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Package size={14} />
          New Shipment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Shipments"
          value={DUMMY_SHIPMENTS.length}
          sub="↑ 3 this week"
          color="orange"
          icon={<Package />}
        />
        <StatCard
          label="Delivered"
          value={deliveredCount}
          sub={`${Math.round((deliveredCount / DUMMY_SHIPMENTS.length) * 100)}% success rate`}
          color="green"
          icon={<CheckCircle />}
        />
        <StatCard
          label="In Transit"
          value={inTransitCount}
          sub="Active right now"
          color="blue"
          icon={<Clock />}
        />
        <StatCard
          label="Active Drivers"
          value={activeDrivers}
          sub={`of ${DUMMY_DRIVERS.length} registered`}
          color="yellow"
          icon={<Users />}
        />
      </div>

      {/* Quick Info Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-4 px-5 py-4 border bg-surface border-border rounded-xl">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
            <AlertCircle size={18} className="text-accent" />
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wide">Pending Intents</div>
            <div className="text-xl font-bold font-syne text-accent">{pendingIntents}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 px-5 py-4 border bg-surface border-border rounded-xl">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-info/10">
            <Truck size={18} className="text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wide">Available Vehicles</div>
            <div className="text-xl font-bold text-indigo-400 font-syne">{availableVehicles}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 px-5 py-4 border bg-surface border-border rounded-xl">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10">
            <Users size={18} className="text-success" />
          </div>
          <div>
            <div className="text-[10px] text-muted uppercase tracking-wide">On Duty Drivers</div>
            <div className="text-xl font-bold font-syne text-success">{activeDrivers}</div>
          </div>
        </div>
      </div>

      {/* Table + Chart */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Recent shipments */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Recent Shipments</CardTitle>
            <Link href="/shipments">
              <Button size="sm" variant="ghost">
                View All <ArrowRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <Table>
            <Thead>
              <Tr>
                <Th>Tracking</Th>
                <Th>Driver</Th>
                <Th>Status</Th>
                <Th>Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {recentShipments.map((s) => (
                <Tr key={s.shipmentId}>
                  <Td>
                    <span className="text-muted">TRK-</span>
                    {String(s.trackingNumber).padStart(4, "0")}
                  </Td>
                  <Td>{s.driverId ? `Driver #${s.driverId}` : "—"}</Td>
                  <Td><ShipmentStatusBadge status={s.status} /></Td>
                  <Td className="text-muted">{formatDateShort(s.startedAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>

        {/* Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Overview</CardTitle>
          </CardHeader>
          <WeeklyChart />
        </Card>
      </div>

      {/* Create Shipment Modal */}
      <CreateShipmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreateShipment}
      />
    </div>
  );
}
