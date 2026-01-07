
import React, { useState, useMemo } from 'react';
import { ShieldCheck, Search, Filter, Calendar, Clock, User, Download, FileText, AlertTriangle, Info, CheckCircle2, ChevronRight, X, Database, Terminal } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsProps {
  logs: AuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewingMetadata, setViewingMetadata] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || log.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
      
      const logDate = log.timestamp.split('T')[0];
      const matchesStart = !dateRange.start || logDate >= dateRange.start;
      const matchesEnd = !dateRange.end || logDate <= dateRange.end;

      return matchesSearch && matchesSeverity && matchesStart && matchesEnd;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm, severityFilter, dateRange]);

  const getSeverityStyle = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'WARN': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">Forensic Audit Vault</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">System-wide immutable ledger with detailed payload visibility.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          <Download size={16} /> Export Forensic Log
        </button>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 space-y-6">
           <div className="flex flex-col xl:flex-row gap-6 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter by action, identity or metadata..." 
                  className="w-full pl-14 pr-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary text-sm shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar pb-1 xl:pb-0">
                 <div className="flex items-center gap-2 bg-white px-6 py-4 border border-slate-200 rounded-2xl shadow-sm">
                    <Calendar size={14} className="text-slate-400"/>
                    <input type="date" className="bg-transparent outline-none text-[10px] font-black uppercase" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
                    <span className="text-slate-300">to</span>
                    <input type="date" className="bg-transparent outline-none text-[10px] font-black uppercase" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
                 </div>
                 <select 
                   className="px-6 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase bg-white outline-none shrink-0 cursor-pointer"
                   value={severityFilter}
                   onChange={(e) => setSeverityFilter(e.target.value)}
                 >
                   <option value="ALL">All Severities</option>
                   <option value="INFO">Information</option>
                   <option value="WARN">Warnings</option>
                   <option value="CRITICAL">Critical Actions</option>
                 </select>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Timestamp</th>
                <th className="px-10 py-6">Identity</th>
                <th className="px-10 py-6">Action Executed</th>
                <th className="px-10 py-6 text-right">Forensics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-8">
                     <p className="text-sm font-bold text-slate-700">{log.timestamp.split('T')[1].slice(0, 5)}</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{log.timestamp.split('T')[0]}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-indigo flex items-center justify-center font-black text-xs">
                        {log.userName[0]}
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-700 leading-none">{log.userName}</p>
                         <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-1">{log.module}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[8px] font-black uppercase border ${getSeverityStyle(log.severity)}`}>
                         {log.severity}
                       </span>
                       <p className="text-sm font-medium text-slate-600 line-clamp-1">{log.action}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <button 
                       onClick={() => setViewingMetadata(log)}
                       className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                     >
                        <ChevronRight size={16}/>
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {viewingMetadata && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-end">
            <div className="bg-white h-full w-full max-w-xl shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
               <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-brand-primary text-white rounded-xl shadow-lg"><Terminal size={20}/></div>
                     <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Audit Metadata</h3>
                  </div>
                  <button onClick={() => setViewingMetadata(null)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-rose-500 transition-all shadow-sm"><X size={20}/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
                  <section className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Digital Signature</p>
                     <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                        <div className="flex justify-between items-start">
                           <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">{viewingMetadata.action}</h4>
                           <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${getSeverityStyle(viewingMetadata.severity)}`}>{viewingMetadata.severity}</span>
                        </div>
                     </div>
                  </section>

                  <section className="space-y-4">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Contextual Data</p>
                     <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden">
                        <pre className="text-emerald-400 font-mono text-xs overflow-x-auto no-scrollbar">
                           {JSON.stringify({
                             id: viewingMetadata.id,
                             timestamp: viewingMetadata.timestamp,
                             actor_id: viewingMetadata.userId,
                             module: viewingMetadata.module,
                             origin_node: "Nairobi-East-Node-01",
                             payload: viewingMetadata.metadata || { status: "no_extended_metadata" }
                           }, null, 2)}
                        </pre>
                        <div className="absolute top-4 right-4 text-white/20"><Database size={16}/></div>
                     </div>
                  </section>
               </div>

               <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                  <button onClick={() => setViewingMetadata(null)} className="w-full py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest">Close Vault</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default AuditLogs;
