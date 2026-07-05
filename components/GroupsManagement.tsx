
import React, { useState } from 'react';
import { 
  Layers, Users, MessageSquare, 
  MoreVertical, Search, Plus, 
  Target, Calendar, Shield, Heart, 
  MapPin, Zap, X, 
  Send, CheckCircle2,
  Loader2
} from 'lucide-react';
import { Member, Group } from '../types';

interface GroupsManagementProps {
  members: Member[];
  groups: Group[];
  onCreateGroup?: (group: Group) => void;
}

const GroupsManagement: React.FC<GroupsManagementProps> = ({ members, groups: propGroups, onCreateGroup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingMembersGroup, setViewingMembersGroup] = useState<Group | null>(null);
  const [messagingGroup, setMessagingGroup] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const filteredGroups = propGroups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getMemberCount = (groupName: string) => {
    return members.filter(m => m.groups && m.groups.includes(groupName)).length;
  };

  const getGroupMembers = (groupName: string) => {
    return members.filter(m => m.groups && m.groups.includes(groupName));
  };

  const handleCreateGroup = () => {
    if (!onCreateGroup) return;
    const group: Group = {
      id: `g${Date.now()}`,
      name: newGroupName || 'Untitled Group',
      description: newGroupDesc || '',
      memberCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onCreateGroup(group);
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setSuccessMessage(`"${group.name}" created successfully!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('youth') || lower.includes('young')) return <Zap className="text-brand-primary" size={20} />;
    if (lower.includes('worship') || lower.includes('choir') || lower.includes('music') || lower.includes('media') || lower.includes('tech')) return <Shield className="text-brand-gold" size={20} />;
    if (lower.includes('women') || lower.includes('men') || lower.includes('grace') || lower.includes('faith') || lower.includes('fellow')) return <Heart className="text-brand-primary" size={20} />;
    if (lower.includes('children') || lower.includes('kid')) return <Heart className="text-brand-primary" size={20} />;
    return <Layers className="text-slate-500" size={20} />;
  };

  const getCategoryLabel = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('youth') || lower.includes('young')) return 'Fellowship';
    if (lower.includes('worship') || lower.includes('media') || lower.includes('tech') || lower.includes('choir')) return 'Department';
    if (lower.includes('children')) return 'Ministry';
    if (lower.includes('women') || lower.includes('men') || lower.includes('faith')) return 'Fellowship';
    return 'Fellowship';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {successMessage && (
        <div className="fixed top-24 right-8 bg-brand-primary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 z-[100]">
          <CheckCircle2 size={24} />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Groups & Fellowships</h2>
          <p className="text-slate-500 mt-2 text-lg">Manage groups and fellowships.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-black hover:bg-slate-800 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} /> Create Group
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search groups..." 
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGroups.map(group => {
          const groupMemberCount = getMemberCount(group.name);
          const target = Math.max(group.memberCount || 10, 10);
          const progress = Math.min((groupMemberCount / target) * 100, 100);

          return (
            <div key={group.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="p-8 space-y-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl bg-slate-50`}>
                    {getCategoryIcon(group.name)}
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical size={20}/>
                  </button>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-brand-primary transition-colors uppercase">{group.name}</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">{getCategoryLabel(group.name)}</p>
                </div>

                {group.description && (
                  <p className="text-sm text-slate-500 leading-relaxed">{group.description}</p>
                )}

                <div className="space-y-2">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase text-slate-400">Members</p>
                      <p className="text-xs font-black text-slate-800">{groupMemberCount}</p>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-primary rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }} 
                      />
                   </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                 <button 
                  onClick={() => setViewingMembersGroup(group)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-brand-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm"
                 >
                   View Members
                 </button>
                 <button 
                  onClick={() => setMessagingGroup(group)}
                  className="p-3 bg-white border border-slate-200 text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                 >
                   <MessageSquare size={18}/>
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Create New Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Group Name</label>
                <input type="text" placeholder="e.g. Youth Fellowship" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Description</label>
                <textarea placeholder="Describe the group's purpose..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none resize-none" rows={3} value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button>
              <button onClick={handleCreateGroup} disabled={isSubmitting || !newGroupName} className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20}/>} {isSubmitting ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {viewingMembersGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-slate-50`}>{getCategoryIcon(viewingMembersGroup.name)}</div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">{viewingMembersGroup.name} Members</h3>
                  {viewingMembersGroup.description && <p className="text-slate-500 font-medium">{viewingMembersGroup.description}</p>}
                </div>
              </div>
              <button onClick={() => setViewingMembersGroup(null)} className="text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar border border-slate-100 rounded-[2rem]">
               <table className="w-full text-left">
                  <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest z-10">
                    <tr>
                      <th className="px-8 py-5">Member Name</th>
                      <th className="px-8 py-5">Contact</th>
                      <th className="px-8 py-5">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {getGroupMembers(viewingMembersGroup.name).map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-primary flex items-center justify-center font-black text-xs">{m.firstName[0]}{m.lastName[0]}</div>
                              <span className="font-bold text-slate-800">{m.firstName} {m.lastName}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-slate-600">{m.phone}</td>
                        <td className="px-8 py-5 text-sm font-medium text-slate-600">{m.location}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={() => setViewingMembersGroup(null)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-[1.25rem] font-black hover:bg-slate-200">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Group Modal */}
      {messagingGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-brand-primary rounded-2xl"><Send size={20}/></div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Group SMS</h3>
              </div>
              <button onClick={() => setMessagingGroup(null)} className="text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Users className="text-brand-primary" size={18}/>
                    <span className="text-sm font-bold text-slate-700">Targeting {messagingGroup.name}</span>
                 </div>
                 <span className="text-[10px] font-black uppercase text-brand-primary">{getMemberCount(messagingGroup.name)} Recipients</span>
              </div>
              <textarea className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] font-bold text-slate-700 outline-none resize-none focus:ring-2 focus:ring-brand-primary" rows={5} placeholder="Hello members, this is a reminder..."/>
              <div className="flex gap-4">
                 <button onClick={() => setMessagingGroup(null)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Discard</button>
                  <button onClick={() => { setMessagingGroup(null); setSuccessMessage(`SMS Broadcast sent to ${messagingGroup.name}`); setTimeout(() => setSuccessMessage(null), 3000); }} className="flex-1 py-4 bg-brand-primary text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                    <Send size={18}/> Send
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsManagement;
