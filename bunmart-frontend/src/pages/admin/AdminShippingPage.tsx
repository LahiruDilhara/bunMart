import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAllShippingPackages,
  getAllDrivers,
  assignDriver,
} from "@/service/shippingService";
import { getApiErrorMessage } from "@/utils/apiError";
import type { ShippingPackageResponseDTO } from "@/model/shipping";
import type { DriverResponseDTO } from "@/model/shipping";
import type { ShippingPackageStatus } from "@/model/shipping";

const PACKAGE_STATUS_OPTIONS: { value: ShippingPackageStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "CREATED", label: "Created (awaiting driver)" },
  { value: "IN_TRANSIT", label: "In transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "STOPPED", label: "Stopped" },
];

export function AdminShippingPage() {
  const [packages, setPackages] = useState<ShippingPackageResponseDTO[]>([]);
  const [drivers, setDrivers] = useState<DriverResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ShippingPackageStatus | "">("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pkgs, drvs] = await Promise.all([
        getAllShippingPackages(),
        getAllDrivers(),
      ]);
      setPackages(pkgs ?? []);
      setDrivers(drvs ?? []);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredPackages =
    statusFilter === ""
      ? packages
      : packages.filter((p) => (p.status as string) === statusFilter);

  const handleAssignDriver = async (packageId: string, driverId: number) => {
    setAssigningId(packageId);
    setError(null);
    try {
      const updated = await assignDriver(packageId, driverId);
      setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-sky-600">local_shipping</span>
          Shipping
        </h1>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/drivers"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Manage drivers
          </Link>
          <Link
            to="/driver"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-lg">directions_car</span>
            Driver view
          </Link>
        </div>
      </div>
      <p className="text-muted text-sm mb-4">Assign a driver to each shipment. Packages appear here after you send prepared orders to shipping from Orders.</p>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
          Filter by status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ShippingPackageStatus | "")}
            className="rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2 text-sm min-w-[200px]"
          >
            {PACKAGE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-muted">
          {statusFilter
            ? `Showing: ${PACKAGE_STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? statusFilter} (${filteredPackages.length})`
            : `Showing: All (${packages.length})`}
        </span>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="mt-4 text-muted">Loading…</p>
        </div>
      ) : packages.length === 0 ? (
        <p className="text-muted">No shipping packages yet. Send prepared orders to shipping from Admin → Orders.</p>
      ) : filteredPackages.length === 0 ? (
        <p className="text-muted">No packages match the selected status filter.</p>
      ) : (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 dark:bg-stone-800/80">
              <tr>
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium">Destination (location)</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Progress</th>
                <th className="p-3 font-medium">Driver</th>
                <th className="p-3 font-medium">Assign driver</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="border-t border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                  <td className="p-3 font-mono text-xs">{pkg.orderId.slice(0, 8)}…</td>
                  <td className="p-3 max-w-xs truncate" title={pkg.destinationAddress}>
                    {pkg.destinationAddress}
                  </td>
                  <td className="p-3">{pkg.status}</td>
                  <td className="p-3">{pkg.progress}%</td>
                  <td className="p-3">
                    {pkg.driverId != null ? (
                      <span>{pkg.driverFullName ?? `Driver #${pkg.driverId}`}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    {pkg.status === "DELIVERED" ? (
                      <span className="text-muted text-sm" title="Delivery completed; driver cannot be changed">
                        Completed
                      </span>
                    ) : (
                      <select
                        value={pkg.driverId ?? ""}
                        disabled={assigningId === pkg.id}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v !== "") handleAssignDriver(pkg.id, Number(v));
                        }}
                        className="rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-2 py-1.5 text-sm"
                      >
                        <option value="">Select driver</option>
                        {drivers.filter((d) => d.active).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.fullName} (#{d.id})
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
