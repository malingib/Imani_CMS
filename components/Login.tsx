
import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Lock, Mail, ArrowRight, Loader2, 
  Sparkles, Eye, EyeOff, CheckCircle2, 
  Quote, Heart, Sunrise, User as UserIcon,
  Zap, AlertCircle
} from 'lucide-react';
import { User, UserRole, AppView } from '../types';
import { generateDailyVerse } from '../services/geminiService';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateLegal: (view: AppView) => void;
}

const FALLBACK_VERSES = [
  { text: "For I know the plans I have for you,” declares the Lord, “plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31" }
];

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateLegal }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // AI Verse State
  const [currentVerse, setCurrentVerse] = useState({ 
    text: FALLBACK_VERSES[0].text, 
    ref: FALLBACK_VERSES[0].ref
  });
  const [fade, setFade] = useState(true);
  const verseIntervalRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  const fetchAiVerse = async () => {
    // 1. Start fade out
    setFade(false);
    
    // 2. Wait for transition to complete before updating content (500ms)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const raw = await generateDailyVerse();
      if (raw) {
        const parts = raw.split('|');
        if (parts.length >= 2) {
          setCurrentVerse({
            text: parts[0].trim(),
            ref: parts[1].trim()
          });
        }
      } else {
        throw new Error('No data');
      }
    } catch (e) {
      const random = FALLBACK_VERSES[Math.floor(Math.random() * FALLBACK_VERSES.length)];
      setCurrentVerse(random);
    }
    
    // 3. Reset progress bar for the new cycle
    setProgress(0);
    // 4. Fade back in
    setFade(true);
  };

  useEffect(() => {
    // Initial fetch
    fetchAiVerse();
    
    // Setup interval for next verses
    verseIntervalRef.current = window.setInterval(fetchAiVerse, 15000);
    
    // Progress bar ticker (15000ms / 100ms = 150 ticks)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100; // Stay at 100 until fetch resets it
        return prev + (100 / (15000 / 100));
      });
    }, 100);

    return () => {
      if (verseIntervalRef.current) clearInterval(verseIntervalRef.current);
      clearInterval(progressInterval);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (email === 'admin@imani.org' && password === 'admin') {
        onLogin({
          id: 'u1',
          name: 'Pastor John',
          role: UserRole.ADMIN,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100'
        });
      } else if (email === 'pastor@imani.org' && password === 'pastor') {
        onLogin({
          id: 'u2',
          name: 'Pastor Mary',
          role: UserRole.PASTOR,
          avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100'
        });
      } else if (email === 'member@imani.org' && password === 'member') {
        onLogin({
          id: 'u3',
          name: 'David Ochieng',
          role: UserRole.MEMBER,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
          memberId: '1'
        });
      } else {
        setError('Invalid credentials. Please check your email and password.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-100 rounded-full blur-[120px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-[120px] opacity-40 animate-pulse"></div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl shadow-indigo-200/50 border border-slate-100 overflow-hidden relative z-10">
        
        {/* Left Side: Information & Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-indigo-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_2px_2px,_rgba(255,255,255,0.15)_1px,_transparent_0)] bg-[size:32px_32px]"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mb-6 border border-white/20 shadow-2xl">
              <Shield size={28} />
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-3">Imani CMS</h1>
            <p className="text-indigo-200 text-base font-medium leading-relaxed max-w-sm">
              Empowering ministry through Kenyan administrative excellence and AI-driven spiritual growth.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="p-6 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-2xl min-h-[180px] flex flex-col justify-center relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <Quote className="text-indigo-400 opacity-50" size={20} />
                <div className="flex items-center gap-2 px-2 py-0.5 bg-indigo-500/30 rounded-full border border-white/10">
                   <Zap size={8} className="text-amber-400 animate-pulse" />
                   <span className="text-[7px] font-black uppercase tracking-widest text-indigo-100">Live AI Word</span>
                </div>
              </div>

              <div className={`transition-all duration-500 transform ${fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
                <p className="text-lg font-bold italic mb-4 leading-tight tracking-tight text-white drop-shadow-md">
                  "{currentVerse.text}"
                </p>
                <div className="flex items-center gap-4">
                   <div className="h-px flex-1 bg-white/10"></div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                     — {currentVerse.ref}
                   </p>
                   <div className="h-px flex-1 bg-white/10"></div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 h-1 bg-indigo-500/20 w-full">
                 <div 
                   className="h-full bg-indigo-400 transition-all duration-100 linear" 
                   style={{ width: `${progress}%` }} 
                 />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-950 bg-slate-800 overflow-hidden shadow-lg">
                    <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                Serving 100k+ Believers
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-14 flex flex-col justify-center bg-white">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-950 rounded-2xl shadow-xl mb-3 text-white">
              <Shield size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Imani CMS</h2>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Sign In</h3>
            <p className="text-slate-500 mt-2 font-medium text-base">Enter your credentials to access the portal.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  placeholder="admin@imani.org"
                  className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-sm text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Password</label>
                <button type="button" className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">Recover Account</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-sm text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <div className={`w-4 h-4 rounded-md border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-indigo-600 border-indigo-600 shadow-sm' : 'bg-white border-slate-200'}`}>
                    {rememberMe && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Keep me signed in</span>
              </label>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 text-rose-600 rounded-xl text-[11px] font-bold border border-rose-100 flex items-center gap-2.5">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:grayscale"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Authenticating...
                </>
              ) : (
                <>
                  Login to Portal <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 flex flex-col items-center gap-5">
             <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                <Sparkles size={12} className="text-indigo-400" /> Instant Access Roles
             </div>
             <div className="grid grid-cols-3 gap-3 w-full">
                <button 
                  onClick={() => { setEmail('admin@imani.org'); setPassword('admin'); }}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                >
                  Admin
                </button>
                <button 
                  onClick={() => { setEmail('pastor@imani.org'); setPassword('pastor'); }}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                >
                  Pastor
                </button>
                <button 
                  onClick={() => { setEmail('member@imani.org'); setPassword('member'); }}
                  className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                >
                  Member
                </button>
             </div>
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full text-center px-4 space-x-6 z-10 hidden sm:block">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
          Powered by <a href="https://mobiwave.co.ke" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">Mobiwave Innovations</a>
        </span>
        <span className="text-slate-200 opacity-30">|</span>
        <button onClick={() => onNavigateLegal('PRIVACY')} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors">Privacy</button>
        <button onClick={() => onNavigateLegal('COMPLIANCE')} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors">Compliance</button>
        <button onClick={() => onNavigateLegal('SECURITY')} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors">Security</button>
      </div>
    </div>
  );
};

export default Login;
