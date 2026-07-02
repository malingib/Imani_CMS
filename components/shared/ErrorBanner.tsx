import React from 'react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const typeStyles = {
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  info: 'bg-blue-50 border-blue-200 text-blue-700',
};

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss, type = 'error' }) => {
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm font-bold ${typeStyles[type]}`}>
      <span className="flex-1 leading-snug">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:opacity-100">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
