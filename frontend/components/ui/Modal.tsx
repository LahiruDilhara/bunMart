// ─── components/ui/Modal.tsx ───────────────────────────────
"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={cn("bg-white border border-gray-200 rounded-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl",
        size === "sm" && "max-w-sm",
        size === "md" && "max-w-lg",
        size === "lg" && "max-w-2xl"
      )}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-base font-bold tracking-tight text-gray-800 font-syne">{title}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 transition-colors rounded-lg hover:text-gray-700 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}