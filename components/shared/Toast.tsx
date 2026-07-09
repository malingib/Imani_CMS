import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import type { Toast as ToastType } from '../../types';

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss?: (id: string) => void;
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'bg-brand-primary border-slate-700 text-white shadow-lg shadow-brand-primary/20',
  error: 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/30',
  info: 'bg-brand-indigo border-brand-indigo-600 text-white shadow-lg shadow-brand-indigo/20',
};

const ToastCard: React.FC<{ toast: ToastType; onDismiss?: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss?.(toast.id), 300);
  };

  useEffect(() => {
    const timer = setTimeout(handleDismiss, 4000);
    return () => clearTimeout(timer);
  }, []);

  const Icon = icons[toast.type] || Info;

  return (
    <div
      className={`pointer-events-auto w-full max-w-md px-5 py-4 rounded-2xl border flex items-start gap-3 transition-all duration-300 ${
        styles[toast.type] || styles.info
      } ${visible && !exiting ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-bold leading-snug">{toast.message}</p>
      {onDismiss && (
        <button onClick={handleDismiss} className="shrink-0 p-0.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center pt-20 pointer-events-none z-[500]">
      <div className="flex flex-col items-center gap-3 w-full max-w-md">
        {toasts.map(t => (
          <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
};

export { ToastCard };
export default ToastContainer;
