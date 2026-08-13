import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const { id, title, description, type = 'success', duration = 4000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  return (
    <div className="flex items-start gap-3 bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-blue-900/10 dark:shadow-black/60 max-w-sm w-full animate-slide-up font-sans text-xs transition-all">
      {type === 'success' && (
        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
      )}
      {type === 'error' && (
        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
      )}
      {type === 'info' && (
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
      )}

      <div className="flex-1 overflow-hidden">
        <h4 className="font-bold text-slate-900 dark:text-white font-display text-xs">{title}</h4>
        {description && (
          <p className="text-slate-600 dark:text-slate-400 text-[11px] truncate mt-0.5 font-mono">{description}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded-lg transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-auto">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
