import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAllDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "@/service/shippingService";
import { getApiErrorMessage } from "@/utils/apiError";
import type { DriverResponseDTO, CreateDriverRequestDTO } from "@/model/shipping";

export function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DriverResponseDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CreateDriverRequestDTO>({
    fullName: "",
    age: 0,
    phone: "",
    vehicle: "",
    cargoSize: 0,
    maxWeight: 0,
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getAllDrivers();
      setDrivers(list ?? []);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ fullName: "", age: 0, phone: "", vehicle: "", cargoSize: 0, maxWeight: 0 });
    setFormOpen(true);
  };

  const openEdit = (d: DriverResponseDTO) => {
    setEditing(d);
    setForm({
      fullName: d.fullName,
      age: d.age ?? 0,
      phone: d.phone ?? "",
      vehicle: d.vehicle ?? "",
      cargoSize: d.cargoSize ?? 0,
      maxWeight: d.maxWeight ?? 0,
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateDriver(editing.id, {
          fullName: form.fullName,
          age: form.age,
          phone: form.phone || undefined,
          vehicle: form.vehicle || undefined,
          cargoSize: form.cargoSize,
          maxWeight: form.maxWeight,
        });
      } else {
        await createDriver(form);
      }
      await load();
      setFormOpen(false);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this driver?")) return;
    setError(null);
    try {
      await deleteDriver(id);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-sky-600">directions_car</span>
          Drivers
        </h1>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/shipping"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 font-medium hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Back to Shipping
          </Link>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add driver
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {formOpen && (
        <div className="mb-6 p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
          <h2 className="text-lg font-semibold mb-4">{editing ? "Edit driver" : "New driver"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full name *</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="number"
                min={0}
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: Number(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vehicle</label>
              <input
                value={form.vehicle}
                onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cargo size</label>
              <input
                type="number"
                min={0}
                value={form.cargoSize}
                onChange={(e) => setForm((f) => ({ ...f, cargoSize: Number(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max weight</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={form.maxWeight}
                onChange={(e) => setForm((f) => ({ ...f, maxWeight: Number(e.target.value) || 0 }))}
                className="w-full rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : editing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
          <p className="mt-4 text-muted">Loading drivers…</p>
        </div>
      ) : drivers.length === 0 ? (
        <p className="text-muted">No drivers yet. Add a driver to assign to shipments.</p>
      ) : (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-100 dark:bg-stone-800/80">
              <tr>
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Phone</th>
                <th className="p-3 font-medium">Vehicle</th>
                <th className="p-3 font-medium">Active</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-t border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50">
                  <td className="p-3 font-mono">{d.id}</td>
                  <td className="p-3 font-medium">{d.fullName}</td>
                  <td className="p-3">{d.phone ?? "—"}</td>
                  <td className="p-3">{d.vehicle ?? "—"}</td>
                  <td className="p-3">{d.active ? "Yes" : "No"}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(d)}
                      className="px-2 py-1 rounded border border-stone-300 dark:border-stone-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id)}
                      className="px-2 py-1 rounded border border-red-200 dark:border-red-800 text-red-600 text-sm"
                    >
                      Delete
                    </button>
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
