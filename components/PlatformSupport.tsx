
import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, Search, Filter, MessageSquare, Clock, 
  CheckCircle2, AlertTriangle, X, Send, User, 
  Smartphone, Mail, Building2, MoreHorizontal,
  ArrowRight, ShieldCheck, Zap, Loader2, Save,
  LifeBuoy, ChevronRight, FileText
} from 'lucide-react';
import { SupportTicket } from '../types';

const PlatformSupport: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingTicket, setViewingTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const initialTickets: SupportTicket[] = [
    { id: 'TKT-1024', tenantName: 'Nairobi Central Parish', subject: 'M-Pesa Webhook Delay', description: 'We noticed a 30-minute delay in tithe reconciliations this morning. Please check the node health for Nairobi-East.', status: 'Open', priority: 'High', createdAt: '2024-05-20T08:30:00Z', lastUpdate: '2 mins ago' },
    { id: 'TKT-1025', tenantName: 'Mombasa Gateway Church', subject: 'Upgrade to Enterprise Plan', description: 'We want to migrate from Pro to Enterprise to unlock the Geo-Outreach Scouter module.', status: 'Pending', priority: 'Medium', createdAt: '2024-05-19T14:20:00Z', lastUpdate: '1h ago' },
    { id: 'TKT-1026', tenantName: 'Nakuru Valley Parish', subject: 'Data Export Help', description: 'Having trouble exporting our Q1 financial report for the upcoming board meeting.', status: 'Resolved', priority: 'Low', createdAt: '2024-05-18T10:00:00Z', lastUpdate: '1 day ago' },
    { id: 'TKT-1027', tenantName: 'Kisumu Outreach Center', subject: 'System Login Failure', description: 'Multiple secretaries report "Access Denied" errors when attempting to sign in.', status: 'Open', priority: 'Critical', createdAt: '2024-05-20T09:45:00Z', lastUpdate: 'Now' },
  ];

  const filteredTickets = useMemo(() => {
    return initialTickets.filter(t => {
      const matchesSearch = t.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) || t.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        if (a.priority === 'Critical') return -1;
        if (b.priority === 'Critical') return 1;
        return 0;
    });
  }, [searchTerm, statusFilter]);

  const handleSendReply = () => {
    if (!reply) return;
    setIsReplying(true);
    setTimeout(() => {
      setIsReplying(false);
      setViewingTicket(null);
      setReply('');
      alert('Response dispatched to tenant admin.');
    }, 1500);
  };

  const getPriorityColor = (p: SupportTicket['priority']) => {
    switch (p) {
      case 'Critical': return 'bg-rose-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-brand-indigo text-white';
      default: return 'bg-slate-200 text-slate-600';
    }
  };

  const getStatusStyle = (s: SupportTicket['status']) => {
    switch (s) {
      case 'Open': return 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20';
      case 'Pending': return 'bg-brand-gold/10 text-brand-gold border-brand-gold/20';
      default: return 'bg-slate-100 text-slate-400 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-brand-primary text-brand-gold rounded-2xl shadow-xl">
                 <LifeBuoy size={28}/>
              </div>
              <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase leading-none">SaaS Help Desk</h2>
           </div>
           <p className="text-slate-500 text-lg font-medium">Platform-wide support orchestration for all church administrators.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-6 py-3 bg-brand-emerald/10 text-brand-emerald rounded-full border border-brand-emerald/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse"/>
              <span className="text-[10px] font-black uppercase tracking-widest">Global Support Online</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white p-4 sm:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Find tickets by church or subject..." 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary text-sm shadow-inner"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-700 outline-none cursor-pointer" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Tickets</option>
                <option value="Open">Open</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
           </div>

           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
              <div className="divide-y divide-slate-50">
                 {filteredTickets.map(ticket => (
                    <div 
                      key={ticket.id} 
                      onClick={() => setViewingTicket(ticket)}
                      className="p-8 hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col sm:flex-row items-center gap-6 group"
                    >
                       <div className="flex-shrink-0">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm ${getPriorityColor(ticket.priority)}`}>
                             {ticket.priority[0]}
                          </div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                             <h4 className="font-black text-slate-800 text-lg truncate group-hover:text-brand-primary transition-colors">{ticket.subject}</h4>
                             <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(ticket.status)}`}>
                                {ticket.status}
                             </span>
                          </div>
                          <p className="text-sm text-slate-500 font-medium line-clamp-1 italic">"{ticket.description}"</p>
                          <div className="flex items-center gap-4 mt-3 text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                             <span className="flex items-center gap-1.5"><Building2 size={12} className="text-brand-indigo"/> {ticket.tenantName}</span>
                             <span className="flex items-center gap-1.5"><Clock size={12}/> {ticket.lastUpdate}</span>
                             <span className="text-slate-300 font-mono">#{ticket.id}</span>
                          </div>
                       </div>
                       <div className="flex-shrink-0">
                          <button className="p-3 bg-white border border-slate-100 text-slate-300 group-hover:text-brand-primary group-hover:border-brand-primary/20 rounded-xl transition-all">
                             <ChevronRight size={20}/>
                          </button>
                       </div>
                    </div>
                 ))}
                 {filteredTickets.length === 0 && (
                    <div className="py-40 text-center space-y-6">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                          <LifeBuoy size={40}/>
                       </div>
                       <p className="font-black text-slate-400 uppercase tracking-widest">No active tickets found</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="bg-brand-primary p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/10 rounded-2xl text-brand-gold"><Zap size={24}/></div>
                    <h4 className="text-xl font-black uppercase tracking-tight">SLA Performance</h4>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-center">
                       <p className="text-3xl font-black">12m</p>
                       <p className="text-[9px] font-black uppercase text-indigo-300">Avg. Response</p>
                    </div>
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl text-center">
                       <p className="text-3xl font-black">98.4%</p>
                       <p className="text-[9px] font-black uppercase text-indigo-300">Resolution Rate</p>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-white/10 flex items-center gap-3 text-brand-gold">
                    <ShieldCheck size={18}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">Systems Optimal</span>
                 </div>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-10" />
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <h4 className="text-lg font-black text-slate-800 flex items-center gap-3 uppercase tracking-tight">
                 <FileText size={20} className="text-brand-indigo"/> Support Intel
              </h4>
              <div className="space-y-6">
                 {[
                   { label: 'Fintech/M-Pesa issues', count: 12, trend: '+4' },
                   { label: 'Identity/Login errors', count: 8, trend: '-2' },
                   { label: 'License & Billing', count: 5, trend: '0' },
                   { label: 'Feature Requests', count: 14, trend: '+3' }
                 ].map(i => (
                   <div key={i.label} className="flex items-center justify-between">
                      <div>
                         <p className="text-xs font-bold text-slate-600">{i.label}</p>
                         <p className="text-[9px] font-black text-slate-300 uppercase">{i.trend} since yesterday</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-50 text-slate-800 font-black rounded-lg text-xs">{i.count}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Ticket Reply Modal */}
      {viewingTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-white/20 flex flex-col max-h-[90vh]">
              <div className={`p-10 text-white relative overflow-hidden flex-shrink-0 ${getPriorityColor(viewingTicket.priority)}`}>
                 <div className="relative z-10 flex justify-between items-start">
                    <div>
                       <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                          {viewingTicket.priority} Priority • #{viewingTicket.id}
                       </div>
                       <h3 className="text-3xl font-black uppercase tracking-tight leading-tight">{viewingTicket.subject}</h3>
                       <div className="flex items-center gap-4 mt-2 opacity-80 font-bold text-xs">
                          <span className="flex items-center gap-2"><Building2 size={14}/> {viewingTicket.tenantName}</span>
                          <span className="flex items-center gap-2"><Clock size={14}/> Created {new Date(viewingTicket.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                    <button onClick={() => setViewingTicket(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10"><X size={24}/></button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 lg:p-14 space-y-12 no-scrollbar bg-white">
                 <section className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       <MessageSquare size={14}/> Issue Description
                    </h4>
                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                       <p className="text-lg text-slate-700 font-medium leading-relaxed leading-relaxed italic font-serif">
                          "{viewingTicket.description}"
                       </p>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                       <Send size={14}/> SaaS Command Response
                    </h4>
                    <textarea 
                      className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all resize-none shadow-inner"
                      rows={6}
                      placeholder="Compose technical or account-level guidance..."
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                    />
                 </section>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 flex-shrink-0">
                 <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    <button className="px-5 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase whitespace-nowrap hover:bg-slate-50">Escalate to Dev</button>
                    <button className="px-5 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase whitespace-nowrap hover:bg-slate-50">Mark Resolved</button>
                 </div>
                 <button 
                   onClick={handleSendReply}
                   disabled={isReplying || !reply}
                   className="flex-[2] py-5 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-brand-indigo transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                    {isReplying ? <Loader2 className="animate-spin" size={20}/> : <ArrowRight size={20}/>}
                    Dispatch Response
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PlatformSupport;
