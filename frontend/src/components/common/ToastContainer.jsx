import React from 'react';
import { useCrisis } from '../../context/CrisisContext';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useCrisis();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let border = 'border-[#C6A66B]/60 bg-[#0C1527]/95 text-[#F2E8D9] shadow-[#C6A66B]/10';
        let Icon = Info;
        if (toast.type === 'success') {
          border = 'border-emerald-500/60 bg-[#0C1527]/95 text-emerald-200';
          Icon = CheckCircle;
        } else if (toast.type === 'error') {
          border = 'border-red-500/60 bg-[#0C1527]/95 text-red-200';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md ${border} transition-all duration-300 animate-slide-up`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#C6A66B]" />
            <div className="flex-1 text-xs font-medium leading-relaxed text-white">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
