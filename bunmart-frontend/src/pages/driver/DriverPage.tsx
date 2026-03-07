import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getShippingPackagesByDriverId,
  updateShippingProgress,
  stopShipping,
} from "@/service/shippingService";
import { getApiErrorMessage } from "@/utils/apiError";
import type { ShippingPackageResponseDTO } from "@/model/shipping";

export function DriverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const driverIdParam = searchParams.get("driverId");
  const driverId = driverIdParam ? parseInt(driverIdParam, 10) : null;

  const [packages, setPackages] = useState<ShippingPackageResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [inputDriverId, setInputDriverId] = useState(driverIdParam ?? "");

  const load = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const list = await getShippingPackagesByDriverId(id);
      setPackages(list ?? []);
    } catch (e) {
      setError(getApiErrorMessage(e));
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (driverId != null && !Number.isNaN(driverId)) {
      load(driverId);
    } else {
      setPackages([]);
    }
  }, [driverId]);

  const handleSetDriver = () => {
    const id = parseInt(inputDriverId, 10);
    if (Number.isNaN(id)) return;
    setSearchParams({ driverId: String(id) });
  };

  const handleProgress = async (pkg: ShippingPackageResponseDTO, progress: number) => {
    if (pkg.status === "DELIVERED" || pkg.status === "CANCELLED") return;
    setUpdatingId(pkg.id);
    setError(null);
    try {
      const updated = await updateShippingProgress(pkg.id, progress);
      setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStop = async (pkg: ShippingPackageResponseDTO) => {
    setUpdatingId(pkg.id);
    setError(null);
    try {
      const updated = await stopShipping(pkg.id);
      setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setUpdatingId(null);
    }
  };

  if (driverId == null || Number.isNaN(driverId)) {
    return (
      <div className="p-6 max-w-md">
        <h1 className="text-2xl font-bold text-foreground dark:text-white mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-sky-600">delivery_dining</span>
          Driver login
        </h1>
        <p className="text-muted text-sm mb-4">Enter your driver ID to see your assigned shipments and update delivery status.</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            placeholder="Driver ID"
            value={inputDriverId}
            onChange={(e) => setInputDriverId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSetDriver()}
            className="flex-1 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2"
          />
          <button
            type="button"
            onClick={handleSetDriver}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-sky-600">delivery_dining</span>
          My deliveries (Driver #{driverId})
        </h1>
        <button
          type="button"
          onClick={() => { setSearchParams({}); setInputDriverId(""); }}
          className="text-sm text-muted hover:text-foreground"
        >
          Use different driver ID
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <span className="material-symbols-outlined text-4xl text-sky-600 animate-spin">progress_activity</span>
          <p className="mt-4 text-muted">Loading your shipments…</p>
        </div>
      ) : packages.length === 0 ? (
        <p className="text-muted">No shipments assigned to you yet. Admin assigns drivers from Shipping.</p>
      ) : (
        <ul className="space-y-4">
          {packages.map((pkg) => (
            <li
              key={pkg.id}
              className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/50 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm font-medium">Order #{pkg.orderId.slice(0, 8)}</p>
                  <p className="text-sm text-muted mt-1 max-w-md truncate" title={pkg.destinationAddress}>
                    To: {pkg.destinationAddress}
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Status: <span className="font-medium text-foreground">{pkg.status}</span> · Progress: {pkg.progress}%
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {pkg.status !== "DELIVERED" && pkg.status !== "STOPPED" && pkg.status !== "CANCELLED" && (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={pkg.progress}
                          disabled={updatingId === pkg.id}
                          onChange={(e) => handleProgress(pkg, Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-sm text-muted w-10">{pkg.progress}%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleProgress(pkg, 100)}
                        disabled={updatingId === pkg.id}
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        Mark delivered
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStop(pkg)}
                        disabled={updatingId === pkg.id}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 text-sm disabled:opacity-50"
                      >
                        Stop
                      </button>
                    </>
                  )}
                  {pkg.status === "DELIVERED" && (
                    <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium">
                      Delivered
                    </span>
                  )}
                  {pkg.status === "STOPPED" && (
                    <span className="px-2 py-1 rounded bg-stone-200 dark:bg-stone-600 text-sm">Stopped</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
