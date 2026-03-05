"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, EmptyState } from "@/shipping/components/ui/Card";
import { Button } from "@/shipping/components/ui/Button";
import { IntentStatusBadge } from "@/shipping/components/ui/Badge";
import { FormSelect } from "@/shipping/components/ui/Form";
import {
  CreateIntentModal,
  UpdateIntentStatusModal,
} from "@/shipping/components/shipping-intents/IntentModals";
import { shippingIntentService } from "@/shipping/lib/services/shippingIntentService";
import { formatDate } from "@/shipping/lib/utils";
import type { ShippingIntent, ShippingIntentDTO, ShippingIntentStatus } from "@/types";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function ShippingIntentsPage() {
  const [intents, setIntents] = useState<ShippingIntent[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [updateIntent, setUpdateIntent] = useState<ShippingIntent | null>(null);

  // Fetch all intents
  const fetchIntents = async () => {
    try {
      setLoading(true);
      const data = statusFilter
        ? await shippingIntentService.getByStatus(statusFilter as ShippingIntentStatus)
        : await shippingIntentService.getAll();
      setIntents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIntents(); }, [statusFilter]);

  const filtered = useMemo(
    () => intents.filter(i => !statusFilter || i.status === statusFilter),
    [intents, statusFilter]
  );

  const handleCreate = async (dto: ShippingIntentDTO) => {
    try {
      const newIntent = await shippingIntentService.create(dto);
      setIntents(prev => [newIntent, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: number, status: ShippingIntentStatus) => {
    try {
      const updated = await shippingIntentService.updateStatus(id, status);
      setIntents(prev => prev.map(i => i.shipping_intent_id === id ? updated : i));
    } catch (err) {
      console.error(err);
    }
  };

  const statusCounts = {
    PENDING: intents.filter(i => i.status === "PENDING").length,
    PROCESSING: intents.filter(i => i.status === "PROCESSING").length,
    COMPLETED: intents.filter(i => i.status === "COMPLETED").length,
    CANCELLED: intents.filter(i => i.status === "CANCELLED").length,
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="flex flex-wrap gap-3">
        {(Object.entries(statusCounts) as [ShippingIntentStatus, number][]).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(statusFilter === status ? "" : status)}
            className={`px-4 py-1.5 rounded-full text-xs border transition-all ${statusFilter === status
                ? "bg-accent/10 border-accent text-accent"
                : "bg-surface border-border text-muted hover:text-white"
              }`}
          >
            <IntentStatusBadge status={status} />
            <span className="ml-2 font-bold font-syne">{count}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{filtered.length} intents</p>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> Create Intent
        </Button>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Shipping Intents</CardTitle>
          <div className="flex items-center gap-3">
            <Filter size={14} className="text-muted" />
            <FormSelect
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-36 py-1.5 text-xs"
            />
          </div>
        </CardHeader>

        {loading ? (
          <div className="p-5 text-sm text-center text-muted">Loading...</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No intents found"
            description="Create a new shipping intent to get started."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-collapse border-border">
              <thead>
                <tr className="border-b border-border bg-white/[0.02]">
                  <th className="px-3 py-2">Intent ID</th>
                  <th className="px-3 py-2">Order ID</th>
                  <th className="px-3 py-2">User ID</th>
                  <th className="px-3 py-2">Address ID</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Created At</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(intent => (
                  <tr key={intent.shipping_intent_id} className="border-b border-border/60 hover:bg-white/[0.025] transition-colors">
                    <td className="px-3 py-2 text-xs font-bold font-syne">SI-{intent.shipping_intent_id}</td>
                    <td className="px-3 py-2">{intent.orderId}</td>
                    <td className="px-3 py-2 text-muted">#{intent.userId}</td>
                    <td className="px-3 py-2 text-muted">#{intent.addressId}</td>
                    <td className="px-3 py-2"><IntentStatusBadge status={intent.status} /></td>
                    <td className="px-3 py-2 text-muted">{formatDate(intent.created_at)}</td>
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" onClick={() => setUpdateIntent(intent)}>Update Status</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CreateIntentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
      />
      <UpdateIntentStatusModal
        open={!!updateIntent}
        onClose={() => setUpdateIntent(null)}
        intent={updateIntent}
        onUpdate={handleUpdateStatus}
      />
    </div>
  );
} 