
import React, { useState } from 'react';
import { 
  MessageSquare, Send, Mail, Phone, Search, 
  Filter, MoreHorizontal, Plus, Users, History,
  CheckCircle2, AlertCircle, Clock, ChevronRight,
  X, Trash2, Edit2, Layout, Calendar, Share2, 
  Smartphone, Eye, Zap, Repeat, Sparkles, Wand2,
  Save, Loader2, Copy, Bookmark
} from 'lucide-react';
import { CommunicationLog, Member, CommunicationTemplate } from '../types';
import { generateShortInspirationalSermon, generateDailyVerse } from '../services/geminiService';

interface CommunicationCenterProps {
  members: Member[];
  logs: CommunicationLog[];
  onSendBroadcast: (log: CommunicationLog) => void;
  currentUser: { name: string };
}

const CommunicationCenter: React.FC<CommunicationCenterProps> = ({ members, logs, onSendBroadcast, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'COMPOSE' | 'AUTOMATION' | 'TEMPLATES'>('LOGS');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageType, setMessageType] = useState<'SMS' | 'Email' | 'WhatsApp'>('SMS');
  const [broadcastTarget, setBroadcastTarget] = useState('All Members');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showLogDetails, setShowLogDetails] = useState<CommunicationLog | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Templates
  const templates: CommunicationTemplate[] = [
    { id: 't1', name: 'M-Pesa Tithe Receipt', content: 'Jambo {name}, we have received your Tithe of KES {amount}. May the Lord bless the work of your hands! Reference: {ref}. Imani Parish.', type: 'SMS' },
    { id: 't2', name: 'Sunday Service Invite', content: 'Blessed morning! We invite you to our Sunday Service at Main Sanctuary from 9:00 AM. Topic: "Walking in Faith". Karibu Sana!', type: 'WhatsApp' },
    { id: 't3', name: 'Bereavement Notice', content: 'Dear Church Family, we are saddened to announce the passing of {name}. Let us stand with the family in prayer. Viewing at {location} on {date}.', type: 'Email' },
    { id: 't4', name: 'Harambee Reminder', content: 'Reminder: Our Project Harambee is this Sunday. Let us come together to build the sanctuary. "God loves a cheerful giver."', type: 'SMS' }
  ];

  // Automation State
  const [autoVerseEnabled, setAutoVerseEnabled] = useState(true);
  const [verseFrequency, setVerseFrequency] = useState<'Daily' | 'Weekly'>('Daily');
  const [verseMode, setVerseMode] = useState<'Auto' | 'Manual'>('Auto');
  const [manualVerse, setManualVerse] = useState('');
  const [isGeneratingSermon, setIsGeneratingSermon] = useState(false);

  const handleSend = () => {
    if (!content) return;
    setIsSending(true);

    setTimeout(() => {
      const isScheduled = !!(scheduledDate && scheduledTime);
      const targetCount = members.length;
      
      const newLog: CommunicationLog = {
        id: Date.now().toString(),
        type: messageType,
        recipientCount: targetCount,
        targetGroupName: broadcastTarget,
        subject: subject || `${messageType} Broadcast`,
        content,
        date: new Date().toISOString().split('T')[0],
        scheduledFor: isScheduled ? `${scheduledDate} ${scheduledTime}` : undefined,
        status: isScheduled ? 'Scheduled' : 'Sent',
        sender: currentUser.name,
        deliveryBreakdown: isScheduled ? undefined : {
          delivered: targetCount,
          opened: Math.floor(targetCount * (messageType === 'Email' ? 0.35 : 0.85)),
          failed: 0
        }
      };

      onSendBroadcast(newLog);
      setIsSending(false);
      setActiveTab('LOGS');
      resetForm();
    }, 1500);
  };

  const useTemplate = (t: CommunicationTemplate) => {
    setContent(t.content);
    setMessageType(t.type);
    if (t.subject) setSubject(t.subject);
    setActiveTab('COMPOSE');
  };

  const handleGenerateAiSermon = async () => {
    setIsGeneratingSermon(true);
    try {
      const res = await generateShortInspirationalSermon('Strength in Unity');
      if (res) {
        setContent(res);
        setMessageType('WhatsApp');
        setActiveTab('COMPOSE');
      }
    } catch (e) {
      alert('Failed to reach AI Ministry Assistant.');
    } finally {
      setIsGeneratingSermon(false);
    }
  };

  const resetForm = () => {
    setContent('');
    setSubject('');
    setScheduledDate('');
    setScheduledTime('');
    setBroadcastTarget('All Members');
  };

  const filteredLogs = logs.filter(l => 
    l.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 overflow-x-hidden pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Outreach Center</h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-lg font-medium">AI-powered ministry outreach and engagement.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start lg:self-center overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: 'LOGS', label: 'History' },
            { id: 'COMPOSE', label: 'Composer' },
            { id: 'TEMPLATES', label: 'Templates', icon: Bookmark },
            { id: 'AUTOMATION', label: 'Automation', icon: Zap }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-indigo'}`}
            >
              {tab.icon && <tab.icon size={14}/>} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'AUTOMATION' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
           <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-indigo/10 text-brand-indigo rounded-2xl"><Sparkles size={24}/></div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800">Auto-Verse</h3>
                 </div>
                 <div className={`w-12 sm:w-14 h-6 sm:h-7 rounded-full p-1 cursor-pointer transition-all ${autoVerseEnabled ? 'bg-brand-primary' : 'bg-slate-200'}`} onClick={() => setAutoVerseEnabled(!autoVerseEnabled)}>
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-sm transition-all ${autoVerseEnabled ? 'translate-x-6 sm:translate-x-7' : 'translate-x-0'}`} />
                 </div>
              </div>
              
              <div className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Frequency</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none text-sm" value={verseFrequency} onChange={e => setVerseFrequency(e.target.value as any)}>
                          <option>Daily</option>
                          <option>Weekly</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Generation Mode</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none text-sm" value={verseMode} onChange={e => setVerseMode(e.target.value as any)}>
                          <option>Auto (Gemini AI)</option>
                          <option>Manual Entry</option>
                       </select>
                    </div>
                 </div>

                 {verseMode === 'Manual' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Static Verse Queue</label>
                       <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold resize-none outline-none focus:ring-2 focus:ring-brand-primary" rows={3} placeholder="Paste verse and reference..." value={manualVerse} onChange={e => setManualVerse(e.target.value)} />
                    </div>
                 )}

                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest text-center sm:text-left">Selected Channels</p>
                    <div className="flex flex-wrap gap-2">
                       {['SMS', 'WhatsApp', 'Email'].map(channel => (
                          <div key={channel} className="flex-1 min-w-[80px] p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-center gap-2 shadow-sm">
                             <input type="checkbox" defaultChecked className="accent-brand-primary h-4 w-4" />
                             <span className="text-[10px] font-black text-slate-600 uppercase">{channel}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
              <button className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black shadow-lg hover:bg-brand-primary-700 transition-all flex items-center justify-center gap-2">
                 <Save size={18}/> Update Automation
              </button>
           </div>

           <div className="space-y-6 sm:space-y-8">
              <div className="bg-brand-primary p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10 space-y-5">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-white/10 rounded-2xl text-brand-gold"><Wand2 size={24}/></div>
                       <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">AI Sermonette</h3>
                    </div>
                    <p className="text-indigo-100 text-sm font-medium opacity-80 leading-relaxed">Generate high-impact, 100-word inspirational messages for WhatsApp or Email bulletins.</p>
                    <button 
                       onClick={handleGenerateAiSermon}
                       disabled={isGeneratingSermon}
                       className="w-full py-4 bg-white text-brand-primary rounded-xl sm:rounded-2xl font-black shadow-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {isGeneratingSermon ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                       {isGeneratingSermon ? 'Synthesizing...' : 'Draft with Gemini'}
                    </button>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-indigo rounded-full blur-[60px] opacity-20 group-hover:scale-125 transition-transform"></div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                 <h4 className="text-lg font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight"><Clock size={20} className="text-brand-indigo"/> Pending Dispatches</h4>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all">
                       <div className="flex items-center gap-3">
                          <Zap size={16} className="text-brand-indigo"/>
                          <span className="text-xs font-bold text-slate-700">Daily Verse</span>
                       </div>
                       <span className="text-[9px] font-black uppercase text-brand-indigo">Today, 06:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all">
                       <div className="flex items-center gap-3">
                          <MessageSquare size={16} className="text-brand-indigo"/>
                          <span className="text-xs font-bold text-slate-700">Youth Bulletin</span>
                       </div>
                       <span className="text-[9px] font-black uppercase text-slate-400">Wed, 09:00 PM</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-10 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 gap-6">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight">Broadcast History</h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search logs..." 
                className="w-full pl-12 pr-6 py-3 bg-white rounded-xl sm:rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-indigo outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="divide-y divide-slate-50 overflow-x-auto">
            {filteredLogs.length > 0 ? filteredLogs.map(log => (
              <div key={log.id} className="p-6 sm:p-8 hover:bg-slate-50 transition-all flex items-center justify-between gap-6 min-w-[600px] lg:min-w-0">
                <div className="flex items-start gap-4 sm:gap-6 flex-1">
                  <div className={`p-3 sm:p-4 rounded-xl sm:rounded-[1.5rem] shadow-sm flex-shrink-0 ${
                    log.type === 'SMS' ? 'bg-brand-indigo/10 text-brand-indigo' : 
                    log.type === 'Email' ? 'bg-brand-gold/10 text-brand-gold' : 
                    'bg-brand-emerald/10 text-brand-emerald'
                  }`}>
                    {log.type === 'SMS' ? <Smartphone size={24}/> : log.type === 'Email' ? <Mail size={24}/> : <Share2 size={24}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-black text-slate-800 text-sm sm:text-lg truncate">{log.subject}</h4>
                      <span className="text-[8px] sm:text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{log.type}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-2 font-medium">"{log.content}"</p>
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-tighter text-slate-400">
                      <span className="flex items-center gap-1"><Users size={12}/> {log.recipientCount}</span>
                      <span>{log.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${
                    log.status === 'Sent' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-gold/10 text-brand-gold'
                  }`}>
                    {log.status}
                  </span>
                  <button onClick={() => setShowLogDetails(log)} className="p-3 text-brand-indigo hover:bg-brand-indigo/10 rounded-xl transition-all"><ChevronRight size={20}/></button>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center space-y-4">
                 <History size={48} className="mx-auto text-slate-200" />
                 <p className="font-bold text-slate-400">No broadcasts recorded.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'TEMPLATES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-in slide-in-from-bottom-4 duration-500">
          {templates.map(t => (
            <div key={t.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all h-full">
               <div className="mb-8">
                  <div className="flex justify-between items-start mb-6">
                     <div className={`p-3 rounded-2xl ${t.type === 'SMS' ? 'bg-brand-indigo/10 text-brand-indigo' : t.type === 'Email' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-brand-emerald/10 text-brand-emerald'}`}>
                        {t.type === 'SMS' ? <Smartphone size={20}/> : t.type === 'Email' ? <Mail size={20}/> : <Share2 size={20}/>}
                     </div>
                     <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-300">Enterprise Standard</span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-black text-slate-800 mb-4">{t.name}</h4>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed italic font-medium">"{t.content}"</p>
               </div>
               <button 
                  onClick={() => useTemplate(t)}
                  className="w-full py-4 bg-slate-50 text-brand-primary rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2"
               >
                  <Copy size={14}/> Load Content
               </button>
            </div>
          ))}
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-200 shadow-inner"><Plus size={24}/></div>
             <p className="text-xs sm:text-sm font-bold text-slate-400">Save your custom messages as templates for the whole team.</p>
          </div>
        </div>
      )}

      {activeTab === 'COMPOSE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 bg-white p-6 sm:p-10 lg:p-12 rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Channel</label>
                <div className="flex gap-2">
                  {(['SMS', 'Email', 'WhatsApp'] as const).map(t => (
                    <button key={t} onClick={() => setMessageType(t)} className={`flex-1 py-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] transition-all border-2 ${messageType === t ? 'bg-brand-primary text-white border-brand-primary shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-50 hover:bg-slate-100'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Audience Target</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-[1.5rem] font-black text-xs text-slate-700 outline-none focus:ring-2 focus:ring-brand-indigo cursor-pointer shadow-inner" value={broadcastTarget} onChange={(e) => setBroadcastTarget(e.target.value)}>
                   <option>All Members</option>
                   <option>Youth Fellowship</option>
                   <option>Women of Grace</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {messageType === 'Email' && (
                <input type="text" placeholder="Email Subject Header" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl font-black text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand-indigo shadow-inner" value={subject} onChange={(e) => setSubject(e.target.value)} />
              )}
              <textarea rows={8} placeholder="Draft your spiritual message here..." className="w-full p-6 sm:p-8 bg-slate-50 border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] font-bold text-sm sm:text-base text-slate-700 outline-none focus:ring-2 focus:ring-brand-indigo shadow-inner" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
               <button onClick={resetForm} className="w-full sm:w-auto px-10 py-5 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] hover:bg-slate-100 transition-all order-2 sm:order-1">Clear Draft</button>
               <button onClick={handleSend} disabled={!content || isSending} className="flex-1 py-5 bg-brand-primary text-white rounded-xl sm:rounded-[1.5rem] font-black text-sm sm:text-lg shadow-2xl hover:bg-brand-primary-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 order-1 sm:order-2">
                 {isSending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />} 
                 {isSending ? 'Dispatching...' : `Fire ${messageType} Blast`}
               </button>
            </div>
          </div>
          
          <div className="space-y-6 sm:space-y-8">
             <div className="bg-brand-primary p-8 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                   <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-300">Quick Tags</h4>
                   <p className="text-xs sm:text-sm font-medium leading-relaxed">Map variables automatically: <code className="bg-white/10 px-1.5 rounded">{'{name}'}</code> or <code className="bg-white/10 px-1.5 rounded">{'{amount}'}</code> for bulk personalization.</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl opacity-20"></div>
             </div>
             
             <div className="bg-white p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400 text-center sm:text-left">Credits Integrity</h4>
                <div className="flex items-center justify-between">
                   <p className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">4,280</p>
                   <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl"><Zap size={20}/></div>
                </div>
                <button className="w-full py-4 bg-slate-50 text-brand-indigo rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all">Top Up Balance</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationCenter;
