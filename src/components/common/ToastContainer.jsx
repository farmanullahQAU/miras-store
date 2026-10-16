import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext.jsx';

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'error'
            ? AlertCircle
            : toast.type === 'info'
            ? Info
            : CheckCircle2;
        const iconColor =
          toast.type === 'error'
            ? 'text-red-400'
            : toast.type === 'info'
            ? 'text-[#C59B5F]'
            : 'text-emerald-400';

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-center gap-3 bg-[#1C1917] text-[#FAF7F2] px-4 py-3.5 rounded-md shadow-xl border border-stone-700/80 transition-all duration-200"
          >
            <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
            <div className="flex-1 text-xs sm:text-sm leading-snug">{toast.message}</div>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick?.();
                  removeToast(toast.id);
                }}
                className="text-xs font-semibold uppercase tracking-wider text-[#C59B5F] hover:text-white underline underline-offset-4 shrink-0 cursor-pointer"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-stone-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
