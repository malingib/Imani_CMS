import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { supabase } from '../src/lib/supabase';
import { AcceptInviteFormSchema, validateFormData } from '../src/lib/validation';
import { ImaniLogoIcon } from './Sidebar';
import { UserRole } from '../types';
import { getDefaultViewForUserRole } from '../src/lib/app-user';
import { ROUTES } from '../src/lib/router';

const AcceptInvite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-12 max-w-md w-full text-center">
          <AlertCircle size={48} className="mx-auto text-rose-400 mb-4" />
          <h1 className="text-2xl font-black text-brand-primary mb-2">Invalid Link</h1>
          <p className="text-slate-500 font-medium">This invitation link is missing a token. Check the link you received or request a new invitation.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { data, errors } = validateFormData(AcceptInviteFormSchema, { name, password, confirmPassword });
    if (!data) {
      setError(Object.values(errors)[0] || 'Invalid input');
      setIsLoading(false);
      return;
    }

    try {
      const { data: claimData, error: claimError } = await supabase.functions.invoke('invite-claim', {
        body: { token, password: data.password, name: data.name },
      });

      if (claimError) throw new Error(claimError.message);
      if (!claimData || claimData.success !== true) {
        throw new Error(claimData?.error || 'Failed to accept invitation');
      }

      const signInResult = await supabase.auth.signInWithPassword({
        email: claimData.email,
        password: data.password,
      });

      if (signInResult.error) throw new Error(signInResult.error.message);

      setStep('success');
      const role = (claimData?.role as UserRole) || UserRole.MEMBER;
      const targetPath = ROUTES[getDefaultViewForUserRole(role)].path;
      setTimeout(() => navigate(targetPath, { replace: true }), 2000);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-12 max-w-md w-full text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-brand-emerald/20 text-brand-emerald rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-black text-brand-primary mb-2">Welcome!</h1>
          <p className="text-slate-500 font-medium">Your account is set up. Redirecting you now...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 mb-4">
              <ImaniLogoIcon />
            </div>
            <h1 className="text-2xl font-black text-brand-primary tracking-tight uppercase text-center">Accept Invitation</h1>
            <p className="text-slate-500 font-medium mt-2 text-center text-sm">
              Set your password to join the church
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-rose-700 text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Kamau"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-brand-primary focus:ring-2 focus:ring-brand-indigo outline-none transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 8 characters"
                  className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-brand-primary focus:ring-2 focus:ring-brand-indigo outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-brand-primary focus:ring-2 focus:ring-brand-indigo outline-none transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowRight size={18} />
              )}
              {isLoading ? 'Setting up...' : 'Accept & Sign In'}
            </button>

            <p className="text-center text-[10px] text-slate-400 font-bold mt-6">
              <Mail size={12} className="inline mr-1" />
              The invitation was sent to the email your admin invited
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
