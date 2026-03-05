"use client";

import { useState, useEffect, useRef } from "react";

interface AddAddressModalProps {
  isSaving: boolean;
  apiError: string | null;
  onClose: () => void;
  onSave: (data: { line1: string; line2?: string; city: string; state?: string; postalCode: string; country: string; type: string }) => void;
}

const ADDRESS_TYPES = ["Home", "Office", "Other"] as const;

export function AddAddressModal({ isSaving, apiError, onClose, onSave }: AddAddressModalProps) {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState<string>("Home");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!line1.trim()) errs.line1 = "Address line 1 is required";
    if (!city.trim()) errs.city = "City is required";
    if (!postalCode.trim()) errs.postalCode = "Postal code is required";
    if (!country.trim()) errs.country = "Country is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ line1: line1.trim(), line2: line2.trim() || undefined, city: city.trim(), state: state.trim() || undefined, postalCode: postalCode.trim(), country: country.trim(), type });
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-stone-800 text-[#181511] dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors[field] ? "border-red-400" : "border-stone-200 dark:border-stone-700"}`;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="bg-white dark:bg-stone-900 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800 sticky top-0 bg-white dark:bg-stone-900 z-10">
          <h2 className="text-lg font-bold text-[#181511] dark:text-white">Add New Address</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {apiError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-red-500 text-lg flex-shrink-0">error</span>
              <p className="text-sm text-red-600 dark:text-red-300">{apiError}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#181511] dark:text-white">Address Type</label>
            <div className="flex gap-2">
              {ADDRESS_TYPES.map((t) => (
                <button key={t} onClick={() => setType(t)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${type === t ? "bg-primary text-white" : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"}`}>{t}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#181511] dark:text-white">Address Line 1 *</label>
            <input type="text" value={line1} onChange={(e) => setLine1(e.target.value)} className={inputClass("line1")} placeholder="123 Baker St" />
            {errors.line1 && <p className="text-xs text-red-500">{errors.line1}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#181511] dark:text-white">Address Line 2</label>
            <input type="text" value={line2} onChange={(e) => setLine2(e.target.value)} className={inputClass("line2")} placeholder="Apt 4B, Floor District (optional)" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#181511] dark:text-white">City *</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass("city")} placeholder="London" />
              {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#181511] dark:text-white">State / Province</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} className={inputClass("state")} placeholder="(optional)" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#181511] dark:text-white">Postal Code *</label>
              <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass("postalCode")} placeholder="NW1 6XE" />
              {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#181511] dark:text-white">Country *</label>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass("country")} placeholder="UK" />
              {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-200 dark:border-stone-800">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={isSaving} className="px-5 py-2.5 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {isSaving && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
            {isSaving ? "Saving…" : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}