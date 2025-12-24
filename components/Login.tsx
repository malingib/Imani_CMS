
import React, { useState, useEffect } from 'react';
import { 
  Lock, Mail, ArrowRight, Loader2, 
  Eye, EyeOff, Quote, AlertCircle, 
  ArrowLeft, CheckCircle2, User, Globe
} from 'lucide-react';
import { User as UserType, UserRole, AppView } from '../types';
import { generateDailyVerse } from '../services/geminiService';
import { ImaniLogoIcon } from './Sidebar';

interface LoginProps {
  onLogin: (user: UserType) => void;
  onNavigateLegal: (view: AppView) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'RESET';

const FALLBACK_VERSES = [
  { text: "For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31" }
];

const VERSE_INTERVAL = 30000; // Increased to 30 seconds for better readability

const ImaniBrandingLogo = () => (
  <div className="flex flex-col items-center justify-center space-y-8">
    <div className="w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl">
      <ImaniLogoIcon />
    </div>
    <div className="text-center">
      <h1 className="text-white text-6xl md:text-8xl font-black tracking-[0.2em] leading-none mb-2">IMANI</h1>
      <p className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.4em] opacity-60">Church Management System</p>
    </div>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateLegal }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [currentVerse, setCurrentVerse] = useState({ 
    text: FALLBACK_VERSES[0].text, 
    ref: FALLBACK_VERSES[0].ref
  });
  const [fade, setFade] = useState(true);
  const [progress, setProgress] = useState(0);

  const fetchAiVerse = async () => {
    setFade(false);
    // Longer delay for fade out
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      if (email === 'admin@imani.org' && password === 'admin') {
        onLogin({ id: 'u1', name: 'Pastor John', role: UserRole.ADMIN, avatar: 'https://i.pravatar.cc/100?img=12' });
      } else if (email === 'pastor@imani.org' && password === 'pastor') {
        onLogin({ id: 'u2', name: 'Pastor Mary', role: UserRole.PASTOR, avatar: 'https://i.pravatar.cc/100?img=32' });
      } else if (email === 'member@imani.org' && password === 'member') {
        onLogin({ id: 'u3', name: 'David Ochieng', role: UserRole.MEMBER, avatar: 'https://i.pravatar.cc/100?img=15', memberId: '1' });
      } else {
        setError('Invalid credentials. Use simulation accounts for testing.');
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setSuccess('Your registration request has been sent to the church admin for approval.');
      setIsLoading(false);
    }, 2000);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      setSuccess(`Password reset instructions have been sent to ${email}`);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl overflow-hidden min-h-[700px]">
        
        {/* Left Side: Solid Warm Navy Panel (Desktop Only) */}
        <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-brand-primary relative overflow-hidden grid-pattern">
          <ImaniBrandingLogo />
          
          <div className="mt-16 w-full max-w-md relative z-10">
            <div className={`p-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 transition-all duration-1000 ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
        <div className="p-8 sm:p-14 lg:p-16 flex flex-col justify-center bg-white relative">
          
          {/* Mobile Logo Section */}
          <div className="lg:hidden flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="w-20 h-20 mb-4 drop-shadow-lg">
                <ImaniLogoIcon />
             </div>
             <h2 className="text-2xl font-black text-brand-primary tracking-widest">IMANI CMS</h2>
             <div className="w-12 h-1 bg-brand-gold rounded-full mt-2"></div>
          </div>

          {mode !== 'LOGIN' && (
            <button 
              onClick={() => { setMode('LOGIN'); setSuccess(''); setError(''); }}
              className="absolute top-8 left-8 lg:top-12 lg:left-12 flex items-center gap-2 text-slate-400 hover:text-brand-primary font-bold transition-all text-sm"
            >
              <ArrowLeft size={18} /> Back to Sign In
            </button>
          )}

          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-3xl lg:text-4xl font-black text-brand-primary tracking-tight uppercase">
              {mode === 'LOGIN' ? 'Portal Sign In' : mode === 'SIGNUP' ? 'Create Account' : 'Reset Password'}
            </h3>
            <p className="text-slate-500 mt-3 font-medium text-lg leading-relaxed">
              {mode === 'LOGIN' ? 'Secure access to your church ministry dashboard.' : 
               mode === 'SIGNUP' ? 'Join the Imani ministry administration network.' : 
               'Enter your email to receive recovery instructions.'}
            </p>
          </div>

          {success ? (
            <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 text-center space-y-4 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-xl font-black text-brand-primary tracking-tight">Success</h4>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">{success}</p>
              <button 
                onClick={() => { setMode('LOGIN'); setSuccess(''); }}
                className="w-full py-4 bg-brand-primary text-white rounded-full font-black text-sm hover:bg-brand-primary-700 transition-all shadow-lg shadow-brand-primary/10"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={mode === 'LOGIN' ? handleLogin : mode === 'SIGNUP' ? handleSignUp : handleReset} className="space-y-5">
              {mode === 'SIGNUP' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Kamau"
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-brand-primary focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="e.g. pastor@imani.org"
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-brand-primary focus:ring-2 focus:ring-brand-primary outline-none transition-all"
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
                      className="w-full pl-14 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-brand-primary focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-primary transition-colors">
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
                    className="text-xs font-black text-brand-primary uppercase tracking-widest hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {error && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2 animate-in shake-in duration-300">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-brand-primary text-white rounded-full font-black text-lg shadow-xl shadow-brand-primary/20 hover:bg-brand-primary-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (
                  <>
                    {mode === 'LOGIN' ? 'Sign In to Portal' : mode === 'SIGNUP' ? 'Create Account' : 'Send Recovery Email'}
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {mode === 'LOGIN' && (
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400 font-medium">
                New to Imani? <button onClick={() => setMode('SIGNUP')} className="text-brand-primary font-black hover:underline ml-1">Create an Account</button>
              </p>
            </div>
          )}

          {mode === 'LOGIN' && (
            <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center">
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.25em] mb-6">Simulation Accounts</p>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <button 
                  onClick={() => { setEmail('admin@imani.org'); setPassword('admin'); }} 
                  className="px-10 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-black text-brand-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm"
                >
                  Admin
                </button>
                <button 
                  onClick={() => { setEmail('pastor@imani.org'); setPassword('pastor'); }} 
                  className="px-10 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-black text-brand-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm"
                >
                  Pastor
                </button>
                <button 
                  onClick={() => { setEmail('member@imani.org'); setPassword('member'); }} 
                  className="px-10 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-black text-brand-primary hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm"
                >
                  Member
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-black tracking-tight opacity-80 uppercase">
                Imani CMS • Built for Kenyan Ministry Excellence
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Outside Card Footer */}
      <div className="w-full max-w-6xl mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-3 text-slate-400">
           <Globe size={16} />
           <p className="text-sm font-bold">
             Powered by <a href="#" className="text-brand-primary hover:underline font-black">Mobiwave Innovations</a>
           </p>
        </div>
        
        <div className="flex items-center gap-6">
           <button 
             onClick={() => onNavigateLegal('PRIVACY')} 
             className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors"
           >
             Privacy Policy
           </button>
           <button 
             onClick={() => onNavigateLegal('COMPLIANCE')} 
             className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors"
           >
             Compliance
           </button>
           <button 
             onClick={() => onNavigateLegal('SECURITY')} 
             className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors"
           >
             Security
           </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
