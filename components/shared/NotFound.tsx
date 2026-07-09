import React from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { ImaniLogoIcon } from '../Sidebar';

interface NotFoundProps {
  onHome?: () => void;
  onBack?: () => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onHome, onBack }) => {
  const goHome = onHome || (() => window.location.href = '/');
  const goBack = onBack || (() => window.history.back());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-12 text-center">
          <div className="w-24 h-24 bg-brand-primary rounded-[3rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-primary/20">
            <span className="text-5xl font-black text-white tracking-tight">404</span>
          </div>
          <h1 className="text-3xl font-black text-brand-primary tracking-tight mb-2">Page not found</h1>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Check the URL or head back.
          </p>
          <div className="flex items-center justify-center gap-3">
            {onBack && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                <ArrowLeft size={16} /> Go Back
              </button>
            )}
            <button
              onClick={goHome}
              className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
            >
              <Home size={16} /> Home
            </button>
          </div>
        </div>
      </div>
      <div className="mt-12 flex items-center gap-3 text-slate-400">
        <ImaniLogoIcon />
        <p className="text-[10px] font-black uppercase tracking-widest">Imani CMS</p>
      </div>
    </div>
  );
};

export default NotFound;
