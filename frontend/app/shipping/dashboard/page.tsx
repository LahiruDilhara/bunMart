"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Users,
  Truck,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, StatCard } from "@/shipping/components/ui/Card";
import { ShipmentStatusBadge } from "@/shipping/components/ui/Badge";
import { Button } from "@/shipping/components/ui/Button";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/shipping/components/ui/Table";
import { WeeklyChart } from "@/shipping/components/shipments/WeeklyChart";
import { CreateShipmentModal } from "@/shipping/components/shipments/ShipmentModals";
import { formatDateShort } from "@/shipping/lib/utils";
import type { ShipmentDTO, Shipment } from "@/shipping/types";

export default function DashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [intents, setIntents] = useState<any[]>([]);
  const [createOpen, setCreateOpen] = useState(false); 
  const [loading, setLoading] = useState(true);
  
  const backendUrl = "http://localhost:8080";

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [sRes, dRes, vRes, iRes] = await Promise.all([
        fetch(`${backendUrl}/api/v1/shipments/all-shipments`),
        fetch(`${backendUrl}/api/v1/shipping/driver/all-drivers`),
        fetch(`${backendUrl}/api/v1/shipping/vehicle/all-vehicles`),
        fetch(`${backendUrl}/api/v1/shipping/shipping-intents/all-shippingIntents`),
      ]);

      const [shipmentsData, driversData, vehiclesData, intentsData] = await Promise.all([
        sRes.json(),
        dRes.json(),
        vRes.json(),
        iRes.json(),
      ]);

      setShipments(shipmentsData);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setIntents(intentsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const recentShipments = shipments.slice(0, 5);
  const activeDrivers = drivers.filter((d) => d.active).length;
  const pendingIntents = intents.filter((i) => i.status === "PENDING").length;
  const availableVehicles = vehicles.filter((v) => v.active).length;
  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;
  const inTransitCount = shipments.filter(
    (s) => s.status === "IN_TRANSIT" || s.status === "DISPATCHED"
  ).length;

  if (loading) return <div className="p-10 text-center text-gray-400 font-syne">Loading BunMart Logistics...</div>;

  return (
    <div className="space-y-6 bg-white animate-slide-up">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 uppercase font-syne">
            Good Morning 👋
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Current activity across your shipping network.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateOpen(true)}
          className="bg-orange-500 border-none shadow-lg hover:bg-orange-600 shadow-orange-200"
        >
          <Package size={16} className="mr-2" /> New Shipment
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Shipments"
          value={shipments.length}
          sub="All-time system count"
          color="orange"
          icon={<Package />}
        />
        <StatCard
          label="Delivered"
          value={deliveredCount}
          sub={`${shipments.length ? Math.round((deliveredCount / shipments.length) * 100) : 0}% success`}
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
          sub={`of ${drivers.length} registered`}
          color="orange" 
          icon={<Users />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="border-gray-100 shadow-sm xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-gray-50">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/shipping/shipments" className="flex items-center gap-1 text-sm font-bold text-orange-500 hover:underline">
              View All <ArrowRight size={14} />
            </Link>
          </CardHeader>
          <Table>
            <Tbody>
              {recentShipments.map((s) => (
                <Tr key={s.shipmentId}>
                  <Td className="font-bold text-gray-900">TRK-{String(s.trackingNumber).padStart(4, "0")}</Td>
                  <Td className="text-gray-500">Driver #{s.driverId || 'N/A'}</Td>
                  <Td><ShipmentStatusBadge status={s.status} /></Td>
                  <Td className="text-right text-gray-400">{formatDateShort(s.startedAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Card>

        <Card className="border-gray-100 shadow-sm xl:col-span-2">
          <CardHeader className="px-6 py-5 border-b border-gray-50">
            <CardTitle>Weekly Performance</CardTitle>
          </CardHeader>
          <div className="px-6 pb-6">
             {/* NOW CORRECTLY TYPED */}
            <WeeklyChart shipments={shipments} />
          </div>
        </Card>
      </div>

      <CreateShipmentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={async () => {
            setCreateOpen(false);
            await fetchAll();
        }}
      />
    </div>
  );
}