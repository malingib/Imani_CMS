
import React, { useState, useEffect } from 'react';
import { 
  Lock, Mail, ArrowRight, Loader2, 
  Eye, EyeOff, Quote, AlertCircle, 
  ArrowLeft, CheckCircle2, Globe
} from 'lucide-react';
import { User as UserType, AppView } from '../types';
import { generateDailyVerse } from '../services/geminiService';
import { ImaniLogoIcon } from './Sidebar';
import { useAuth } from '../src/lib/supabase-auth';
import { mapSupabaseUserToAppUser } from '../src/lib/app-user';
import { LoginFormSchema, PasswordResetSchema, validateFormData } from '../src/lib/validation';

interface LoginProps {
  onLogin: (user: UserType) => void;
  onNavigateLegal: (view: AppView) => void;
}

type AuthMode = 'LOGIN' | 'RESET';

const FALLBACK_VERSES = [
  { text: "For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31" }
];

const VERSE_INTERVAL = 30000; 

const ImaniBrandingLogo = () => (
  <div className="flex flex-col items-center justify-center space-y-5">
    <div className="w-36 h-36 xl:w-44 xl:h-44 drop-shadow-xl">
      <ImaniLogoIcon />
    </div>
    <div className="text-center">
      <h1 className="text-white text-5xl xl:text-6xl font-black tracking-[0.16em] leading-none mb-2">IMANI</h1>
      <p className="text-white text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Church Management System</p>
    </div>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateLegal }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, requestPasswordReset } = useAuth();
  
  const [currentVerse, setCurrentVerse] = useState({ 
    text: FALLBACK_VERSES[0].text, 
    ref: FALLBACK_VERSES[0].ref
  });
  const [fade, setFade] = useState(true);
  const [progress, setProgress] = useState(0);

  const fetchAiVerse = async () => {
    setFade(false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const raw = await generateDailyVerse();
      if (raw) {
        const parts = raw.split('|');
        if (parts.length >= 2) {
          setCurrentVerse({ text: parts[0].trim(), ref: parts[1].trim() });
        }
      } else throw new Error();
    } catch (e) {
      setCurrentVerse(FALLBACK_VERSES[Math.floor(Math.random() * FALLBACK_VERSES.length)]);
    }
    setProgress(0);
    setFade(true);
  };

  useEffect(() => {
    fetchAiVerse();
    const vInterval = setInterval(fetchAiVerse, VERSE_INTERVAL);
    const pInterval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 100 : prev + (100 / (VERSE_INTERVAL / 100))));
    }, 100);
    return () => { clearInterval(vInterval); clearInterval(pInterval); };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate form data
    const { data, errors } = validateFormData(LoginFormSchema, { email, password });
    if (!data) {
      setError(Object.values(errors)[0] || 'Invalid input');
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await login(email, password);
      onLogin(mapSupabaseUserToAppUser(result.user));
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate email
    const { data, errors } = validateFormData(PasswordResetSchema, { email });
    if (!data) {
      setError(Object.values(errors)[0] || 'Invalid email');
      setIsLoading(false);
      return;
    }
    
    try {
      await requestPasswordReset(email);
      setSuccess(`Password reset instructions have been sent to ${email}`);
    } catch (err: any) {
      setError(err?.message || 'Unable to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] min-h-0 overflow-hidden flex flex-col items-center bg-slate-50 p-3 sm:p-4 font-sans">
      <div className="w-full max-w-6xl flex-1 min-h-0 grid lg:grid-cols-2 bg-white rounded-2xl lg:rounded-3xl shadow-xl overflow-hidden">
        
        {/* Left Side: Solid Warm Navy Panel (Desktop Only) */}
        <div className="hidden lg:flex flex-col items-center justify-center p-7 xl:p-10 bg-brand-primary relative overflow-hidden grid-pattern">
          <ImaniBrandingLogo />
          
          <div className="mt-7 xl:mt-9 w-full max-w-md relative z-10">
            <div className={`p-5 xl:p-6 bg-white/5 rounded-2xl border border-white/10 transition-all duration-1000 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Quote className="text-brand-gold mb-3 opacity-60" size={24} />
              <p className="text-white text-lg font-bold italic leading-relaxed mb-4">"{currentVerse.text}"</p>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">— {currentVerse.ref}</p>
              <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand-gold transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
          
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-brand-gold/5 rounded-full blur-[100px]"></div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="min-h-0 overflow-y-auto p-5 sm:p-8 lg:p-9 xl:p-11 flex flex-col justify-center bg-white relative">
          
          {/* Mobile Logo Section */}
          <div className="lg:hidden flex flex-col items-center mb-5 sm:mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 drop-shadow-md">
                <ImaniLogoIcon />
             </div>
             <h2 className="text-xl sm:text-2xl font-black text-brand-primary tracking-widest">IMANI CMS</h2>
             <div className="w-12 h-1 bg-brand-gold rounded-full mt-2"></div>
          </div>

          {mode === 'RESET' && (
            <button 
              onClick={() => { setMode('LOGIN'); setSuccess(''); setError(''); }}
              className="absolute top-8 left-8 lg:top-12 lg:left-12 flex items-center gap-2 text-slate-400 hover:text-brand-indigo font-bold transition-all text-sm"
            >
              <ArrowLeft size={18} /> Back to Sign In
            </button>
          )}

          <div className="mb-5 sm:mb-6 text-center lg:text-left">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-primary tracking-tight uppercase">
              {mode === 'LOGIN' ? 'Sign In' : 'Reset Password'}
            </h3>
            <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base leading-relaxed">
              {mode === 'LOGIN' ? 'Sign in with the account created by your church administrator.' : 'Enter your registered email to receive recovery instructions.'}
            </p>
          </div>

          {success ? (
            <div role="status" className="p-8 bg-brand-emerald/10 rounded-[2rem] border border-brand-emerald/20 text-center space-y-4 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-brand-emerald/20 text-brand-emerald rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-xl font-black text-brand-primary tracking-tight">Success</h4>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">{success}</p>
              <button 
                onClick={() => { setMode('LOGIN'); setSuccess(''); }}
                className="w-full py-4 bg-brand-primary text-white rounded-full font-black text-sm hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/10"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={mode === 'LOGIN' ? handleLogin : handleReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="e.g. pastor@imani.org"
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-brand-primary focus:ring-2 focus:ring-brand-indigo outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {mode !== 'RESET' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-brand-primary focus:ring-2 focus:ring-brand-indigo outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-indigo transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'LOGIN' && (
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setMode('RESET')}
                    className="text-xs font-black text-brand-indigo uppercase tracking-widest hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {error && (
                <div role="alert" className="p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2 animate-in shake-in duration-300">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 sm:py-4 bg-brand-primary text-white rounded-full font-black text-base sm:text-lg shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {mode === 'LOGIN' ? 'Sign In to Portal' : 'Send Recovery Email'}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}


          {mode === 'LOGIN' && (
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center">
              <p className="text-[11px] text-slate-400 font-black tracking-tight opacity-80 uppercase">
                Imani CMS • Church Management System
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Outside Card Footer - Optimized Centering */}
      <div className="w-full max-w-6xl shrink-0 py-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 px-2 text-center">
        <div className="flex items-center gap-3 text-slate-400 justify-center text-center">
           <Globe size={16} className="shrink-0" />
           <p className="text-sm font-bold">
             Powered by <a href="#" className="text-brand-indigo hover:underline font-black">Mobiwave Innovations</a>
           </p>
        </div>
        
        <div className="flex items-center justify-center gap-4 sm:gap-6">
           <button 
             onClick={() => onNavigateLegal('PRIVACY')} 
             className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors whitespace-nowrap"
           >
             Privacy Policy
           </button>
           <button 
             onClick={() => onNavigateLegal('COMPLIANCE')} 
             className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors whitespace-nowrap"
           >
             Compliance
           </button>
           <button 
             onClick={() => onNavigateLegal('SECURITY')} 
             className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors whitespace-nowrap"
           >
             Security
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
