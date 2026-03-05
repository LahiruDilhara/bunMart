// ─── components/ui/ConfirmDialog.tsx ───────────────────────
"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, loading }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="py-2 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 border border-red-200 rounded-full">
          <AlertTriangle size={22} className="text-red-600" />
        </div>
        <h3 className="mb-2 text-base font-bold text-gray-800 font-syne">{title}</h3>
        <p className="mb-6 text-sm text-gray-600">{description}</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
        </div>
      </div>
    </Modal>
  );
}