import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
        role="region"
        aria-label="Notifikasi sistem"
      >
        {toasts.map((toast) => {
          const typeStyles = {
            success: "bg-emerald-50 border-emerald-300 text-emerald-900",
            error: "bg-red-50 border-red-300 text-red-900",
            info: "bg-indigo-50 border-indigo-300 text-indigo-900",
          };

          const iconStyles = {
            success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
            error: <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />,
            info: <Info className="h-5 w-5 text-indigo-600 shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              role="status"
              aria-live="polite"
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg transition-all ${
                typeStyles[toast.type]
              }`}
            >
              <div className="flex items-center gap-2.5">
                {iconStyles[toast.type]}
                <span className="text-xs font-semibold leading-tight">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="rounded-lg p-1 text-slate-500 hover:text-slate-800 transition-colors focus:ring-2 focus:ring-slate-400"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider");
  }
  return context;
};
