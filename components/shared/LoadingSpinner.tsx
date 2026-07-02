import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

const sizeMap = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-4', lg: 'h-12 w-12 border-4' };

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '', message }) => {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className={`${sizeMap[size]} animate-spin rounded-full border-slate-200 border-t-brand-primary`} />
      {message && <p className="text-sm text-slate-400">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
