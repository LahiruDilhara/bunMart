import { useState, useEffect } from "react";
import { getAddresses, addAddress, updateAddress, deleteAddress } from "@/service/profileService";
import { AddressCard, AddressFormModal } from "@/components/profile";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { getApiErrorMessage } from "@/utils/apiError";
import type { Address, AddressRequest } from "@/model/profile";

export function ProfileAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadAddresses = () => {
    setLoading(true);
    setError(null);
    getAddresses()
      .then(setAddresses)
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAdd = () => {
    setEditingAddress(null);
    setFormModalOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (payload: AddressRequest) => {
    setSaving(true);
    try {
      if (editingAddress != null) {
        const id = typeof editingAddress.id === "string" ? Number(editingAddress.id) : editingAddress.id;
        await updateAddress(id, payload);
      } else {
        await addAddress(payload);
      }
      loadAddresses();
      setFormModalOpen(false);
      setEditingAddress(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (address: Address) => {
    setDeletingAddress(address);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAddress) return;
    const id = typeof deletingAddress.id === "string" ? Number(deletingAddress.id) : deletingAddress.id;
    setDeleting(true);
    try {
      await deleteAddress(id);
      loadAddresses();
      setDeletingAddress(null);
    } catch (e) {
      setError(getApiErrorMessage(e));
      setDeletingAddress(null);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[40vh]">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        <p className="mt-4 text-muted">Loading addresses…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Addresses</h1>
        <button
          type="button"
          onClick={handleAdd}
          className="py-2.5 px-4 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90"
        >
          Add address
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {addresses.length === 0 ? (
        <p className="text-muted">No addresses saved. Add one to use at checkout.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <li key={addr.id}>
              <AddressCard
                address={addr}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            </li>
          ))}
        </ul>
      )}

      {formModalOpen && (
        <AddressFormModal
          address={editingAddress}
          onClose={() => {
            setFormModalOpen(false);
            setEditingAddress(null);
          }}
          onSubmit={handleFormSubmit}
          saving={saving}
        />
      )}

      {deletingAddress && (
        <ConfirmModal
          title="Delete address"
          message={
            <>
              Delete this address?{" "}
              {deletingAddress.street}, {deletingAddress.city}, {deletingAddress.country}
            </>
          }
          confirmLabel="Delete"
          onClose={() => setDeletingAddress(null)}
          onConfirm={handleDeleteConfirm}
          saving={deleting}
        />
      )}
    </div>
  );
}
