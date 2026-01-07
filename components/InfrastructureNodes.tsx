
import React, { useState } from 'react';
import { 
  Server, Activity, ShieldCheck, Zap, 
  RefreshCcw, Database, Globe, Cpu, HardDrive, 
  Network, Search, Terminal, ChevronRight, X,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface Node {
  id: string;
  name: string;
  region: string;
  status: 'OPTIMAL' | 'DEGRADED' | 'MAINTENANCE' | 'OFFLINE';
  uptime: string;
  metrics: {
    cpu: number;
    memory: number;
    latency: number;
    load: { time: string; value: number }[];
  };
  tenants: number;
  lastBackup: string;
}

const InfrastructureNodes: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [nodes] = useState<Node[]>([
    { id: 'NODE-01', name: 'Nairobi-East-Alpha', region: 'Nairobi', status: 'OPTIMAL', uptime: '142 days', tenants: 42, lastBackup: '2h ago', metrics: { cpu: 24, memory: 42, latency: 12, load: [{time: '1', value: 20}, {time: '2', value: 25}, {time: '3', value: 22}] } },
    { id: 'NODE-02', name: 'Mombasa-Coast-Beta', region: 'Coast', status: 'OPTIMAL', uptime: '89 days', tenants: 28, lastBackup: '4h ago', metrics: { cpu: 18, memory: 35, latency: 45, load: [{time: '1', value: 15}, {time: '2', value: 18}, {time: '3', value: 16}] } },
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getStatusColor = (status: Node['status']) => {
    switch (status) {
      case 'OPTIMAL': return 'bg-brand-emerald text-brand-emerald';
      case 'DEGRADED': return 'bg-brand-gold text-brand-gold';
      default: return 'bg-brand-indigo text-brand-indigo';
    }
  };

  const filteredNodes = nodes.filter(n => n.name.toLowerCase().includes(searchTerm.toLowerCase()) || n.region.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-brand-primary text-brand-gold rounded-2xl shadow-xl">
               <Server size={28} />
            </div>
            <h2 className="text-4xl font-black text-brand-primary tracking-tight uppercase leading-none">Node Infrastructure</h2>
          </div>
          <p className="text-slate-500 text-lg font-medium">Regional cluster health.</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 px-8 py-4 bg-white text-brand-primary border border-slate-200 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 shadow-sm"
        >
          <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Polled...' : 'Poll Telemetry'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Global Uptime', val: '99.98%', icon: Globe, color: 'emerald' },
          { label: 'Active Clusters', val: nodes.length, icon: Layers, color: 'indigo' },
          { label: 'Mean Latency', val: '24ms', icon: Activity, color: 'gold' },
          { label: 'Security Scans', val: 'Passed', icon: ShieldCheck, color: 'primary' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-4 bg-brand-${s.color}-50 text-brand-${s.color}-500 rounded-2xl`}>
                <s.icon size={24} />
              </div>
            </div>
            <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{s.val}</h4>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black border-b">
              <tr>
                <th className="px-10 py-6">Node Instance</th>
                <th className="px-10 py-6">Uptime</th>
                <th className="px-10 py-6 text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredNodes.map(node => (
                <tr key={node.id} onClick={() => setSelectedNode(node)} className="hover:bg-slate-50 transition-all cursor-pointer">
                  <td className="px-10 py-8">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-primary/5 text-brand-primary rounded-xl">
                          <Server size={20}/>
                        </div>
                        <div>
                           <p className="font-black text-slate-800 text-base">{node.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">{node.region}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-10 py-8">
                     <span className="text-[10px] font-black text-slate-500 uppercase">{node.uptime}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <ChevronRight size={18} className="ml-auto text-slate-300"/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedNode && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex justify-end">
           <div className="bg-white w-full max-w-2xl h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <Terminal size={24}/>
                    <h3 className="text-2xl font-black text-slate-800 uppercase">{selectedNode.name}</h3>
                 </div>
                 <button onClick={() => setSelectedNode(null)} className="p-3 bg-white border rounded-xl text-slate-400 hover:text-rose-500 transition-all shadow-sm"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border space-y-2">
                       <p className="text-[10px] font-black uppercase text-slate-400">Node Status</p>
                       <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(selectedNode.status)}`} />
                          <span className="font-black text-slate-800 uppercase">{selectedNode.status}</span>
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border space-y-2">
                       <p className="text-[10px] font-black uppercase text-slate-400">Backups</p>
                       <p className="font-black text-slate-800">{selectedNode.lastBackup}</p>
                    </div>
                 </div>

                 <section className="space-y-6">
                    <h4 className="text-sm font-black uppercase text-slate-400 flex items-center gap-2">
                       <Cpu size={16}/> Compute Metrics
                    </h4>
                    <div className="grid grid-cols-3 gap-6">
                       <div className="p-5 bg-white border rounded-2xl shadow-sm text-center">
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">CPU</p>
                          <p className="text-xl font-black text-slate-800">{selectedNode.metrics.cpu}%</p>
                       </div>
                       <div className="p-5 bg-white border rounded-2xl shadow-sm text-center">
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">RAM</p>
                          <p className="text-xl font-black text-slate-800">{selectedNode.metrics.memory}%</p>
                       </div>
                       <div className="p-5 bg-white border rounded-2xl shadow-sm text-center">
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Latency</p>
                          <p className="text-xl font-black text-slate-800">{selectedNode.metrics.latency}ms</p>
                       </div>
                    </div>
                 </section>

                 <section className="space-y-6">
                    <h4 className="text-sm font-black uppercase text-slate-400 flex items-center gap-2">
                       <Activity size={16}/> 24h Load Profile
                    </h4>
                    <div className="h-64 bg-slate-50 rounded-3xl p-6 border">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedNode.metrics.load}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                             <XAxis dataKey="time" hide />
                             <YAxis hide />
                             <Area type="monotone" dataKey="value" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.1} strokeWidth={4} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </section>
              </div>

              <div className="p-8 border-t bg-slate-50/50 flex gap-4">
                 <button onClick={() => setSelectedNode(null)} className="flex-1 py-5 bg-white border rounded-2xl font-black uppercase text-[10px]">Close</button>
                 <button className="flex-[2] py-5 bg-brand-primary text-white rounded-2xl font-black uppercase text-[10px] shadow-xl hover:bg-brand-indigo">
                    Re-Sync Databases
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default InfrastructureNodes;
