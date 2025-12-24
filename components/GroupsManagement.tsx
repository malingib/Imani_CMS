
import React, { useState, useMemo } from 'react';
import { 
  Layers, Users, UserPlus, MessageSquare, 
  MoreVertical, Search, Plus, Filter, 
  Target, Calendar, Shield, Heart, 
  Music, MapPin, ChevronRight, Zap, X, 
  Settings2, UserCheck, Send, CheckCircle2,
  AlertCircle, Loader2, Save
} from 'lucide-react';
import { Member, UserRole } from '../types';

interface GroupsManagementProps {
  members: Member[];
}

interface ChurchGroup {
  id: string;
  name: string;
  category: 'Fellowship' | 'Department' | 'Ministry';
  leader: string;
  leaderAvatar: string;
  meetingDay: string;
  location: string;
  target: number;
}

const GroupsManagement: React.FC<GroupsManagementProps> = ({ members }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [viewingMembersGroup, setViewingMembersGroup] = useState<ChurchGroup | null>(null);
  const [messagingGroup, setMessagingGroup] = useState<ChurchGroup | null>(null);
  
  // Loading & Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [groups, setGroups] = useState<ChurchGroup[]>([
    { id: 'g1', name: 'Youth Fellowship', category: 'Fellowship', leader: 'David Ochieng', leaderAvatar: 'https://i.pravatar.cc/100?img=12', meetingDay: 'Fridays, 5:30 PM', location: 'Youth Center', target: 50 },
    { id: 'g2', name: 'Worship Team', category: 'Department', leader: 'Sarah Mumbua', leaderAvatar: 'https://i.pravatar.cc/100?img=25', meetingDay: 'Wednesdays, 6:00 PM', location: 'Main Sanctuary', target: 30 },
    { id: 'g3', name: 'Women of Grace', category: 'Fellowship', leader: 'Mary Wambui', leaderAvatar: 'https://i.pravatar.cc/100?img=32', meetingDay: 'Saturdays, 3:00 PM', location: 'Social Hall', target: 100 },
    { id: 'g4', name: 'Men of Valor', category: 'Fellowship', leader: 'Kennedy Kamau', leaderAvatar: 'https://i.pravatar.cc/100?img=44', meetingDay: 'Saturdays, 7:00 AM', location: 'Basement Room 2', target: 80 },
    { id: 'g5', name: 'Media & Tech', category: 'Department', leader: 'Eric Otieno', leaderAvatar: 'https://i.pravatar.cc/100?img=51', meetingDay: 'Thursdays, 6:30 PM', location: 'Control Booth', target: 15 },
    { id: 'g6', name: 'Childrens Ministry', category: 'Ministry', leader: 'Alice Njeri', leaderAvatar: 'https://i.pravatar.cc/100?img=43', meetingDay: 'Sundays, 9:00 AM', location: 'Sunday School Block', target: 150 },
  ]);

  const [newGroup, setNewGroup] = useState<Partial<ChurchGroup>>({
    category: 'Fellowship',
    meetingDay: '',
    location: '',
    target: 50
  });

  const filteredGroups = groups.filter(g => {
    const matchesCategory = activeCategory === 'All' || g.category === activeCategory;
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.leader.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getMemberCount = (groupName: string) => {
    return members.filter(m => m.group === groupName).length;
  };

  const getGroupMembers = (groupName: string) => {
    return members.filter(m => m.group === groupName);
  };

  const handleCreateGroup = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const group: ChurchGroup = {
        id: `g${Date.now()}`,
        name: newGroup.name || 'Untitled Group',
        category: newGroup.category as any,
        leader: newGroup.leader || 'Unassigned',
        leaderAvatar: `https://i.pravatar.cc/100?u=${newGroup.name}`,
        meetingDay: newGroup.meetingDay || 'TBD',
        location: newGroup.location || 'TBD',
        target: newGroup.target || 50
      };
      setGroups(prev => [...prev, group]);
      setIsSubmitting(false);
      setShowCreateModal(false);
      setSuccessMessage(`"${group.name}" created successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }, 1000);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fellowship': return <Heart className="text-rose-500" size={20} />;
      case 'Department': return <Shield className="text-indigo-500" size={20} />;
      case 'Ministry': return <Zap className="text-amber-500" size={20} />;
      default: return <Layers className="text-slate-500" size={20} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {successMessage && (
        <div className="fixed top-24 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 z-[100]">
          <CheckCircle2 size={24} />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Groups & Fellowships</h2>
          <p className="text-slate-500 mt-2 text-lg">Organize your congregation into thriving communities.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
          >
            <Filter size={20} /> Group Settings
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} /> Create Group
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          {['All', 'Fellowship', 'Department', 'Ministry'].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search groups or leaders..." 
            className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGroups.map(group => {
          const groupMemberCount = getMemberCount(group.name);
          const currentCount = groupMemberCount + 5; // +5 for mock realism
          const progress = Math.min((currentCount / group.target) * 100, 100);

          return (
            <div key={group.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="p-8 space-y-6 flex-1">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl bg-slate-50`}>
                    {getCategoryIcon(group.category)}
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical size={20}/>
                  </button>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{group.name}</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">{group.category}</p>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                   <img src={group.leaderAvatar} alt={group.leader} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lead by</p>
                      <p className="text-sm font-bold text-slate-700">{group.leader}</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <Calendar size={16} className="text-indigo-400"/> {group.meetingDay}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <MapPin size={16} className="text-indigo-400"/> {group.location}
                  </div>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black uppercase text-slate-400">Membership Growth</p>
                      <p className="text-xs font-black text-slate-800">{currentCount} / {group.target}</p>
                   </div>
                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }} 
                      />
                   </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                 <button 
                  onClick={() => setViewingMembersGroup(group)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                 >
                   View Members
                 </button>
                 <button 
                  onClick={() => setMessagingGroup(group)}
                  className="p-3 bg-white border border-slate-200 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
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
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Create New Group</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Group Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Youth Fellowship" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    value={newGroup.name}
                    onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Category</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    value={newGroup.category}
                    onChange={e => setNewGroup({...newGroup, category: e.target.value as any})}
                  >
                    <option value="Fellowship">Fellowship</option>
                    <option value="Department">Department</option>
                    <option value="Ministry">Ministry</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Leader Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter leader's name" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    value={newGroup.leader}
                    onChange={e => setNewGroup({...newGroup, leader: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Meeting Day & Time</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Saturdays, 4:00 PM" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    value={newGroup.meetingDay}
                    onChange={e => setNewGroup({...newGroup, meetingDay: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Primary Location</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Youth Center" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    value={newGroup.location}
                    onChange={e => setNewGroup({...newGroup, location: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Membership Growth Target</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 50" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold"
                    value={newGroup.target}
                    onChange={e => setNewGroup({...newGroup, target: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button>
              <button 
                onClick={handleCreateGroup}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <Plus size={20}/>}
                {isSubmitting ? 'Creating...' : 'Establish Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Settings2 className="text-indigo-600" size={24}/>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Group Preferences</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Global Group Rules</p>
                {[
                  { label: "Automatic Growth Tracking", desc: "Sync group counts with member join dates.", active: true },
                  { label: "Leader Notifications", desc: "Notify leaders when new members join.", active: true },
                  { label: "Public Group Directory", desc: "Show fellowships on the mobile member portal.", active: false }
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex-1 pr-4">
                       <p className="text-sm font-bold text-slate-800">{pref.label}</p>
                       <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{pref.desc}</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${pref.active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${pref.active ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl space-y-3">
                 <div className="flex items-center gap-2 text-indigo-700 font-black text-xs uppercase tracking-widest">
                    <AlertCircle size={14}/>
                    Data Privacy
                 </div>
                 <p className="text-[11px] text-indigo-600/70 font-medium leading-relaxed">
                   Group leaders only have access to their own group members' data in compliance with the Data Protection Act.
                 </p>
              </div>
            </div>

            <button onClick={() => setShowSettingsModal(false)} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
              <Save size={20}/> Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {viewingMembersGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-slate-50`}>
                  {getCategoryIcon(viewingMembersGroup.category)}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight">{viewingMembersGroup.name} Members</h3>
                  <p className="text-slate-500 font-medium">Community led by {viewingMembersGroup.leader}</p>
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
                      <th className="px-8 py-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {getGroupMembers(viewingMembersGroup.name).map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                                 {m.firstName[0]}{m.lastName[0]}
                              </div>
                              <span className="font-bold text-slate-800">{m.firstName} {m.lastName}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-medium text-slate-600">{m.phone}</td>
                        <td className="px-8 py-5 text-sm font-medium text-slate-600">{m.location}</td>
                        <td className="px-8 py-5 text-right">
                           <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg">Active</span>
                        </td>
                      </tr>
                    ))}
                    {getGroupMembers(viewingMembersGroup.name).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-300 font-bold">No members registered to this group yet.</td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={() => setViewingMembersGroup(null)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-[1.25rem] font-black transition-all hover:bg-slate-200">
                Close
              </button>
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
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Send size={20}/></div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Group SMS</h3>
              </div>
              <button onClick={() => setMessagingGroup(null)} className="text-slate-400 hover:text-rose-500 transition-all"><X size={24}/></button>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Users className="text-indigo-400" size={18}/>
                    <span className="text-sm font-bold text-slate-700">Targeting {messagingGroup.name}</span>
                 </div>
                 <span className="text-[10px] font-black uppercase text-indigo-600">
                    {getMemberCount(messagingGroup.name) + 5} Recipients
                 </span>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Broadcast Content</label>
                 <textarea 
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] font-bold text-slate-700 outline-none resize-none" 
                    rows={5} 
                    placeholder="Hello members, this is a reminder for our meeting..."
                 />
                 <div className="flex justify-end px-2">
                    <span className="text-[10px] font-black text-slate-400">0 / 160 Characters (1 SMS)</span>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setMessagingGroup(null)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Discard</button>
                 <button 
                  onClick={() => {
                    setIsSubmitting(true);
                    setTimeout(() => {
                      setIsSubmitting(false);
                      setMessagingGroup(null);
                      setSuccessMessage(`SMS Broadcast sent to ${messagingGroup.name}`);
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }, 1500);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                   {isSubmitting ? 'Sending...' : 'Send Blast'}
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
