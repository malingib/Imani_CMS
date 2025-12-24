
import React, { useState, useRef, useMemo } from 'react';
import { 
  Search, Plus, MoreHorizontal, Filter, Mail, Phone, MapPin, 
  MessageCircle, X, Camera, Check, User, Send, Eye,
  Calendar, Wallet, CheckCircle2, Map, ExternalLink,
  Lock, Smartphone, Trash2, Edit2, AlertTriangle, Download,
  UserPlus, ShieldAlert, Loader2, ChevronRight, Activity,
  Users, Heart
} from 'lucide-react';
import { Member, MemberStatus, MembershipType, MaritalStatus, Transaction, ChurchEvent, UserRole } from '../types';

interface MembershipProps {
  members: Member[];
  onAddMember: (member: Member) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  transactions: Transaction[];
  events: ChurchEvent[];
  currentUserRole: UserRole;
}

// Messaging type helper for the SMS modal logic
interface MessagingTarget {
  id: string;
  name: string;
}

const Membership: React.FC<MembershipProps> = ({ 
  members, 
  onAddMember, 
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
  const [showEditModal, setShowEditModal] = useState<Member | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState<'OVERVIEW' | 'GIVING' | 'ATTENDANCE'>('OVERVIEW');
  const [isSaving, setIsSaving] = useState(false);
  
  const [messagingGroup, setMessagingGroup] = useState<MessagingTarget | null>(null);

  // Member Form State
  const [formData, setFormData] = useState<Partial<Member>>({
    status: MemberStatus.ACTIVE,
    membershipType: MembershipType.FULL,
    maritalStatus: MaritalStatus.SINGLE
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const groups = Array.from(new Set(members.map(m => m.group)));

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      const matchesGroup = groupFilter === 'All' || m.group === groupFilter;
      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [members, searchTerm, statusFilter, groupFilter]);

  const memberGivings = useMemo(() => {
    if (!selectedMember) return [];
    return transactions.filter(t => t.memberId === selectedMember.id);
  }, [selectedMember, transactions]);

  const memberAttendance = useMemo(() => {
    if (!selectedMember) return [];
    return events.filter(e => e.attendance.includes(selectedMember.id));
  }, [selectedMember, events]);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      alert("Camera access denied.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhoto(dataUrl);
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,First Name,Last Name,Phone,Email,Location,Group,Status,Join Date\n";
    const rows = filteredMembers.map(m => `${m.id},${m.firstName},${m.lastName},${m.phone},${m.email},${m.location},${m.group},${m.status},${m.joinDate}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `congregation_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
        group: formData.group || 'General',
        joinDate: new Date().toISOString().split('T')[0],
        photo: photo || undefined
      };
      onAddMember(newM);
      setIsSaving(false);
      setShowAddModal(false);
      setFormData({});
      setPhoto(null);
    }, 1000);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    setIsSaving(true);
    setTimeout(() => {
      onUpdateMember({ ...showEditModal, ...formData, photo: photo || showEditModal.photo });
      setIsSaving(false);
      setShowEditModal(null);
      setFormData({});
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
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {currentUserRole !== UserRole.MEMBER && (
            <>
              <button 
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-[1rem] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
              >
                <Download size={16} /> Export
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
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
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
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
                <th className="px-10 py-6">Department</th>
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
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-gold animate-pulse" />
                      <span className="text-sm font-black text-slate-600 uppercase tracking-tighter">{member.group}</span>
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
                                  onClick={() => { setMessagingGroup({id: 'm1', name: `${member.firstName} ${member.lastName}`} as any); setOpenActionMenuId(null); }}
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

      {/* Detail Modal - Improved Mobile Responsiveness & Reduced Overlap */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-0 sm:p-4 lg:p-12">
          <div className="bg-white rounded-none sm:rounded-[3rem] w-full max-w-6xl h-full lg:h-auto lg:max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Modal Header - Refined spacing and typography for mobile */}
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
               {/* Detail Tabs Scroller */}
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

            {/* Modal Body Content */}
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

                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-10">
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

                       <section className="bg-brand-primary p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                          <div className="relative z-10 space-y-3 sm:space-y-6">
                             <div className="flex justify-between items-start">
                                <div className="p-2 sm:p-3 bg-white/10 rounded-lg sm:rounded-xl"><ShieldAlert size={18} className="sm:w-6 sm:h-6"/></div>
                                <div className="text-right">
                                   <p className="text-[7px] sm:text-[10px] font-black uppercase text-indigo-300 tracking-widest">Active placement</p>
                                   <p className="text-lg sm:text-2xl font-black">{selectedMember.group}</p>
                                </div>
                             </div>
                             <div className="pt-3 sm:pt-6 border-t border-white/10">
                                <p className="text-[10px] sm:text-sm text-indigo-100/70 font-medium leading-relaxed italic">"Let us consider how we may spur one another on toward love and good deeds."</p>
                             </div>
                             <button className="w-full py-2.5 sm:py-4 bg-white text-brand-primary rounded-lg sm:rounded-2xl font-black text-[8px] sm:text-xs uppercase tracking-widest hover:bg-brand-gold transition-all">Move Department</button>
                          </div>
                          <div className="absolute top-[-10%] right-[-10%] w-24 sm:w-32 h-24 sm:w-32 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-transform"></div>
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
                       <div className="md:col-span-2 bg-white p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
                          <h4 className="text-base sm:text-xl font-black text-slate-800 mb-4 sm:mb-8 flex items-center gap-2 sm:gap-3"><Wallet className="text-brand-indigo sm:w-6 sm:h-6" size={18}/> Channels Used</h4>
                          <div className="flex flex-wrap gap-2 sm:gap-4">
                             {['M-Pesa Paybill', 'Cash Deposit', 'EFT Transfer'].map(method => (
                                <div key={method} className={`px-3 py-2 sm:px-6 sm:py-4 rounded-lg sm:rounded-2xl border-2 font-bold text-[10px] sm:text-sm ${method.includes('M-Pesa') ? 'bg-indigo-50 border-brand-indigo text-brand-indigo' : 'bg-white border-slate-100 text-slate-400'}`}>
                                   {method}
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 overflow-x-auto shadow-sm">
                       <table className="w-full text-left min-w-[500px]">
                          <thead className="bg-slate-50 text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                             <tr>
                                <th className="px-5 sm:px-10 py-3 sm:py-6">Description</th>
                                <th className="px-5 sm:px-10 py-3 sm:py-6">Ref ID</th>
                                <th className="px-5 sm:px-10 py-3 sm:py-6 text-right">Settled</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {memberGivings.length > 0 ? memberGivings.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                                   <td className="px-5 sm:px-10 py-4 sm:py-8">
                                      <p className="font-bold text-slate-700 text-[11px] sm:text-sm">{t.type}</p>
                                      <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase mt-0.5 sm:mt-1">{t.date}</p>
                                   </td>
                                   <td className="px-5 sm:px-10 py-4 sm:py-8 font-mono text-[9px] sm:text-[11px] text-brand-indigo font-black tracking-widest uppercase">{t.reference}</td>
                                   <td className="px-5 sm:px-10 py-4 sm:py-8 text-right font-black text-slate-800 text-sm sm:text-lg">KES {t.amount.toLocaleString()}</td>
                                </tr>
                             )) : (
                                <tr><td colSpan={3} className="px-5 sm:px-10 py-12 sm:py-24 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No matching records found</td></tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
               )}

               {activeDetailTab === 'ATTENDANCE' && (
                 <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-4 sm:space-y-10">
                    <div className="bg-white p-3 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-8">
                       {[
                         { val: memberAttendance.length, label: 'Services', icon: Calendar },
                         { val: '88%', label: 'Stability', icon: Activity },
                         { val: 12, label: 'Outreach', icon: MapPin },
                         { val: 'High', label: 'Vibrancy', icon: Heart }
                       ].map((st, i) => (
                         <div key={i} className="text-center p-2 sm:p-6 sm:border-r last:border-0 border-slate-50">
                            <div className="mx-auto w-8 h-8 sm:w-12 sm:h-12 bg-slate-50 rounded-lg sm:rounded-2xl flex items-center justify-center text-slate-400 mb-1 sm:mb-4"><st.icon size={16} className="sm:w-6 sm:h-6"/></div>
                            <p className="text-lg sm:text-3xl font-black text-slate-800 tracking-tighter">{st.val}</p>
                            <p className="text-[7px] sm:text-[9px] font-black uppercase text-slate-400 tracking-widest mt-0.5 sm:mt-1">{st.label}</p>
                         </div>
                       ))}
                    </div>
                    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 overflow-x-auto shadow-sm">
                       <table className="w-full text-left min-w-[500px]">
                          <thead className="bg-slate-50 text-[8px] sm:text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                             <tr>
                                <th className="px-5 sm:px-10 py-3 sm:py-6">Service Detail</th>
                                <th className="px-5 sm:px-10 py-3 sm:py-6">Date Verified</th>
                                <th className="px-5 sm:px-10 py-3 sm:py-6 text-right">Integrity</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {memberAttendance.length > 0 ? memberAttendance.map(e => (
                                <tr key={e.id} className="hover:bg-slate-50/50 transition-all">
                                   <td className="px-5 sm:px-10 py-4 sm:py-8">
                                      <p className="font-bold text-slate-700 text-[11px] sm:text-sm">{e.title}</p>
                                      <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase mt-0.5 sm:mt-1">{e.location}</p>
                                   </td>
                                   <td className="px-5 sm:px-10 py-4 sm:py-8 text-[11px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">{e.date}</td>
                                   <td className="px-5 sm:px-10 py-4 sm:py-8 text-right">
                                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-brand-emerald/10 text-brand-emerald text-[7px] sm:text-[9px] font-black uppercase rounded-md sm:rounded-lg tracking-widest">Marked Present</span>
                                   </td>
                                </tr>
                             )) : (
                                <tr><td colSpan={3} className="px-5 sm:px-10 py-12 sm:py-24 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">No Presence Logs Found</td></tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
               )}
            </div>

            {/* Modal Footer - Adaptive layout for mobile buttons */}
            <div className="p-4 sm:p-10 lg:p-14 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 flex-shrink-0">
               <div className="hidden sm:flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white text-xs font-black ring-4 ring-slate-50">I</div>
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300 mb-0.5">Global Identification System</p>
                    <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-tighter">Digital ID Secured • Encryption active</p>
                  </div>
               </div>
               <div className="flex w-full sm:w-auto gap-2 sm:gap-4">
                  <button onClick={() => setSelectedMember(null)} className="flex-1 sm:flex-none px-4 sm:px-10 py-3.5 sm:py-5 bg-slate-100 text-slate-600 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Close</button>
                  {currentUserRole !== UserRole.MEMBER && (
                    <button 
                      onClick={() => { setShowEditModal(selectedMember); setSelectedMember(null); }}
                      className="flex-[1.5] sm:flex-none px-6 sm:px-12 py-3.5 sm:py-5 bg-brand-primary text-white rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-xs uppercase tracking-widest shadow-xl sm:shadow-2xl shadow-brand-primary/30 hover:bg-brand-indigo transition-all"
                    >
                      Update Profile
                    </button>
                  )}
               </div>
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
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(null); setFormData({}); setPhoto(null); setIsCameraActive(false); }} className="relative z-10 p-4 hover:bg-white rounded-2xl transition-all text-slate-400"><X size={28}/></button>
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 sm:p-12 lg:p-16 space-y-12 no-scrollbar">
                <div className="flex flex-col lg:flex-row gap-12">
                   {/* Left Column: Photo & Basic */}
                   <div className="lg:w-1/3 space-y-8">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Member Portrait</label>
                        <div className="aspect-square w-full rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                           {isCameraActive ? (
                              <div className="relative w-full h-full">
                                <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
                                <button type="button" onClick={capturePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 p-5 bg-brand-primary text-white rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95"><Camera size={24}/></button>
                              </div>
                           ) : photo ? (
                              <div className="relative w-full h-full">
                                <img src={photo} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setPhoto(null)} className="absolute top-4 right-4 p-2 bg-black/40 text-white rounded-xl backdrop-blur-md hover:bg-rose-500 transition-colors"><Trash2 size={16}/></button>
                              </div>
                           ) : (
                              <div className="text-center p-8 space-y-4">
                                <div className="p-5 bg-white rounded-2xl shadow-sm text-slate-200 inline-block"><User size={48}/></div>
                                <div className="space-y-2">
                                   <button type="button" onClick={startCamera} className="text-xs font-black text-brand-indigo uppercase tracking-widest hover:underline block w-full">Start Camera</button>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase">PNG or JPG, Max 5MB</p>
                                </div>
                              </div>
                           )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Identity Type</label>
                        <select 
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all cursor-pointer shadow-sm"
                          value={formData.membershipType}
                          onChange={e => setFormData({...formData, membershipType: e.target.value as MembershipType})}
                        >
                          {Object.values(MembershipType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                   </div>

                   {/* Right Column: Information Form */}
                   <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">First Name</label>
                        <input 
                          required
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none shadow-sm transition-all"
                          placeholder="e.g. David"
                          value={formData.firstName}
                          onChange={e => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Last Name</label>
                        <input 
                          required
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none shadow-sm transition-all"
                          placeholder="e.g. Ochieng"
                          value={formData.lastName}
                          onChange={e => setFormData({...formData, lastName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Phone Number</label>
                        <div className="relative">
                           <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                           <input 
                            required
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none shadow-sm"
                            placeholder="07XX XXX XXX"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Email Address</label>
                        <div className="relative">
                           <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                           <input 
                            type="email"
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none shadow-sm"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Residential Hub</label>
                        <div className="relative">
                           <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                           <input 
                            required
                            className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-brand-primary outline-none shadow-sm"
                            placeholder="e.g. Westlands Outreach"
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Assigned Ministry</label>
                        <select 
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none shadow-sm"
                          value={formData.group}
                          onChange={e => setFormData({...formData, group: e.target.value})}
                        >
                          <option value="General">General Congregation</option>
                          {groups.map(g => <option key={g} value={g}>{g}</option>)}
                          <option value="New Member Class">New Member Class</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Life Status</label>
                        <select 
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none shadow-sm"
                          value={formData.maritalStatus}
                          onChange={e => setFormData({...formData, maritalStatus: e.target.value as MaritalStatus})}
                        >
                          {Object.values(MaritalStatus).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-2">Reporting Status</label>
                        <select 
                          className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none shadow-sm"
                          value={formData.status}
                          onChange={e => setFormData({...formData, status: e.target.value as MemberStatus})}
                        >
                          {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-10 sm:p-14 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-6 flex-shrink-0">
                <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(null); }} className="flex-1 py-6 font-black text-slate-400 hover:bg-slate-50 rounded-[1.5rem] uppercase text-xs tracking-widest transition-all">Cancel Entry</button>
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

      {/* Bulk SMS Modal Integration (Simplified for now) */}
      {messagingGroup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-brand-indigo/10 text-brand-indigo rounded-[1.25rem]"><Send size={24}/></div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Direct SMS</h3>
              </div>
              <button onClick={() => setMessagingGroup(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><X size={28}/></button>
            </div>
            
            <div className="space-y-8">
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <User className="text-brand-primary" size={22}/>
                    <span className="text-sm font-black text-slate-700 truncate max-w-[150px]">{messagingGroup.name}</span>
                 </div>
                 <div className="px-4 py-1 bg-white rounded-xl text-[10px] font-black text-brand-indigo uppercase tracking-widest border border-brand-indigo/10 shadow-sm">Recipient</div>
              </div>

              <div className="space-y-3">
                 <label className="text-[11px] font-black uppercase text-slate-400 ml-3 tracking-[0.2em]">Message Content</label>
                 <textarea 
                    className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] font-bold text-slate-700 outline-none resize-none focus:ring-2 focus:ring-brand-primary shadow-inner" 
                    rows={5} 
                    placeholder="Hello from Imani Central..."
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                 />
                 <div className="flex justify-end px-4">
                    <span className="text-[10px] font-black text-slate-400 tracking-widest">{smsMessage.length} / 160 Characters</span>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setMessagingGroup(null)} className="flex-1 py-5 font-black text-slate-400 hover:bg-slate-100 rounded-[1.5rem] uppercase text-xs tracking-widest">Discard</button>
                 <button 
                  onClick={() => {
                    setIsSaving(true);
                    setTimeout(() => {
                      setIsSaving(false);
                      setMessagingGroup(null);
                      setSmsMessage('');
                    }, 1500);
                  }}
                  disabled={!smsMessage || isSaving}
                  className="flex-[2] py-5 bg-brand-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-primary/30 hover:bg-brand-indigo transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                   {isSaving ? 'Dispatching...' : 'Fire Blast'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (Mobile Only) */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-20 h-20 bg-brand-primary text-white rounded-full shadow-2xl flex items-center justify-center lg:hidden hover:scale-110 active:scale-95 transition-all z-[100] ring-8 ring-slate-50"
      >
        <Plus size={32} />
      </button>
    </div>
  );
};

export default Membership;
