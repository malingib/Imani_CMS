import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { ImaniLogoIcon } from '../Sidebar';

interface ErrorFallbackProps {
  error?: Error | null;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  fullPage?: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  title = 'Something went wrong',
  message,
  onRetry,
  onBack,
  fullPage = true,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10">
        <AlertCircle size={36} className="text-rose-400" />
      </div>
      <h2 className="text-3xl font-black text-brand-primary tracking-tight mb-2">{title}</h2>
      <p className="text-slate-400 font-medium max-w-md mb-8 leading-relaxed">
        {message || (error?.message || 'An unexpected error occurred. Please try again.')}
      </p>
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
          >
            <RefreshCw size={16} /> Try Again
          </button>
        )}
      </div>
    </div>
  );

  if (!fullPage) return <div className="p-12">{content}</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-12">
          {content}
        </div>
      </div>
      <p className="mt-12 text-[10px] text-slate-400 font-black uppercase tracking-widest">
        Imani CMS • Church Management System
      </p>
    </div>
  );
};

export default ErrorFallback;
