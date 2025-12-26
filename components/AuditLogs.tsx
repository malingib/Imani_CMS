
import React, { useState, useMemo } from 'react';
import { ShieldCheck, Search, Filter, Calendar, Clock, User, Download, FileText, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsProps {
  logs: AuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || log.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm, severityFilter]);

  const getSeverityStyle = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'WARN': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getSeverityIcon = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'CRITICAL': return <AlertTriangle size={14}/>;
      case 'WARN': return <Info size={14}/>;
      default: return <CheckCircle2 size={14}/>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase">Platform Integrity Audit</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Immutable ledger of all administrative and financial actions.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
          <Download size={16} /> Export Audit Vault
        </button>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col xl:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by action or user..." 
              className="w-full pl-14 pr-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full xl:w-auto">
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

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Timestamp & Node</th>
                <th className="px-10 py-6">Identity</th>
                <th className="px-10 py-6">Module</th>
                <th className="px-10 py-6">Action Executed</th>
                <th className="px-10 py-6 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-slate-300"/>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{log.timestamp.split('T')[1].slice(0, 5)}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{log.timestamp.split('T')[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-indigo flex items-center justify-center font-black text-xs">
                        {log.userName[0]}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[10px] font-black uppercase text-slate-400 border border-slate-100 px-3 py-1 rounded-lg">
                      {log.module}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{log.action}</p>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${getSeverityStyle(log.severity)}`}>
                      {getSeverityIcon(log.severity)}
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <FileText size={48} className="mx-auto text-slate-100 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest">No audit entries found matching criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
