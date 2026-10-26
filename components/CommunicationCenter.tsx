
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

interface CommunicationCenterProps {
  members: Member[];
  logs: CommunicationLog[];
  onSendBroadcast: (log: CommunicationLog) => void;
  currentUser: { name: string };
  addToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  smsCredits?: number;
}

const CommunicationCenter: React.FC<CommunicationCenterProps> = ({ members, logs, onSendBroadcast, currentUser, addToast, smsCredits }) => {
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

  const handleSend = () => {
    if (!content.trim()) {
      addToast?.('Enter a message before sending.', 'error');
      return;
    }
    // This UI has no configured delivery adapter. Never fabricate a sent log,
    // delivery counts, opens, or a scheduled job. Keep the user's draft intact.
    addToast?.('Message not sent: no SMS, email, or WhatsApp delivery provider is configured for this workflow. Your draft has been kept.', 'error');
  };

  const useTemplate = (t: CommunicationTemplate) => {
    setContent(t.content);
    setMessageType(t.type);
    if (t.subject) setSubject(t.subject);
    setActiveTab('COMPOSE');
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
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Communication</h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-lg font-medium">Send SMS, email, and WhatsApp messages to members.</p>
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
              className={`px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-brand-indigo'}`}
            >
              {tab.icon && <tab.icon size={14}/>} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'AUTOMATION' && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-900">Message automation</h3>
          <p className="text-sm leading-6 text-slate-600">Automated scheduling and message delivery are not connected. No messages will be dispatched from this screen. Draft and review messages in Compose, or contact your platform administrator to configure a supported delivery provider.</p>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Automation is unavailable until a server-side scheduler and delivery provider are configured.</div>
        </section>
      )}

      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 gap-6">
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
              <div key={log.id} className="p-6 sm:p-5 hover:bg-slate-50 transition-all flex items-center justify-between gap-6 min-w-[600px] lg:min-w-0">
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
            <div key={t.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-sm transition-all h-full">
               <div className="mb-8">
                  <div className="flex justify-between items-start mb-6">
                     <div className={`p-3 rounded-2xl ${t.type === 'SMS' ? 'bg-brand-indigo/10 text-brand-indigo' : t.type === 'Email' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-brand-emerald/10 text-brand-emerald'}`}>
                        {t.type === 'SMS' ? <Smartphone size={20}/> : t.type === 'Email' ? <Mail size={20}/> : <Share2 size={20}/>}
                     </div>
                     <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-300">Standard</span>
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
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-5 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-200 shadow-inner"><Plus size={24}/></div>
             <p className="text-xs sm:text-sm font-bold text-slate-400">Save your custom messages as templates for the whole team.</p>
          </div>
        </div>
      )}

      {activeTab === 'COMPOSE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 bg-white p-6 sm:p-6 lg:p-6 rounded-xl lg:rounded-xl border border-slate-100 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Channel</label>
                <div className="flex gap-2">
                  {(['SMS', 'Email', 'WhatsApp'] as const).map(t => (
                    <button key={t} onClick={() => setMessageType(t)} className={`flex-1 py-3 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] transition-all border-2 ${messageType === t ? 'bg-brand-primary text-white border-brand-primary shadow-sm' : 'bg-slate-50 text-slate-400 border-slate-50 hover:bg-slate-100'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Recipients</label>
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
              <textarea rows={8} placeholder="Type your message here..." className="w-full p-6 sm:p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] sm:rounded-xl font-bold text-sm sm:text-base text-slate-700 outline-none focus:ring-2 focus:ring-brand-indigo shadow-inner" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
               <button onClick={resetForm} className="w-full sm:w-auto px-10 py-5 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] hover:bg-slate-100 transition-all order-2 sm:order-1">Clear Draft</button>
               <button onClick={handleSend} disabled={!content || isSending} className="flex-1 py-5 bg-brand-primary text-white rounded-xl sm:rounded-[1.5rem] font-black text-sm sm:text-lg shadow-sm hover:bg-brand-primary-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 order-1 sm:order-2">
                 {isSending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />} 
                 {isSending ? 'Dispatching...' : `Send ${messageType}`}
               </button>
            </div>
          </div>
          
          <div className="space-y-6 sm:space-y-8">
             <div className="bg-brand-primary p-5 rounded-xl sm:rounded-xl text-white shadow-sm relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                   <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-300">Quick Tags</h4>
                   <p className="text-xs sm:text-sm font-medium leading-relaxed">Map variables automatically: <code className="bg-white/10 px-1.5 rounded">{'{name}'}</code> or <code className="bg-white/10 px-1.5 rounded">{'{amount}'}</code> for bulk personalization.</p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl opacity-20"></div>
             </div>
             
             <div className="bg-white p-5 rounded-xl sm:rounded-xl border border-slate-100 shadow-sm space-y-6">
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-400 text-center sm:text-left">SMS Credits</h4>
                <div className="flex items-center justify-between">
                    <p className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">{typeof smsCredits === 'number' ? smsCredits.toLocaleString() : 'Not configured'}</p>
                   <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl"><Zap size={20}/></div>
                </div>
                <button type="button" disabled title="SMS provider billing is not connected" className="w-full py-4 bg-slate-100 text-slate-500 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Top-up not configured</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationCenter;
