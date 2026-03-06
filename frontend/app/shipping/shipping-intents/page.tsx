"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Filter, ClipboardList } from "lucide-react";
import { Card, CardHeader, CardTitle, EmptyState } from "@/shipping/components/ui/Card";
import { Button } from "@/shipping/components/ui/Button";
import { IntentStatusBadge } from "@/shipping/components/ui/Badge";
import { FormSelect } from "@/shipping/components/ui/Form";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/shipping/components/ui/Table";
import { CreateIntentModal, UpdateIntentStatusModal } from "@/shipping/components/shipping-intents/IntentModals";
import { shippingIntentService } from "@/shipping/lib/services/shippingIntentService";
import { formatDate } from "@/shipping/lib/utils";
import type { ShippingIntent, ShippingIntentDTO, ShippingIntentStatus } from "@/shipping/types";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function ShippingIntentsPage() {
  const [intents, setIntents] = useState<ShippingIntentDTO[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [updateIntent, setUpdateIntent] = useState<ShippingIntentDTO | null>(null);

  const fetchIntents = async () => {
    try {
      setLoading(true);
      const data = statusFilter
        ? await shippingIntentService.getByStatus(statusFilter as ShippingIntentStatus)
        : await shippingIntentService.getAll();
      setIntents(data as ShippingIntentDTO[]);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIntents(); }, [statusFilter]);

  const statusCounts = useMemo(() => ({
    PENDING: intents.filter((i) => i.status === "PENDING").length,
    ASSIGNED: intents.filter((i) => i.status === "ASSIGNED").length,
    COMPLETED: intents.filter((i) => i.status === "COMPLETED").length,
    CANCELLED: intents.filter((i) => i.status === "CANCELLED").length,
  }), [intents]);

  const filteredIntents = useMemo(
    () => intents.filter((i) => !statusFilter || i.status === statusFilter),
    [intents, statusFilter]
  );

  return (
    <div className="min-h-screen p-6 space-y-6 bg-white animate-slide-up">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900 uppercase font-syne">
            Shipping Intents
          </h2>
          <p className="text-sm text-gray-500">
            Current request ledger for the BunMart delivery network.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setCreateOpen(true)} 
          className="bg-[#FF7A1F] hover:bg-orange-600 border-none shadow-lg shadow-orange-100 px-6 font-bold"
        >
          <Plus size={16} className="mr-2" /> Create Intent
        </Button>
      </div>

      {/* Pill-Style Status Filters */}
      <div className="flex flex-wrap gap-3">
        {(Object.entries(statusCounts) as [ShippingIntentStatus, number][]).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
            className={`px-5 py-2 rounded-full border text-xs font-bold transition-all flex items-center gap-3 ${
              statusFilter === status
                ? "bg-orange-50 border-[#FF7A1F] text-[#FF7A1F] ring-2 ring-orange-500/5"
                : "bg-white border-gray-200 text-gray-600 shadow-sm hover:border-orange-200"
            }`}
          >
            <IntentStatusBadge status={status} />
            <span className="text-sm font-syne">{count}</span>
          </button>
        ))}
      </div>

      {/* Main Ledger Card */}
      <Card className="overflow-hidden bg-white border-gray-100 shadow-xl shadow-gray-200/40 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-gray-50 bg-gray-50/20">
          <CardTitle>
            <span className="text-lg font-black text-gray-900 font-syne">Intent Ledger</span>
          </CardTitle>
          <div className="flex items-center gap-3">
            <Filter size={14} className="text-gray-400" />
            <FormSelect
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40 h-10 text-xs bg-white border-gray-200 rounded-xl"
            />
          </div>
        </CardHeader>

        {loading ? (
          <div className="p-20 text-center">
             <div className="w-8 h-8 mx-auto mb-4 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
             <p className="text-xs font-bold tracking-widest text-gray-400 uppercase font-syne">Fetching Records...</p>
          </div>
        ) : filteredIntents.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No records found"
            description="Adjust your filters or create a new intent to see results."
          />
        ) : (
          <Table>
            <Thead>
              <Tr className="bg-gray-50/50">
                <Th className="font-black text-gray-900">Intent ID</Th>
                <Th className="font-black text-gray-900">Order ID</Th>
                <Th className="font-black text-gray-900">User ID</Th>
                <Th className="font-black text-gray-900">Address ID</Th>
                <Th className="font-black text-gray-900">Status</Th>
                <Th className="font-black text-gray-900">Created At</Th>
                <Th className="font-black text-right text-gray-900">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredIntents.map((intent) => (
                <Tr key={intent.shipping_intent_id} className="transition-colors hover:bg-gray-50/30 border-gray-50">
                  <Td className="font-black text-gray-900 font-syne">
                    SI-{intent.shipping_intent_id}
                  </Td>
                  <Td className="font-medium text-gray-600">{intent.orderId}</Td>
                  <Td className="font-bold text-gray-500">#{intent.userId}</Td>
                  <Td className="font-bold text-gray-500">#{intent.addressId}</Td>
                  <Td>
                    <IntentStatusBadge status={intent.status ?? "PENDING"} />
                  </Td>
                  <Td className="font-mono text-xs text-gray-400">
                    {formatDate(intent.created_at ?? null)}
                  </Td>
                  <Td className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setUpdateIntent(intent)}
                      className="border-orange-100 text-[#FF7A1F] hover:bg-orange-50 font-bold px-4 h-8 text-[11px] rounded-lg"
                    >
                      Update Status
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      {/* Create Modal */}
      <CreateIntentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={async (dto) => {
          await shippingIntentService.create(dto);
          fetchIntents();
          setCreateOpen(false);
        }}
      />

      {/* Update Modal */}
      {updateIntent && (
        <UpdateIntentStatusModal
          open={!!updateIntent}
          onClose={() => setUpdateIntent(null)}
          intent={updateIntent as ShippingIntent}
          onUpdate={async (id, status) => {
            await shippingIntentService.updateStatus(id, status);
            fetchIntents();
            setUpdateIntent(null);
          }}
        />
      )}
    </div>
  );
}