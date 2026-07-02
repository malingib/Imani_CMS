import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="text-lg font-black text-slate-500 uppercase tracking-tight">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 rounded-2xl bg-yellow-500 px-8 py-3 text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-yellow-500/20 transition-all hover:bg-yellow-400"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
