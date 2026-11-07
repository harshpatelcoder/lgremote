import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-rose-950/95 border-rose-800 text-rose-200 shadow-rose-900/40';
      case 'success':
        return 'bg-emerald-950/95 border-emerald-800 text-emerald-200 shadow-emerald-900/40';
      case 'info':
      default:
        return 'bg-dark-card/95 border-brand-primary/50 text-gray-200 shadow-brand-glow';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-brand-secondary shrink-0" />;
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md shadow-lg text-xs animate-in fade-in slide-in-from-bottom duration-150 w-full ${getStyle()}`}
    >
      <div className="flex items-center gap-2 truncate">
        {getIcon()}
        <span className="truncate">{toast.text}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg text-gray-400 hover:text-white shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
