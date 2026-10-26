import React from "react";
import { Modal } from "./Modal";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  isDestructive = true,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              isDestructive ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm text-slate-600 mt-1">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-slate-400 min-h-[44px]"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors focus:ring-2 min-h-[44px] ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600"
            } disabled:opacity-50`}
          >
            {loading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
