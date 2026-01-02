
import React, { useState, useRef, useMemo } from 'react';
import { 
  Search, Plus, MoreHorizontal, Filter, Mail, Phone, MapPin, 
  MessageCircle, X, Camera, Check, User, Send, Eye,
  Calendar, Wallet, CheckCircle2, Map, ExternalLink,
  Lock, Smartphone, Trash2, Edit2, AlertTriangle, Download,
  UserPlus, ShieldAlert, Loader2, ChevronRight, Activity,
  Users, Heart, FileSpreadsheet, Upload, FileText, Image as ImageIcon,
  Layers
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

interface MessagingTarget {
  id: string;
  name: string;
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
  
  const [messagingGroup, setMessagingGroup] = useState<MessagingTarget | null>(null);

  // Member Form State
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
      const matchesSearch = `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      const matchesGroup = groupFilter === 'All' || (m.groups && m.groups.includes(groupFilter));
      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [members, searchTerm, statusFilter, groupFilter]);

  const memberGivings = useMemo(() => {
    if (!selectedMember) return [];
    return transactions.filter(t => t.memberId === selectedMember.id);
  }, [selectedMember, transactions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBulkCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Fix: Explicitly type the map callback return as Member | null to ensure compatibility with Member type predicate
      const importedMembers: Member[] = lines.slice(1)
        .filter(line => line.trim() !== '')
        .map((line): Member | null => {
          const values = line.split(',').map(v => v.trim());
          const obj: any = {};
          header.forEach((h, i) => {
            if (h === 'groups') {
              obj[h] = values[i] ? values[i].split(';').map(g => g.trim()).filter(g => g !== '') : [];
            } else {
              obj[h] = values[i] === '' ? null : values[i];
            }
          });

          // Mandatory fields check: Name, Location, Phone
          if (!obj['firstname'] || !obj['lastname'] || !obj['phone'] || !obj['location']) {
            return null;
          }

          return {
            id: Math.random().toString(36).substr(2, 9),
            firstName: obj['firstname'],
            lastName: obj['lastname'],
            phone: obj['phone'],
            email: obj['email'] || '',
            location: obj['location'],
            groups: obj['groups'] && obj['groups'].length > 0 ? obj['groups'] : ['General'],
            status: (obj['status'] as MemberStatus) || MemberStatus.ACTIVE,
            joinDate: obj['joindate'] || new Date().toISOString().split('T')[0],
            membershipType: (obj['membershiptype'] as MembershipType) || MembershipType.FULL,
            maritalStatus: (obj['maritalstatus'] as MaritalStatus) || MaritalStatus.SINGLE,
            age: obj['age'] ? parseInt(obj['age']) : undefined,
            gender: obj['gender'] as 'Male' | 'Female' | 'Other'
          };
        })
        .filter((m): m is Member => m !== null);

      if (importedMembers.length > 0) {
        onAddMembersBulk(importedMembers);
        setShowBulkModal(false);
      } else {
        alert("Import failed. Ensure mandatory columns (Firstname, Lastname, Phone, Location) are filled for each row.");
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const headers = "ID,FirstName,LastName,Phone,Email,Location,Groups,Status,JoinDate\n";
    const rows = filteredMembers.map(m => 
      `${m.id},${m.firstName},${m.lastName},${m.phone},${m.email},${m.location},"${m.groups.join(';')}",${m.status},${m.joinDate}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `congregation_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const headers = "Firstname,Lastname,Phone,Email,Location,Groups,Status,JoinDate,Age,Gender,MaritalStatus,MembershipType\n";
    const exampleRow = "John,Doe,0712345678,john.doe@example.com,Nairobi West,Youth Fellowship;Media & Tech,Active,2024-01-01,25,Male,Single,Full Member\n";
    const exampleRowMinimal = "Jane,Smith,0722333444,,Mombasa,,Active,2024-05-20,,Female,,Associate";
    const csvContent = headers + exampleRow + exampleRowMinimal;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "imani_member_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const newM: Member = {
        ...formData as Member,
        id: Math.random().toString(36).substr(2, 9),
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        phone: formData.phone || '',
        email: formData.email || '',
        location: formData.location || '',
        groups: formData.groups && formData.groups.length > 0 ? formData.groups : ['General'],
        joinDate: new Date().toISOString().split('T')[0],
        photo: photo || undefined
      };
      onAddMember(newM);
      setIsSaving(false);
      setShowAddModal(false);
      setFormData({ groups: [] });
      setPhoto(null);
    }, 1000);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    setIsSaving(true);
    setTimeout(() => {
      onUpdateMember({ 
        ...showEditModal, 
        ...formData, 
        photo: photo || showEditModal.photo,
        groups: formData.groups && formData.groups.length > 0 ? formData.groups : showEditModal.groups
      } as Member);
      setIsSaving(false);
      setShowEditModal(null);
      setFormData({ groups: [] });
      setPhoto(null);
    }, 1000);
  };

  const toggleGroupSelection = (groupName: string) => {
    setFormData(prev => {
      const currentGroups = prev.groups || [];
      if (currentGroups.includes(groupName)) {
        return { ...prev, groups: currentGroups.filter(g => g !== groupName) };
      } else {
        return { ...prev, groups: [...currentGroups, groupName] };
      }
    });
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
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {currentUserRole !== UserRole.MEMBER && (
            <>
              <button 
                onClick={() => setShowBulkModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-brand-indigo border border-indigo-100 rounded-[1rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-sm"
              >
                <FileSpreadsheet size={16} /> Bulk Import
              </button>
              <button 
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-[1rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              >
                <Download size={16} /> Export
              </button>
              <button 
                onClick={() => { setShowAddModal(true); setFormData({ groups: [], status: MemberStatus.ACTIVE, membershipType: MembershipType.FULL, maritalStatus: MaritalStatus.SINGLE }); setPhoto(null); }}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-[1rem] font-black text-xs uppercase tracking-widest hover:bg-brand-primary-700 transition-all shadow-xl shadow-brand-primary/20"
              >
                <Plus size={18} /> New Soul
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        <div className="p-6 sm:p-10 border-b border-slate-100 bg-slate-50/30 flex flex-col xl:flex-row gap-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, phone or email..." 
              className="w-full pl-14 pr-8 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary text-sm shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar pb-1 xl:pb-0">
            <select 
              className="px-6 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase bg-white outline-none shrink-0 cursor-pointer hover:border-brand-primary transition-colors shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              className="px-6 py-4 border border-slate-200 rounded-2xl text-[10px] font-black uppercase bg-white outline-none shrink-0 cursor-pointer hover:border-brand-primary transition-colors shadow-sm"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="All">All Ministries</option>
              {allPossibleGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Mobile Grid View */}
        <div className="lg:hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
           {filteredMembers.map(member => (
              <div key={member.id} className="bg-slate-50 border border-slate-100 p-6 rounded-[2rem] space-y-4 hover:bg-white hover:shadow-xl transition-all group">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl border-2 border-brand-primary/10 overflow-hidden bg-white flex-shrink-0">
                       {member.photo ? <img src={member.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-slate-300" />}
                    </div>
                    <div className="min-w-0">
                       <h4 className="font-black text-slate-800 truncate">{member.firstName} {member.lastName}</h4>
                       <p className="text-[10px] font-black text-brand-indigo uppercase tracking-widest">{member.membershipType}</p>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                       <Phone size={14} className="text-slate-400"/> {member.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                       <MapPin size={14} className="text-slate-400"/> {member.location}
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-1">
                    {member.groups?.map(g => (
                      <span key={g} className="px-2 py-0.5 bg-brand-indigo/5 text-brand-indigo text-[8px] font-black uppercase rounded border border-brand-indigo/10">{g}</span>
                    ))}
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${member.status === MemberStatus.ACTIVE ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-slate-200 text-slate-600'}`}>{member.status}</span>
                    <button onClick={() => setSelectedMember(member)} className="p-2 bg-white rounded-xl text-brand-indigo shadow-sm hover:bg-brand-indigo hover:text-white transition-all"><Eye size={18}/></button>
                 </div>
              </div>
           ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-10 py-6">Congregant</th>
                <th className="px-10 py-6">Contact Integrity</th>
                <th className="px-10 py-6">Departments</th>
                <th className="px-10 py-6">Stewardship</th>
                <th className="px-10 py-6 text-right">Administrative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[1.25rem] border-2 border-brand-primary/5 overflow-hidden bg-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                        {member.photo ? <img src={member.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-slate-200" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-base leading-tight truncate">{member.firstName} {member.lastName}</p>
                        <p className="text-[10px] text-brand-indigo font-black uppercase mt-1 tracking-widest opacity-60">{member.membershipType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1.5">
                      <p className="text-sm text-slate-700 font-bold flex items-center gap-2 tracking-tight">{member.phone}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-1.5 tracking-widest">
                        <MapPin size={12} className="text-brand-indigo" /> {member.location}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {member.groups?.map(g => (
                        <div key={g} className="flex items-center gap-1.5 px-2 py-1 bg-brand-gold/5 border border-brand-gold/10 rounded-lg">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{g}</span>
                        </div>
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
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => { setSelectedMember(member); setActiveDetailTab('OVERVIEW'); }}
                        className="p-3 bg-brand-indigo/5 text-brand-indigo rounded-xl hover:bg-brand-indigo hover:text-white transition-all shadow-sm"
                        title="View Profile"
                       >
                         <Eye size={18} />
                       </button>
                       {currentUserRole !== UserRole.MEMBER && (
                         <div className="relative">
                            <button 
                              onClick={() => setOpenActionMenuId(openActionMenuId === member.id ? null : member.id)}
                              className={`p-3 rounded-xl transition-all ${openActionMenuId === member.id ? 'bg-slate-200 text-slate-900 shadow-inner' : 'bg-slate-50 text-slate-300 hover:text-slate-600'}`}
                            >
                                <MoreHorizontal size={18} />
                            </button>
                            {openActionMenuId === member.id && (
                              <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <button 
                                  onClick={() => { setShowEditModal(member); setFormData(member); setPhoto(member.photo || null); setOpenActionMenuId(null); }}
                                  className="w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-brand-indigo/5 flex items-center gap-3 transition-colors border-b border-slate-50"
                                >
                                  <Edit2 size={14} className="text-brand-indigo"/> Modify Record
                                </button>
                                <button 
                                  onClick={() => { setMessagingGroup({id: member.id, name: `${member.firstName} ${member.lastName}`} as any); setOpenActionMenuId(null); }}
                                  className="w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-brand-emerald/5 flex items-center gap-3 transition-colors border-b border-slate-50"
                                >
                                  <MessageCircle size={14} className="text-brand-emerald"/> Send SMS
                                </button>
                                <button 
                                  onClick={() => { setShowDeleteConfirm(member); setOpenActionMenuId(null); }}
                                  className="w-full text-left px-6 py-4 text-xs font-black uppercase tracking-widest text-brand-gold hover:bg-brand-gold/5 flex items-center gap-3 transition-colors"
                                >
                                  <Trash2 size={14} className="text-brand-gold"/> Terminate Record
                                </button>
                              </div>
                            )}
                         </div>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-0 sm:p-4 lg:p-12">
          <div className="bg-white rounded-none sm:rounded-[3rem] w-full max-w-6xl h-full lg:h-auto lg:max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-5 sm:p-10 lg:p-14 bg-brand-primary text-white relative overflow-hidden flex-shrink-0">
               <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-10">
                  <div className="flex items-center gap-4 sm:gap-8 lg:gap-10 w-full lg:w-auto">
                    <div className="w-16 h-16 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl sm:rounded-[2.5rem] bg-white p-0.5 sm:p-1 shadow-2xl relative flex-shrink-0 ring-2 sm:ring-4 ring-white/10">
                       {selectedMember.photo ? <img src={selectedMember.photo} className="w-full h-full object-cover rounded-[1.4rem] sm:rounded-[2.2rem]" /> : <div className="w-full h-full bg-slate-100 rounded-[1.4rem] sm:rounded-[2.2rem] flex items-center justify-center text-slate-300"><User size={28}/></div>}
                       <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-1.5 sm:p-3 bg-brand-emerald rounded-lg sm:rounded-2xl border-2 sm:border-4 border-brand-primary shadow-xl">
                          <CheckCircle2 size={12} className="text-white sm:w-5 sm:h-5" />
                       </div>
                    </div>
                    <div className="min-w-0 flex-1">
                       <h3 className="text-xl sm:text-4xl lg:text-5xl font-black tracking-tight truncate uppercase leading-tight">{selectedMember.firstName} {selectedMember.lastName}</h3>
                       <div className="flex flex-wrap items-center gap-1.5 sm:gap-4 mt-1 sm:mt-4">
                          <span className="px-2 py-0.5 sm:px-4 sm:py-1.5 bg-white/10 text-brand-indigo border border-white/20 rounded-md sm:rounded-xl text-[7px] sm:text-[10px] font-black uppercase tracking-widest">{selectedMember.membershipType}</span>
                          <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] text-brand-gold whitespace-nowrap">Since {new Date(selectedMember.joinDate).getFullYear()}</span>
                       </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedMember(null)} className="absolute -top-1 -right-1 sm:relative p-3 sm:p-5 bg-white/10 hover:bg-white/20 transition-all rounded-bl-2xl sm:rounded-2xl border-l border-b sm:border border-white/10">
                    <X size={20} className="sm:w-7 sm:h-7" />
                  </button>
               </div>
               <div className="absolute bottom-0 left-0 w-full flex bg-black/20 backdrop-blur-md px-4 sm:px-10 lg:px-14 pt-3 sm:pt-6 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'OVERVIEW', label: 'Overview', icon: User },
                    { id: 'GIVING', label: 'Giving', icon: Wallet },
                    { id: 'ATTENDANCE', label: 'Attendance', icon: Calendar }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveDetailTab(tab.id as any)}
                      className={`px-4 sm:px-8 pb-3 sm:pb-5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 sm:gap-3 border-b-2 sm:border-b-4 transition-all whitespace-nowrap ${activeDetailTab === tab.id ? 'border-brand-gold text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                    >
                      <tab.icon size={12} className="sm:w-4 sm:h-4"/> {tab.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-10 lg:p-14 no-scrollbar bg-slate-50/50">
               {activeDetailTab === 'OVERVIEW' && (
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-10 animate-in fade-in duration-500">
                    <div className="lg:col-span-4 space-y-4 sm:space-y-8">
                       <section className="bg-white p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 sm:space-y-8">
                          <h4 className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-slate-400 border-b border-slate-50 pb-3 sm:pb-5 flex items-center gap-2 sm:gap-3"><Phone size={12}/> Contact Data</h4>
                          <div className="space-y-4 sm:space-y-6">
                             {[
                               { icon: Phone, label: 'Phone', val: selectedMember.phone, color: 'brand-indigo' },
                               { icon: Mail, label: 'Email', val: selectedMember.email, color: 'brand-gold' },
                               { icon: MapPin, label: 'Location', val: selectedMember.location, color: 'brand-primary' }
                             ].map((c, i) => (
                               <div key={i} className="flex items-center gap-3 sm:gap-5">
                                  <div className={`p-2.5 sm:p-4 bg-brand-${c.color}/10 text-brand-${c.color} rounded-lg sm:rounded-2xl flex-shrink-0`}><c.icon size={16} className="sm:w-5 sm:h-5"/></div>
                                  <div className="min-w-0">
                                     <p className="text-[7px] sm:text-[9px] text-slate-400 font-black uppercase tracking-widest mb-0.5 sm:mb-1">{c.label}</p>
                                     <p className="font-bold text-slate-800 text-xs sm:text-base truncate">{c.val}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </section>
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                       <section className="bg-white p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5 sm:space-y-8">
                          <h4 className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-slate-400 border-b border-slate-50 pb-3 sm:pb-5 flex items-center gap-2 sm:gap-3"><Activity size={12}/> Profile Info</h4>
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                             {[
                               { label: 'Status', val: selectedMember.status, color: 'emerald' },
                               { label: 'Family', val: selectedMember.maritalStatus, color: 'indigo' },
                               { label: 'Age', val: `${selectedMember.age || 'N/A'} yrs`, color: 'gold' },
                               { label: 'Gender', val: selectedMember.gender || 'N/A', color: 'primary' }
                             ].map((st, i) => (
                               <div key={i} className="p-3 sm:p-5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                                  <p className="text-[7px] sm:text-[9px] text-slate-400 font-black uppercase mb-0.5 sm:mb-1">{st.label}</p>
                                  <p className="text-[10px] sm:text-sm font-black text-slate-800">{st.val}</p>
                               </div>
                             ))}
                          </div>
                       </section>

                       <section className="bg-white p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
                          <h4 className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-slate-400 border-b border-slate-50 pb-3 flex items-center gap-2"><Layers size={12}/> Active Ministries</h4>
                          <div className="flex flex-wrap gap-2">
                             {selectedMember.groups?.map(g => (
                               <div key={g} className="px-4 py-2 bg-brand-indigo/5 border border-brand-indigo/20 text-brand-indigo rounded-xl text-xs font-black uppercase tracking-widest">{g}</div>
                             ))}
                          </div>
                       </section>
                    </div>
                 </div>
               )}

               {activeDetailTab === 'GIVING' && (
                 <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4 sm:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
                       <div className="bg-white p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                          <p className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 sm:mb-10">Total Contributions</p>
                          <div>
                             <h4 className="text-2xl sm:text-5xl font-black text-slate-800 tracking-tighter">KES {memberGivings.reduce((s, t) => s + t.amount, 0).toLocaleString()}</h4>
                             <p className="text-[7px] sm:text-[10px] font-black text-brand-emerald uppercase tracking-widest mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2"><CheckCircle2 size={10} className="sm:w-3 sm:h-3"/> System Verified</p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-brand-indigo/10 text-brand-indigo rounded-[1.5rem] shadow-sm flex-shrink-0">
                  <FileSpreadsheet size={28}/>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">Bulk Soul Import</h3>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">CSV or Excel Format (Comma Separated)</p>
                </div>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-3xl transition-all"><X size={24}/></button>
            </div>

            <div className="space-y-6">
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center text-center space-y-4 group hover:border-brand-primary transition-all">
                <Upload size={48} className="text-slate-300 group-hover:text-brand-primary transition-colors"/>
                <div>
                  <p className="text-sm font-black text-slate-600 uppercase">Drop CSV file here</p>
                  <p className="text-xs text-slate-400 mt-1">Firstname, Lastname, Phone, Location (Mandatory)</p>
                  <p className="text-[10px] text-brand-indigo font-bold mt-2 italic">* Use ';' to separate multiple groups in the Groups column</p>
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
                  className="px-8 py-3 bg-white border border-slate-200 text-brand-indigo rounded-xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-brand-indigo hover:text-white transition-all shadow-sm"
                >
                  Browse Files
                </label>
              </div>

              <div className="flex items-start gap-4 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                 <ShieldAlert className="text-brand-indigo shrink-0" size={20}/>
                 <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                   Basics required: Firstname, Lastname, Phone, and Location. Other fields will use defaults if left empty. Duplicates are matched by phone.
                 </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button onClick={handleDownloadTemplate} className="text-[10px] font-black text-brand-indigo uppercase tracking-widest hover:underline">Download CSV Template</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-center justify-center p-0 sm:p-4 lg:p-12 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-300 border border-white/20">
            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="flex flex-col h-full lg:max-h-[90vh]">
              <div className="p-8 sm:p-12 bg-slate-50 border-b border-slate-100 flex justify-between items-center relative overflow-hidden flex-shrink-0">
                <div className="flex items-center gap-6 relative z-10">
                  <div className="p-4 bg-brand-primary text-white rounded-[1.5rem] shadow-xl">
                    {showAddModal ? <UserPlus size={28}/> : <Edit2 size={28}/>}
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-4xl font-black text-slate-800 uppercase tracking-tight">{showAddModal ? 'Register New Soul' : 'Update Profile'}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Stewardship Integrity Framework</p>
                  </div>
                </div>
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(null); setFormData({ groups: [] }); setPhoto(null); }} className="relative z-10 p-4 hover:bg-white rounded-2xl transition-all text-slate-400"><X size={28}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 sm:p-12 lg:p-16 space-y-12 no-scrollbar">
                <div className="flex flex-col lg:flex-row gap-12">
                   <div className="lg:w-1/3 space-y-8">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Member Portrait</label>
                        <div className="aspect-square w-full rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                           {photo ? (
                              <div className="relative w-full h-full">
                                <img src={photo} className="w-full h-full object-cover" alt="Member" />
                                <button type="button" onClick={() => setPhoto(null)} className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-xl backdrop-blur-md hover:bg-rose-500 transition-colors"><Trash2 size={16}/></button>
                              </div>
                           ) : (
                              <div className="text-center p-8 space-y-4">
                                <div className="p-5 bg-white rounded-2xl shadow-sm text-slate-200 inline-block"><ImageIcon size={48}/></div>
                                <div className="space-y-2">
                                   <input 
                                     type="file" 
                                     accept="image/*" 
                                     className="hidden" 
                                     id="member-photo-input" 
                                     onChange={handleFileChange}
                                     ref={fileInputRef}
                                   />
                                   <label 
                                     htmlFor="member-photo-input"
                                     className="text-xs font-black text-brand-indigo uppercase tracking-widest hover:underline block w-full cursor-pointer"
                                   >
                                     Upload Portrait
                                   </label>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase">JPEG, PNG, Max 5MB</p>
                                </div>
                              </div>
                           )}
                        </div>
                      </div>
                      
                      <div className="space-y-4 p-6 bg-slate-100/50 rounded-[2rem] border border-slate-200">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Assigned Ministries</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 no-scrollbar">
                           {allPossibleGroups.map(group => {
                             const isSelected = formData.groups?.includes(group);
                             return (
                               <button 
                                 key={group}
                                 type="button"
                                 onClick={() => toggleGroupSelection(group)}
                                 className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected ? 'bg-brand-indigo text-white border-brand-indigo shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-brand-indigo'}`}
                               >
                                  <span className="text-[10px] font-black uppercase truncate">{group}</span>
                                  {isSelected ? <Check size={14}/> : <Plus size={14} className="text-slate-300"/>}
                               </button>
                             );
                           })}
                        </div>
                      </div>
                   </div>

                   <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">First Name</label>
                        <input required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none shadow-sm" placeholder="e.g. David" value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Last Name</label>
                        <input required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none shadow-sm" placeholder="e.g. Ochieng" value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Phone Number</label>
                        <input required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none shadow-sm" placeholder="07XX XXX XXX" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Residential Hub</label>
                        <input required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none shadow-sm" placeholder="e.g. Westlands" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Identity Type</label>
                        <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none shadow-sm" value={formData.membershipType} onChange={e => setFormData({...formData, membershipType: e.target.value as MembershipType})}>
                          {Object.values(MembershipType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Reporting Status</label>
                        <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none shadow-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as MemberStatus})}>
                          {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-10 sm:p-14 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-6 flex-shrink-0">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(null); setFormData({ groups: [] }); }} className="flex-1 py-6 font-black text-slate-400 hover:bg-slate-50 rounded-[1.5rem] uppercase text-xs tracking-widest transition-all">Cancel Entry</button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-[2] py-6 bg-brand-primary text-white rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-primary/30 hover:bg-brand-indigo transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={24}/> : <CheckCircle2 size={24}/>} {showAddModal ? 'Confirm Registration' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[700] flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-md shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-200 text-center border border-white/20">
               <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                  <ShieldAlert size={48}/>
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-tight">Critical Action Required</h3>
                  <p className="text-slate-500 font-medium text-base leading-relaxed px-4">You are about to terminate the spiritual record for <span className="text-slate-900 font-black">{showDeleteConfirm.firstName} {showDeleteConfirm.lastName}</span>. This action is irreversible.</p>
               </div>
               <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => { onDeleteMember(showDeleteConfirm.id); setShowDeleteConfirm(null); }}
                    className="w-full py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-600 transition-all"
                  >
                    Confirm Termination
                  </button>
                  <button onClick={() => setShowDeleteConfirm(null)} className="w-full py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel & Return</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Membership;
