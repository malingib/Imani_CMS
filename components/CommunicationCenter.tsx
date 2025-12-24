
import React, { useState } from 'react';
import { 
  MessageSquare, Send, Mail, Phone, Search, 
  Filter, MoreHorizontal, Plus, Users, History,
  CheckCircle2, AlertCircle, Clock, ChevronRight,
  X, Trash2, Edit2, Layout, Calendar, Share2
} from 'lucide-react';
import { CommunicationLog, Member, CommunicationTemplate } from '../types';

interface CommunicationCenterProps {
  members: Member[];
  logs: CommunicationLog[];
  onSendBroadcast: (log: CommunicationLog) => void;
  currentUser: { name: string };
}

const CommunicationCenter: React.FC<CommunicationCenterProps> = ({ members, logs, onSendBroadcast, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'COMPOSE'>('LOGS');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageType, setMessageType] = useState<'SMS' | 'Email' | 'WhatsApp'>('SMS');
  const [broadcastTarget, setBroadcastTarget] = useState('All Members');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showLogDetails, setShowLogDetails] = useState<CommunicationLog | null>(null);
  
  // Custom Target State
  const [showCustomTargetModal, setShowCustomTargetModal] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Template State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([
    { id: 't1', name: 'Welcome Message', type: 'WhatsApp', content: 'Habari! Welcome to Baraka Church. We are so glad to have you with us today! *God bless you.*' },
    { id: 't2', name: 'Service Reminder', type: 'SMS', content: 'Sunday Service Reminder: Join us tomorrow at 9 AM for a powerful session of worship and word. See you there!' },
  ]);

  const stats = [
    { label: 'Total Sent', value: '45.2k', icon: Send, color: 'indigo' },
    { label: 'Delivery Rate', value: '98.5%', icon: CheckCircle2, color: 'emerald' },
    { label: 'Pending', value: '124', icon: Clock, color: 'amber' },
    { label: 'Failed', value: '12', icon: AlertCircle, color: 'rose' },
  ];

  const handleSend = () => {
    if (!content) return;
    const isScheduled = !!(scheduledDate && scheduledTime);
    const newLog: CommunicationLog = {
      id: Date.now().toString(),
      type: messageType,
      recipientCount: broadcastTarget === 'Custom' ? selectedMemberIds.length : members.length,
      targetGroupName: broadcastTarget,
      subject: subject || 'Broadcast Message',
      content,
      date: new Date().toISOString().split('T')[0],
      scheduledFor: isScheduled ? `${scheduledDate} ${scheduledTime}` : undefined,
      status: isScheduled ? 'Scheduled' : 'Sent',
      sender: currentUser.name,
      deliveryBreakdown: isScheduled ? undefined : {
        delivered: broadcastTarget === 'Custom' ? selectedMemberIds.length : members.length,
        opened: Math.floor((broadcastTarget === 'Custom' ? selectedMemberIds.length : members.length) * 0.7),
        failed: 0
      }
    };
    onSendBroadcast(newLog);
    setActiveTab('LOGS');
    resetForm();
    alert(isScheduled ? 'Broadcast scheduled!' : 'Broadcast sent successfully!');
  };

  const resetForm = () => {
    setContent('');
    setSubject('');
    setScheduledDate('');
    setScheduledTime('');
    setBroadcastTarget('All Members');
    setSelectedMemberIds([]);
  };

  const applyTemplate = (tpl: CommunicationTemplate) => {
    setMessageType(tpl.type);
    setContent(tpl.content);
    if (tpl.subject) setSubject(tpl.subject);
    setShowTemplateModal(false);
  };

  const saveAsTemplate = () => {
    const name = prompt('Enter a name for this template:');
    if (name) {
      const newTpl: CommunicationTemplate = {
        id: Date.now().toString(),
        name,
        type: messageType,
        subject,
        content
      };
      setTemplates([...templates, newTpl]);
      alert('Template saved!');
    }
  };

  const filteredLogs = logs.filter(l => 
    l.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Communication Center</h2>
          <p className="text-slate-500 mt-2 text-lg">Cross-channel engagement via SMS, Email, and WhatsApp.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('LOGS')}
            className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === 'LOGS' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            History
          </button>
          <button 
            onClick={() => setActiveTab('COMPOSE')}
            className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${activeTab === 'COMPOSE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            New Broadcast
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
              <div className={`p-5 rounded-[1.5rem] bg-${stat.color}-50 text-${stat.color}-600`}>
                <Icon size={28} />
              </div>
              <div>
                <p className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {activeTab === 'LOGS' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 gap-4">
            <h3 className="text-2xl font-black text-slate-800">Broadcast History</h3>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search messages, senders, status..." 
                className="w-full pl-12 pr-6 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-8 hover:bg-slate-50 transition-all group relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-6">
                    <div className={`p-4 rounded-3xl shadow-sm ${
                      log.type === 'SMS' ? 'bg-blue-50 text-blue-600' : 
                      log.type === 'Email' ? 'bg-amber-50 text-amber-600' : 
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {log.type === 'SMS' ? <Phone size={24}/> : log.type === 'Email' ? <Mail size={24}/> : <Share2 size={24}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-slate-800 text-lg truncate">{log.subject}</h4>
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{log.type}</span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1 mb-2 font-medium">"{log.content}"</p>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter text-slate-400">
                        <span className="flex items-center gap-1"><Users size={12}/> {log.recipientCount} Recipients</span>
                        <span className="flex items-center gap-1 font-bold text-indigo-600/70"><Plus size={12}/> Sent by {log.sender}</span>
                        <span>{log.date}</span>
                        {log.scheduledFor && <span className="text-amber-600 flex items-center gap-1"><Clock size={12}/> Scheduled: {log.scheduledFor}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      log.status === 'Sent' ? 'bg-emerald-100 text-emerald-700' : 
                      log.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {log.status}
                    </span>
                    <button 
                      onClick={() => setShowLogDetails(log)}
                      className="p-3 bg-white border border-slate-100 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-2 font-black text-[10px] uppercase"
                    >
                      View Details <ChevronRight size={14}/>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Broadcast Channel</label>
                <div className="flex gap-3">
                  {(['SMS', 'Email', 'WhatsApp'] as const).map(t => (
                    <button 
                      key={t}
                      onClick={() => setMessageType(t)}
                      className={`flex-1 py-4 rounded-3xl font-black text-xs transition-all border-2 ${
                        messageType === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Target Audience</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                  >
                    <option>All Members</option>
                    <option>Youth Fellowship</option>
                    <option>Women of Grace</option>
                    <option>Men of Valor</option>
                    <option>Custom</option>
                  </select>
                  {broadcastTarget === 'Custom' && (
                    <button 
                      onClick={() => setShowCustomTargetModal(true)}
                      className="p-4 bg-indigo-100 text-indigo-600 rounded-[1.5rem] hover:bg-indigo-200 transition-colors"
                    >
                      <Plus size={24}/>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Message & Content</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowTemplateModal(true)}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
                  >
                    <Layout size={12}/> Templates
                  </button>
                  <button 
                    onClick={saveAsTemplate}
                    disabled={!content}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Save as Template
                  </button>
                </div>
              </div>

              {messageType === 'Email' && (
                <input 
                  type="text"
                  placeholder="Email Subject Line"
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all animate-in slide-in-from-top-2"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              )}

              <div className="relative">
                <textarea 
                  rows={10}
                  placeholder={messageType === 'WhatsApp' ? "Use *text* for bold, _text_ for italics. e.g. *Karibu!*" : "Type your broadcast message..."}
                  className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="absolute bottom-6 right-8 flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{content.length} characters</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{Math.ceil(content.length / 160)} SMS Credits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduling Section */}
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-white rounded-2xl shadow-sm text-amber-500">
                <Calendar size={24}/>
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-black text-slate-800">Schedule Broadcast?</h5>
                <p className="text-xs text-slate-500 font-medium">Leave blank to send immediately.</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <input 
                  type="date" 
                  className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
                <input 
                  type="time" 
                  className="p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>

            <button 
              onClick={handleSend}
              disabled={!content}
              className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-indigo-300 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:grayscale"
            >
              <Send size={28} /> {scheduledDate ? 'Schedule Broadcast' : 'Send Broadcast Now'}
            </button>
          </div>

          <div className="space-y-8">
            <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-950/30 relative overflow-hidden group">
              <h4 className="text-2xl font-black mb-6 flex items-center gap-4 relative z-10">
                <Users size={32} className="text-indigo-400" /> Live Reach
              </h4>
              <div className="space-y-8 relative z-10">
                <div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                    <span className="opacity-70">Audience Selection</span>
                    <span>{broadcastTarget === 'Custom' ? selectedMemberIds.length : members.length} Souls</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 group-hover:bg-emerald-400 transition-colors" style={{width: '100%'}}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-[1.5rem] bg-white/10 border border-white/10 backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Cost Est.</p>
                    <p className="text-2xl font-black tracking-tight">KES {(Math.ceil(content.length / 160) * (broadcastTarget === 'Custom' ? selectedMemberIds.length : members.length) * 1).toLocaleString()}</p>
                  </div>
                  <div className="p-6 rounded-[1.5rem] bg-white/10 border border-white/10 backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Credits</p>
                    <p className="text-2xl font-black tracking-tight">8.4k</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-30"></div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
              <h4 className="font-black text-slate-800 mb-8 flex items-center gap-4 text-xl">
                <History size={24} className="text-indigo-600" /> Delivery Status
              </h4>
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-indigo-200 transition-all">
                  <div className="p-4 bg-white rounded-2xl text-indigo-600 shadow-sm group-hover:scale-110 transition-transform"><Send size={24}/></div>
                  <div>
                    <p className="text-base font-black text-slate-800">Instant Send</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Immediate delivery</p>
                  </div>
                  {(!scheduledDate) && <CheckCircle2 className="ml-auto text-emerald-500" size={24}/>}
                </div>
                <div className={`flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all ${scheduledDate ? 'border-amber-200 bg-amber-50' : 'opacity-60 grayscale'}`}>
                  <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm group-hover:scale-110 transition-transform"><Clock size={24}/></div>
                  <div>
                    <p className="text-base font-black text-slate-800">Scheduled</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Future delivery</p>
                  </div>
                  {scheduledDate && <CheckCircle2 className="ml-auto text-amber-500" size={24}/>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {showLogDetails && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <div>
                <h3 className="text-3xl font-black text-slate-800">Broadcast Details</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-2">SENT BY {showLogDetails.sender.toUpperCase()}</p>
              </div>
              <button onClick={() => setShowLogDetails(null)} className="p-4 bg-white text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm transition-all"><X size={24}/></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Delivered</p>
                  <p className="text-3xl font-black text-emerald-600">{showLogDetails.deliveryBreakdown?.delivered || 0}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Opened</p>
                  <p className="text-3xl font-black text-indigo-600">{showLogDetails.deliveryBreakdown?.opened || 0}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Failed</p>
                  <p className="text-3xl font-black text-rose-600">{showLogDetails.deliveryBreakdown?.failed || 0}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Message Snippet</span>
                  <span className="text-[10px] font-black text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full">{showLogDetails.type} Broadcast</span>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-slate-700 leading-relaxed font-medium">
                  "{showLogDetails.content}"
                </div>
              </div>
              <div className="flex items-center gap-6 pt-6">
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Target Group</p>
                  <p className="font-bold text-slate-800">{showLogDetails.targetGroupName}</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time Dispatched</p>
                  <p className="font-bold text-slate-800">{showLogDetails.date} • {showLogDetails.scheduledFor ? 'Scheduled' : 'Instant'}</p>
                </div>
              </div>
            </div>
            <div className="p-10 bg-slate-50 border-t border-slate-100">
               <button 
                 onClick={() => setShowLogDetails(null)}
                 className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all shadow-xl"
               >
                 Close Report
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <h3 className="text-2xl font-black text-slate-800">Message Library</h3>
              <button onClick={() => setShowTemplateModal(false)} className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm"><X size={20}/></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {templates.map(tpl => (
                <div key={tpl.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group relative hover:border-indigo-200 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Layout size={20} className="text-indigo-600" />
                      <span className="font-black text-slate-800">{tpl.name}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-500">{tpl.type}</span>
                  </div>
                  <p className="text-sm text-slate-500 italic mb-6 line-clamp-2">"{tpl.content}"</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => applyTemplate(tpl)}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      Use Template
                    </button>
                    <button 
                      onClick={() => setTemplates(templates.filter(t => t.id !== tpl.id))}
                      className="p-3 bg-white text-rose-500 border border-rose-100 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && <p className="text-center py-10 text-slate-400 font-bold">No templates saved yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Custom Target Modal */}
      {showCustomTargetModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800">Select Recipients</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1">{selectedMemberIds.length} SELECTED</p>
              </div>
              <button onClick={() => setShowCustomTargetModal(false)} className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm"><X size={20}/></button>
            </div>
            <div className="p-6 bg-white border-b border-slate-100">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name or fellowship..." 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>
            <div className="max-h-[50vh] overflow-y-auto divide-y divide-slate-50">
              {members.filter(m => `${m.firstName} ${m.lastName} ${m.group}`.toLowerCase().includes(searchTerm.toLowerCase())).map(member => {
                const isSelected = selectedMemberIds.includes(member.id);
                return (
                  <button 
                    key={member.id} 
                    onClick={() => {
                      setSelectedMemberIds(prev => isSelected ? prev.filter(id => id !== member.id) : [...prev, member.id]);
                    }}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                        {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <Users size={20} className="text-slate-300"/>}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-sm">{member.firstName} {member.lastName}</p>
                        <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{member.group}</p>
                      </div>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 bg-white'}`}>
                      {isSelected && <CheckCircle2 size={24} />}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button 
                onClick={() => { setSelectedMemberIds(members.map(m => m.id)) }}
                className="flex-1 py-4 bg-white text-slate-600 border border-slate-200 rounded-[1.5rem] font-black text-sm hover:bg-slate-50 transition-all"
              >
                Select All
              </button>
              <button 
                onClick={() => setShowCustomTargetModal(false)}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all"
              >
                Confirm List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationCenter;
