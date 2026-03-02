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

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm">
      <div className="text-center py-2">
        <div className="w-12 h-12 bg-danger/10 border border-danger/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-danger" />
        </div>
        <h3 className="font-syne font-bold text-base mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6">{description}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
