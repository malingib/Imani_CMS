import React, { useState } from 'react';
import {
  MessageSquare, Send, Mail, Phone, Search,
  Filter, MoreHorizontal, Plus, Users, History,
  CheckCircle2, AlertCircle, Clock, ChevronRight,
  X, Trash2, Edit2, Calendar, Share2,
  Smartphone, Eye, Zap, Repeat, Sparkles, Wand2,
  Save, Loader2
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
  const [activeTab, setActiveTab] = useState<'LOGS' | 'COMPOSE' | 'AUTOMATION'>('LOGS');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageType, setMessageType] = useState<'SMS' | 'Email' | 'WhatsApp'>('SMS');
  const [broadcastTarget, setBroadcastTarget] = useState('All Members');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showLogDetails, setShowLogDetails] = useState<CommunicationLog | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Automation State
  const [autoVerseEnabled, setAutoVerseEnabled] = useState(true);
  const [verseFrequency, setVerseFrequency] = useState<'Daily' | 'Weekly'>('Daily');
  const [verseMode, setVerseMode] = useState<'Auto' | 'Manual'>('Auto');
  const [manualVerse, setManualVerse] = useState('');
  const [isGeneratingSermon, setIsGeneratingSermon] = useState(false);

  const stats = [
    { label: 'Total Sent', value: '45.2k', icon: Send, color: 'indigo' },
    { label: 'Delivery Rate', value: '98.5%', icon: CheckCircle2, color: 'emerald' },
    { label: 'Pending', value: '124', icon: Clock, color: 'amber' },
    { label: 'Failed', value: '12', icon: AlertCircle, color: 'rose' },
  ];

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
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">Communication Center</h2>
          <p className="text-slate-500 mt-2 text-base lg:text-lg font-medium">AI-powered ministry outreach and engagement.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm self-start lg:self-center overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('LOGS')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'LOGS' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}>History</button>
          <button onClick={() => setActiveTab('COMPOSE')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === 'COMPOSE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}>New Message</button>
          <button onClick={() => setActiveTab('AUTOMATION')} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'AUTOMATION' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}><Zap size={14}/> Automation</button>
        </div>
      </div>

      {activeTab === 'AUTOMATION' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Sparkles size={24}/></div>
                    <h3 className="text-2xl font-black text-slate-800">Auto-Verse Service</h3>
                 </div>
                 <div className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-all ${autoVerseEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`} onClick={() => setAutoVerseEnabled(!autoVerseEnabled)}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all ${autoVerseEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                 </div>
              </div>
              
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400">Frequency</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={verseFrequency} onChange={e => setVerseFrequency(e.target.value as any)}>
                          <option>Daily</option>
                          <option>Weekly</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400">Generation Mode</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" value={verseMode} onChange={e => setVerseMode(e.target.value as any)}>
                          <option>Auto (Gemini AI)</option>
                          <option>Manual Entry</option>
                       </select>
                    </div>
                 </div>

                 {verseMode === 'Manual' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                       <label className="text-[10px] font-black uppercase text-slate-400">Static Verse Queue</label>
                       <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold resize-none" rows={3} placeholder="Paste verse and reference..." value={manualVerse} onChange={e => setManualVerse(e.target.value)} />
                    </div>
                 )}

                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Channels</p>
                    <div className="flex gap-3">
                       {['SMS', 'WhatsApp', 'Email'].map(channel => (
                          <div key={channel} className="flex-1 p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-center gap-2">
                             <input type="checkbox" defaultChecked className="accent-indigo-600" />
                             <span className="text-xs font-black text-slate-600">{channel}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
              {/* Fix: Use imported Save icon */}
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                 <Save size={18}/> Update Automation Schedule
              </button>
           </div>

           <div className="space-y-8">
              <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="p-3 bg-white/10 rounded-2xl text-indigo-300"><Wand2 size={24}/></div>
                       <h3 className="text-2xl font-black">AI Sermonette</h3>
                    </div>
                    <p className="text-indigo-100 font-medium">Generate 100-word punchy, inspirational messages with Gemini for your ministry groups.</p>
                    <button 
                       onClick={handleGenerateAiSermon}
                       disabled={isGeneratingSermon}
                       className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {/* Fix: Use imported Loader2 icon */}
                       {isGeneratingSermon ? <Loader2 className="animate-spin"/> : <Sparkles size={20}/>}
                       {isGeneratingSermon ? 'Conceiving Word...' : 'Draft for WhatsApp/Email'}
                    </button>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500 rounded-full blur-[60px] opacity-20 group-hover:scale-125 transition-transform"></div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                 <h4 className="text-xl font-black text-slate-800 flex items-center gap-3"><Clock size={20} className="text-indigo-600"/> Next Dispatch</h4>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <Zap size={16} className="text-indigo-600"/>
                          <span className="text-sm font-bold text-slate-700">Daily Verse Dispatch</span>
                       </div>
                       <span className="text-[10px] font-black uppercase text-indigo-600">Today, 06:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                       <div className="flex items-center gap-3">
                          <MessageSquare size={16} className="text-indigo-600"/>
                          <span className="text-sm font-bold text-slate-700">Youth Sermonette</span>
                       </div>
                       <span className="text-[10px] font-black uppercase text-slate-400">Wed, 09:00 PM</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      ) : activeTab === 'LOGS' ? (
        <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 lg:p-10 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 gap-4">
            <h3 className="text-xl font-black text-slate-800">Broadcast History</h3>
            <div className="relative w-full md:w-80 lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="w-full pl-12 pr-6 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="divide-y divide-slate-50 overflow-x-auto">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-6 lg:p-8 hover:bg-slate-50 transition-all flex items-center justify-between gap-6 min-w-[700px] lg:min-w-0">
                <div className="flex items-start gap-4 lg:gap-6 flex-1">
                  <div className={`p-3 lg:p-4 rounded-2xl lg:rounded-3xl shadow-sm ${
                    log.type === 'SMS' ? 'bg-blue-50 text-blue-600' : 
                    log.type === 'Email' ? 'bg-amber-50 text-amber-600' : 
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {log.type === 'SMS' ? <Smartphone size={24}/> : log.type === 'Email' ? <Mail size={24}/> : <Share2 size={24}/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-black text-slate-800 text-base lg:text-lg truncate">{log.subject}</h4>
                      <span className="text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{log.type}</span>
                    </div>
                    <p className="text-xs lg:text-sm text-slate-500 line-clamp-1 mb-2 font-medium">"{log.content}"</p>
                    <div className="flex items-center gap-3 text-[9px] lg:text-[10px] font-black uppercase tracking-tighter text-slate-400">
                      <span className="flex items-center gap-1"><Users size={12}/> {log.recipientCount}</span>
                      <span>{log.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 lg:gap-6">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    log.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {log.status}
                  </span>
                  <button onClick={() => setShowLogDetails(log)} className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><ChevronRight size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 lg:p-12 rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Channel</label>
                <div className="flex gap-2 lg:gap-3">
                  {(['SMS', 'Email', 'WhatsApp'] as const).map(t => (
                    <button key={t} onClick={() => setMessageType(t)} className={`flex-1 py-3 lg:py-4 rounded-2xl lg:rounded-3xl font-black text-[10px] lg:text-xs transition-all border-2 ${messageType === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 text-slate-500 border-slate-50 hover:bg-slate-100'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Audience</label>
                <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-xs lg:text-sm text-slate-700 outline-none" value={broadcastTarget} onChange={(e) => setBroadcastTarget(e.target.value)}>
                   <option>All Members</option>
                   <option>Youth Fellowship</option>
                   <option>Women of Grace</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {messageType === 'Email' && (
                <input type="text" placeholder="Email Subject" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 outline-none" value={subject} onChange={(e) => setSubject(e.target.value)} />
              )}
              <textarea rows={8} placeholder="Type your message..." className="w-full p-6 lg:p-8 bg-slate-50 border border-slate-100 rounded-[2rem] font-bold text-slate-700 outline-none" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>

            <button onClick={handleSend} disabled={!content || isSending} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 disabled:opacity-50">
              {/* Fix: Use imported Loader2 icon */}
              {isSending ? <Loader2 className="animate-spin" /> : <Send size={24} />} 
              {isSending ? 'Sending...' : `Send via ${messageType}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationCenter;
