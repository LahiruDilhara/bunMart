"use client";

import { useState } from "react";
import { Search, Package } from "lucide-react";
import { Button } from "@/shipping/components/ui/Button";
import { ShipmentStatusBadge } from "@/shipping/components/ui/Badge";
import { TrackingTimeline } from "@/shipping/components/tracking/TrackingTimeline";
import { trackingService } from "@/shipping/lib/services/trackingService";
import type { Shipment } from "@/shipping/types";

export default function TrackingPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Shipment | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      // Remove non-digits (TRK-0001 → 1)
      const trackingNumber = Number(query.replace(/[^\d]/g, ""));

      const data = await trackingService.getByTrackingNumber(
        trackingNumber
      );

      setResult(data);
    } catch (error) {
      console.error("Tracking error:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Search Box */}
      <div className="p-8 text-center border bg-surface border-border rounded-2xl">
        <div className="flex items-center justify-center mx-auto mb-5 border rounded-full w-14 h-14 bg-accent/10 border-accent/20">
          <Package size={26} className="text-accent" strokeWidth={1.5} />
        </div>

        <h2 className="mb-2 text-2xl font-black tracking-tight font-syne">
          Track Your Shipment
        </h2>

        <div className="flex max-w-md gap-3 mx-auto">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-black"
            />
            <input
              className="w-full py-3 pl-10 pr-4 text-sm text-black border outline-none bg-surface2 border-border rounded-xl focus:border-accent"
              placeholder="TRK-0001"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSearch}
            loading={loading}
          >
            Track
          </Button>
        </div>
      </div>

      {/* Not Found */}
      {notFound && (
        <div className="p-6 text-center border bg-danger/5 border-danger/20 rounded-xl">
          <div className="mb-1 text-sm font-bold text-danger">
            Shipment Not Found
          </div>
          <p className="text-xs text-muted">
            Please check your tracking number and try again.
          </p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="overflow-hidden border bg-surface border-border rounded-2xl">
          {/* Header */}
          <div className="flex justify-between px-6 py-5 border-b border-border">
            <div>
              <div className="mb-1 text-xs text-muted">
                Tracking Number
              </div>
              <div className="text-xl font-bold">
                TRK-{String(result.trackingNumber).padStart(4, "0")}
              </div>
            </div>

            <ShipmentStatusBadge status={result.status} />
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 px-6 py-5 border-b border-border bg-surface2/40">
            <div>
              <div className="text-xs text-muted">Shipment ID</div>
              <div className="text-sm font-medium">
                #{result.shipmentId}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted">Driver</div>
              <div className="text-sm font-medium">
                {result.driverId ?? "Not Assigned"}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted">Vehicle</div>
              <div className="text-sm font-medium">
                {result.vehicleId ?? "Not Assigned"}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted">Shipping Intent</div>
              <div className="text-sm font-medium">
                #{result.shippingIntentId}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-6 py-6">
            <TrackingTimeline
              currentStatus={result.status}
              startedAt={result.startedAt}
              deliveredAt={result.deliveredAt}
            />
          </div>
        </div>
      )}
    </div>
  );
}

