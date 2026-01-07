
import React, { useState, useRef, useMemo } from 'react';
import { 
  Search, Plus, MoreHorizontal, Filter, Mail, Phone, MapPin, 
  MessageCircle, X, Camera, Check, User, Send, Eye,
  Calendar, Wallet, CheckCircle2, Map, ExternalLink,
  Lock, Smartphone, Trash2, Edit2, AlertTriangle, Download,
  UserPlus, ShieldAlert, Loader2, ChevronRight, Activity,
  Users, Heart, FileSpreadsheet, Upload, FileText, Image as ImageIcon,
  Layers, Cake, HeartPulse, ShieldCheck
} from 'lucide-react';
import { Member, MemberStatus, MembershipType, MaritalStatus, Transaction, ChurchEvent, UserRole } from '../types';

interface MembershipProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onAddMembersBulk: (members: Member[]) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  transactions: Transaction[];
  events: ChurchEvent[];
  currentUserRole: UserRole;
}

const Membership: React.FC<MembershipProps> = ({ 
  members, 
  onAddMember, 
  onAddMembersBulk,
  onUpdateMember,
  onDeleteMember,
  transactions, 
  events,
  currentUserRole 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [groupFilter, setGroupFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Member | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'OVERVIEW' | 'GIVING' | 'ATTENDANCE'>('OVERVIEW');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Member>>({
    status: MemberStatus.ACTIVE,
    membershipType: MembershipType.FULL,
    maritalStatus: MaritalStatus.SINGLE,
    groups: []
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allPossibleGroups = useMemo(() => {
    const defaultGroups = ['Youth Fellowship', 'Women of Grace', 'Men of Valor', 'Worship Team', 'Media & Tech', 'Childrens Ministry'];
    const existingGroups = Array.from(new Set(members.flatMap(m => m.groups)));
    return Array.from(new Set([...defaultGroups, ...existingGroups]));
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const searchStr = `${m.firstName} ${m.lastName} ${m.phone}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      const matchesGroup = groupFilter === 'All' || (m.groups && m.groups.includes(groupFilter));
      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [members, searchTerm, statusFilter, groupFilter]);

  const handleExportCSV = () => {
    const headers = "ID,FirstName,LastName,Phone,Email,Location,Status,MembershipType,JoinDate\n";
    const rows = filteredMembers.map(m => 
      `${m.id},${m.firstName},${m.lastName},${m.phone},${m.email},${m.location},${m.status},${m.membershipType},${m.joinDate}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `congregation_filtered_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleDownloadTemplate = () => {
    const headers = "Firstname,Lastname,Phone,Email,Location,Groups,Status,JoinDate\n";
    const exampleRow = "John,Doe,0712345678,john@imani.org,Westlands,Youth Fellowship;Media,Active,2024-01-01";
    const blob = new Blob([headers + exampleRow], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "imani_member_template.csv";
    a.click();
  };

  const handleBulkCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const imported: Member[] = lines.slice(1).filter(l => l.trim() !== '').map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        header.forEach((h, i) => obj[h] = values[i]);
        return {
          id: Math.random().toString(36).substr(2, 9),
          firstName: obj['firstname'],
          lastName: obj['lastname'],
          phone: obj['phone'],
          email: obj['email'] || '',
          location: obj['location'],
          groups: obj['groups'] ? obj['groups'].split(';') : ['General'],
          status: (obj['status'] as MemberStatus) || MemberStatus.ACTIVE,
          joinDate: obj['joindate'] || new Date().toISOString().split('T')[0],
          membershipType: MembershipType.FULL
        };
      });
      onAddMembersBulk(imported);
      setShowBulkModal(false);
    };
    reader.readAsText(file);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onAddMember({
        ...formData as Member,
        id: Math.random().toString(36).substr(2, 9),
        joinDate: new Date().toISOString().split('T')[0],
        photo: photo || undefined
      });
      setIsSaving(false);
      setShowAddModal(false);
      setFormData({ groups: [] });
      setPhoto(null);
    }, 1000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-indigo-50 text-brand-indigo rounded-xl">
               <Users size={24} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Souls Directory</h2>
          </div>
          <p className="text-slate-500 mt-1 text-sm sm:text-lg font-medium">Enterprise management of the church's most valuable assets.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentUserRole !== UserRole.MEMBER && (
            <>
              <button 
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-brand-indigo border border-indigo-100 rounded-[1rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-sm"
              >
                <FileSpreadsheet size={16} /> Bulk Import
              </button>
              <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-[1rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              >
                <Download size={16} /> Export CSV
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-[1rem] font-black text-xs uppercase tracking-widest hover:bg-brand-primary-700 transition-all shadow-xl shadow-brand-primary/20"
              >
                <Plus size={18} /> New Soul
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col xl:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, phone or fellowship..." 
              className="w-full pl-14 pr-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select 
              className="px-6 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase bg-white outline-none cursor-pointer hover:border-brand-primary transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              className="px-6 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase bg-white outline-none cursor-pointer hover:border-brand-primary transition-colors"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="All">All Ministries</option>
              {allPossibleGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Identity</th>
                <th className="px-10 py-6">Phone / Contact</th>
                <th className="px-10 py-6">Department</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-all group cursor-pointer" onClick={() => setSelectedMember(member)}>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl border-2 border-brand-primary/5 overflow-hidden bg-white shadow-sm flex-shrink-0">
                        {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-slate-200" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-base leading-tight truncate">{member.firstName} {member.lastName}</p>
                        <p className="text-[10px] text-brand-indigo font-black uppercase mt-1 tracking-widest opacity-60">{member.membershipType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm text-slate-700 font-bold">{member.phone}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1 flex items-center gap-1"><MapPin size={10}/> {member.location}</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {member.groups?.slice(0, 2).map(g => (
                        <span key={g} className="px-2 py-1 bg-brand-gold/5 border border-brand-gold/10 rounded-lg text-[9px] font-black text-slate-600 uppercase">{g}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      member.status === MemberStatus.ACTIVE ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {member.status}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                     <button className="p-3 bg-brand-indigo/5 text-brand-indigo rounded-xl hover:bg-brand-indigo hover:text-white transition-all shadow-sm">
                        <ChevronRight size={18}/>
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-4xl h-full lg:h-auto lg:max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
              <div className="p-10 bg-brand-primary text-white relative flex-shrink-0">
                 <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-8">
                       <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1 shadow-2xl relative">
                          {selectedMember.photo ? <img src={selectedMember.photo} className="w-full h-full object-cover rounded-[2.2rem]" /> : <div className="w-full h-full bg-slate-100 rounded-[2.2rem] flex items-center justify-center text-slate-300"><User size={48}/></div>}
                          <div className="absolute -bottom-2 -right-2 bg-brand-emerald text-white p-2.5 rounded-2xl border-4 border-brand-primary">
                             <ShieldCheck size={20}/>
                          </div>
                       </div>
                       <div>
                          <h3 className="text-4xl font-black tracking-tight uppercase leading-tight">{selectedMember.firstName} {selectedMember.lastName}</h3>
                          <div className="flex items-center gap-4 mt-4">
                             <span className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest">{selectedMember.membershipType}</span>
                             <span className="text-[10px] font-black text-brand-gold uppercase tracking-[0.2em]">Soul ID: #{selectedMember.id}</span>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => setSelectedMember(null)} className="p-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl"><X size={28}/></button>
                 </div>
                 <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-brand-indigo rounded-full blur-[80px] opacity-20"></div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12 no-scrollbar bg-slate-50/50">
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <section className="space-y-6">
                       <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.25em] flex items-center gap-3"><Activity size={16}/> Essential Data</h4>
                       <div className="grid grid-cols-1 gap-4">
                          {[
                            { icon: Calendar, label: 'Kingdom Entrance', val: selectedMember.joinDate },
                            { icon: Cake, label: 'Spiritual Birthday', val: selectedMember.birthday || 'Not Recorded' },
                            { icon: HeartPulse, label: 'Covenant Status', val: selectedMember.maritalStatus },
                            { icon: MapPin, label: 'Primary Location', val: selectedMember.location }
                          ].map((i, idx) => (
                             <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center gap-6 shadow-sm">
                                <div className="p-3 bg-brand-indigo/10 text-brand-indigo rounded-2xl"><i.icon size={20}/></div>
                                <div>
                                   <p className="text-[10px] font-black uppercase text-slate-400">{i.label}</p>
                                   <p className="text-base font-bold text-slate-800 mt-0.5">{i.val}</p>
                                </div>
                             </div>
                          ))}
                       </div>
                    </section>
                    <section className="space-y-6">
                       <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.25em] flex items-center gap-3"><Layers size={16}/> Active Fellowships</h4>
                       <div className="grid grid-cols-2 gap-3">
                          {selectedMember.groups?.map(g => (
                             <div key={g} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 group">
                                <div className="w-2 h-8 bg-brand-gold rounded-full opacity-40 group-hover:opacity-100 transition-opacity"></div>
                                <span className="font-bold text-sm text-slate-700">{g}</span>
                             </div>
                          ))}
                       </div>
                    </section>
                 </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
                 <button className="flex-1 py-5 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                    <Download size={18}/> Full Dossier
                 </button>
                 <button onClick={() => setSelectedMember(null)} className="flex-1 py-5 bg-brand-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-indigo shadow-xl transition-all">Dismiss Profile</button>
              </div>
           </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-200 border border-white/20">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-5">
                    <div className="p-4 bg-brand-indigo/10 text-brand-indigo rounded-[1.5rem] shadow-sm"><FileSpreadsheet size={32}/></div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Bulk Soul Sync</h3>
                       <p className="text-slate-400 font-bold text-[10px] uppercase mt-1">Upload congregation list in CSV format</p>
                    </div>
                 </div>
                 <button onClick={() => setShowBulkModal(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all"><X size={24}/></button>
              </div>

              <div className="space-y-6">
                 <div className="p-12 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50 flex flex-col items-center justify-center text-center space-y-6 group hover:border-brand-primary transition-all cursor-pointer">
                    <Upload size={64} className="text-slate-300 group-hover:text-brand-primary transition-colors"/>
                    <div>
                       <p className="text-lg font-black text-slate-600 uppercase tracking-tight">Drop Manifest Here</p>
                       <p className="text-sm text-slate-400 mt-1">Firstname, Lastname, Phone (Mandatory)</p>
                    </div>
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      id="bulk-csv-input" 
                      onChange={handleBulkCsvImport}
                    />
                    <label 
                      htmlFor="bulk-csv-input"
                      className="px-10 py-4 bg-white border border-slate-200 text-brand-indigo rounded-2xl font-black text-[11px] uppercase tracking-widest cursor-pointer hover:bg-brand-indigo hover:text-white transition-all shadow-sm"
                    >
                      Browse Files
                    </label>
                 </div>

                 <div className="flex justify-between items-center px-4">
                    <button onClick={handleDownloadTemplate} className="text-[10px] font-black text-brand-indigo uppercase tracking-widest hover:underline flex items-center gap-2">
                       <FileText size={14}/> Download Template
                    </button>
                    <span className="text-[10px] font-black text-slate-300 uppercase italic">Max limit: 500 records</span>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Add New Soul Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
             <form onSubmit={handleAddSubmit}>
                <div className="p-10 bg-brand-primary text-white flex justify-between items-center relative overflow-hidden">
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="p-4 bg-white/10 rounded-3xl border border-white/20"><UserPlus size={32}/></div>
                      <h3 className="text-3xl font-black uppercase tracking-tight">Identity Registration</h3>
                   </div>
                   <button type="button" onClick={() => setShowAddModal(false)} className="relative z-10 p-3 bg-white/10 rounded-2xl"><X size={24}/></button>
                </div>
                <div className="p-10 sm:p-14 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">First Name</label>
                      <input required className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none" placeholder="e.g. David" value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Last Name</label>
                      <input required className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none" placeholder="e.g. Ochieng" value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">M-Pesa Mobile</label>
                      <input required className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none" placeholder="07XX XXX XXX" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Email Address</label>
                      <input className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none" placeholder="optional@imani.org" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Identity Type</label>
                      <select className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none" value={formData.membershipType} onChange={e => setFormData({...formData, membershipType: e.target.value as MembershipType})}>
                        {Object.values(MembershipType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Location</label>
                      <input required className="w-full p-5 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none" placeholder="e.g. Westlands" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
                   </div>
                </div>
                <div className="p-10 sm:p-14 border-t border-slate-100 bg-white flex gap-4">
                   <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-6 font-black text-slate-400 hover:bg-slate-50 rounded-3xl uppercase text-xs tracking-widest">Cancel</button>
                   <button type="submit" disabled={isSaving} className="flex-[2] py-6 bg-brand-primary text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-brand-indigo transition-all flex items-center justify-center gap-3">
                      {isSaving ? <Loader2 className="animate-spin" size={24}/> : <CheckCircle2 size={24}/>} Register Soul
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
