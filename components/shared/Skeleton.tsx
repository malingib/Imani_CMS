import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

const variantClasses = {
  text: 'h-4 rounded-2xl',
  circular: 'rounded-full',
  rectangular: 'rounded-2xl',
  card: 'rounded-[2.5rem] h-48',
};

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'text', width, height, count = 1 }) => {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-slate-200 ${variantClasses[variant]} ${className}`}
          style={{ width, height }}
        />
      ))}
    </>
  );
};

export const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    <Skeleton variant="card" />
    <div className="space-y-3">
      <Skeleton width="60%" />
      <Skeleton count={2} />
      <Skeleton width="40%" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width={`${70 - i * 8}%`} />
          <Skeleton width={`${50 - i * 5}%`} />
        </div>
        <Skeleton width={80} />
      </div>
    ))}
  </div>
);

export default Skeleton;
