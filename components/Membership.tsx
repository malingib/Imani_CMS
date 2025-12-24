
import React, { useState, useRef, useMemo } from 'react';
import { 
  Search, Plus, MoreHorizontal, Filter, Mail, Phone, MapPin, 
  MessageCircle, X, Camera, Check, User, Send, Eye,
  Calendar, Wallet, CheckCircle2, Map, ExternalLink,
  Lock, Smartphone, Trash2, Edit2, AlertTriangle
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
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState<'OVERVIEW' | 'GIVING' | 'ATTENDANCE'>('OVERVIEW');
  
  // Member Form State
  const [newMember, setNewMember] = useState<Partial<Member>>({
    status: MemberStatus.ACTIVE,
    membershipType: MembershipType.FULL,
    maritalStatus: MaritalStatus.SINGLE
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const groups = Array.from(new Set(members.map(m => m.group)));

  const filteredMembers = members.filter(m => {
    const matchesSearch = `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesGroup = groupFilter === 'All' || m.group === groupFilter;
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const memberGivings = useMemo(() => {
    if (!selectedMember) return [];
    return transactions.filter(t => t.memberId === selectedMember.id);
  }, [selectedMember, transactions]);

  const memberAttendance = useMemo(() => {
    if (!selectedMember) return [];
    return events.filter(e => e.attendance.includes(selectedMember.id));
  }, [selectedMember, events]);

  const startCamera = async () => {
    setIsCameraActive(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
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

  const handleSendSMS = () => {
    alert(`Sending SMS to ${filteredMembers.length} members: "${smsMessage}"`);
    setShowSMSModal(false);
    setSmsMessage('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase">Congregation Directory</h2>
          <p className="text-slate-500 mt-1 text-sm sm:text-lg font-medium">Manage spiritual family records with efficiency.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {currentUserRole !== UserRole.MEMBER && (
            <>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-black hover:bg-brand-primary-700 transition-all shadow-lg shadow-indigo-200"
              >
                <Plus size={18} /> <span className="text-sm">Add Member</span>
              </button>
              <button 
                onClick={() => setShowSMSModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
              >
                <MessageCircle size={18} className="text-brand-secondary" /> <span className="text-sm">Bulk SMS</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search congregation..." 
              className="w-full pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            <select 
              className="px-4 py-3 border border-slate-200 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase bg-white outline-none shrink-0"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Statuses</option>
              {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              className="px-4 py-3 border border-slate-200 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase bg-white outline-none shrink-0"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="All">Groups</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 text-[9px] sm:text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-6 sm:px-8 py-4 sm:py-5">Souls</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Contact & Location</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Ministry</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Status</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-6 sm:px-8 py-4 sm:py-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-brand-primary/10 overflow-hidden bg-slate-100 shadow-sm flex-shrink-0">
                        {member.photo ? <img src={member.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-300" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 leading-tight truncate text-sm sm:text-base">{member.firstName} {member.lastName}</p>
                        <p className="text-[9px] sm:text-[10px] text-brand-primary font-black uppercase mt-0.5 sm:mt-1 truncate">{member.membershipType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 sm:px-8 py-4 sm:py-6">
                    <div className="space-y-0.5 sm:space-y-1">
                      <p className="text-xs sm:text-sm text-slate-700 font-bold">{member.phone}</p>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                        <MapPin size={10} className="text-brand-primary" /> {member.location}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 sm:px-8 py-4 sm:py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-primary" />
                      <span className="text-xs sm:text-sm font-bold text-slate-600">{member.group}</span>
                    </div>
                  </td>
                  <td className="px-6 sm:px-8 py-4 sm:py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                      member.status === MemberStatus.ACTIVE ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 sm:px-8 py-4 sm:py-6 text-right relative">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                       <button 
                        onClick={() => { setSelectedMember(member); setActiveDetailTab('OVERVIEW'); }}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-50 text-brand-primary rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                       >
                         <Eye size={12} /> <span className="hidden sm:inline">View</span>
                       </button>
                       {currentUserRole !== UserRole.MEMBER && (
                         <div className="relative">
                            <button 
                              onClick={() => setOpenActionMenuId(openActionMenuId === member.id ? null : member.id)}
                              className={`p-2 rounded-lg transition-colors ${openActionMenuId === member.id ? 'bg-slate-200 text-slate-900' : 'text-slate-300 hover:text-slate-600'}`}
                            >
                                <MoreHorizontal size={18} />
                            </button>
                            {openActionMenuId === member.id && (
                              <div className="absolute right-0 top-full mt-2 w-44 sm:w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <button 
                                  onClick={() => { setShowEditModal(member); setOpenActionMenuId(null); }}
                                  className="w-full text-left px-5 py-3 text-xs font-bold text-slate-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors border-b border-slate-50"
                                >
                                  <Edit2 size={14} className="text-brand-primary"/> Edit Record
                                </button>
                                <button 
                                  onClick={() => { setShowDeleteConfirm(member); setOpenActionMenuId(null); }}
                                  className="w-full text-left px-5 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                                >
                                  <Trash2 size={14} className="text-rose-500"/> Delete Member
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

      {/* Details/Forms Modals */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-0 sm:p-4 lg:p-12">
          <div className="bg-white rounded-none sm:rounded-[3rem] w-full max-w-5xl h-full lg:max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 lg:p-12 bg-brand-solid text-white relative overflow-hidden flex-shrink-0">
               <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] bg-white p-1 shadow-2xl relative flex-shrink-0">
                       {selectedMember.photo ? <img src={selectedMember.photo} className="w-full h-full object-cover rounded-[1.2rem] sm:rounded-[1.8rem]" /> : <div className="w-full h-full bg-slate-100 rounded-[1.2rem] sm:rounded-[1.8rem] flex items-center justify-center text-slate-300"><User size={30}/></div>}
                       <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-1.5 sm:p-2 bg-brand-gold rounded-lg sm:rounded-xl border-2 sm:border-4 border-brand-solid">
                          <CheckCircle2 size={14} className="text-white" />
                       </div>
                    </div>
                    <div className="min-w-0">
                       <h3 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight truncate uppercase">{selectedMember.firstName} {selectedMember.lastName}</h3>
                       <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 sm:mt-2">
                          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/70 bg-white/10 px-2 sm:px-3 py-1 rounded-lg border border-white/10">{selectedMember.membershipType}</span>
                          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-brand-gold">Since {new Date(selectedMember.joinDate).getFullYear()}</span>
                       </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedMember(null)} className="absolute top-0 right-0 sm:relative p-3 sm:p-4 bg-white/10 hover:bg-rose-500 transition-all rounded-bl-3xl sm:rounded-[1.5rem] border-b border-l sm:border border-white/10">
                    <X size={20} className="sm:w-6 sm:h-6"/>
                  </button>
               </div>
               <div className="absolute bottom-0 left-0 w-full flex border-t border-white/10 bg-black/20 backdrop-blur-md px-4 sm:px-12 pt-2 sm:pt-4 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'OVERVIEW', label: 'Overview', icon: User },
                    { id: 'GIVING', label: 'History', icon: Wallet },
                    { id: 'ATTENDANCE', label: 'Service', icon: Calendar }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveDetailTab(tab.id as any)}
                      className={`px-4 sm:px-8 pb-3 sm:pb-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b-2 sm:border-b-4 transition-all whitespace-nowrap ${activeDetailTab === tab.id ? 'border-brand-gold text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                    >
                      <tab.icon size={12} className="sm:w-4 sm:h-4"/> {tab.label}
                    </button>
                  ))}
               </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 no-scrollbar bg-slate-50/50">
               {activeDetailTab === 'OVERVIEW' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 animate-in fade-in duration-500">
                    <div className="space-y-4 sm:space-y-8">
                       <section className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 sm:space-y-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-3">Contact Details</h4>
                          <div className="space-y-4">
                             {[
                               { icon: Phone, label: 'Phone', val: selectedMember.phone },
                               { icon: Mail, label: 'Email', val: selectedMember.email },
                               { icon: MapPin, label: 'Home', val: selectedMember.location }
                             ].map((c, i) => (
                               <div key={i} className="flex items-center gap-3 sm:gap-4">
                                  <div className="p-2.5 sm:p-3 bg-indigo-50 text-brand-primary rounded-xl flex-shrink-0"><c.icon size={16}/></div>
                                  <div className="min-w-0"><p className="text-[9px] text-slate-400 font-black uppercase">{c.label}</p><p className="font-bold text-slate-800 text-sm sm:text-base truncate">{c.val}</p></div>
                               </div>
                             ))}
                          </div>
                       </section>
                       <section className="bg-brand-solid p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] text-white shadow-xl flex items-center justify-between">
                          <div>
                             <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Region Hub</h5>
                             <p className="text-lg sm:text-xl font-bold mt-1 leading-tight">{selectedMember.location} Outreach</p>
                          </div>
                          <Map size={28} className="text-white/30 hidden sm:block" />
                       </section>
                    </div>

                    <div className="space-y-4 sm:space-y-8">
                       <section className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4 sm:space-y-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-3">Personal & Ministry</h4>
                          <div className="grid grid-cols-2 gap-3 sm:gap-6">
                             {[
                               { label: 'Status', val: selectedMember.status },
                               { label: 'Marital', val: selectedMember.maritalStatus }
                             ].map((st, i) => (
                               <div key={i} className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl">
                                  <p className="text-[9px] text-slate-400 font-black uppercase mb-1">{st.label}</p>
                                  <p className="text-xs sm:text-sm font-bold text-slate-800">{st.val}</p>
                               </div>
                             ))}
                             <div className="col-span-2 p-4 sm:p-6 bg-indigo-50 border border-indigo-100 rounded-xl sm:rounded-2xl">
                                <div className="flex justify-between items-center">
                                   <div>
                                      <p className="text-[9px] text-brand-primary font-black uppercase mb-1">Primary Fellowship</p>
                                      <p className="text-base sm:text-lg font-black text-brand-primary leading-tight">{selectedMember.group}</p>
                                   </div>
                                   <div className="p-2 sm:p-3 bg-white text-brand-primary rounded-lg sm:rounded-xl shadow-sm"><ExternalLink size={14}/></div>
                                </div>
                             </div>
                          </div>
                       </section>
                       <div className="p-6 sm:p-8 bg-emerald-50 rounded-[1.5rem] sm:rounded-[2.5rem] border border-emerald-100 flex items-center gap-4 sm:gap-6">
                          <div className="p-3 sm:p-4 bg-white text-emerald-600 rounded-xl sm:rounded-2xl shadow-sm flex-shrink-0"><CheckCircle2 size={24}/></div>
                          <div>
                             <h5 className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Compliance</h5>
                             <p className="text-xs sm:text-sm font-bold text-emerald-900">Soul is active and engaged.</p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {activeDetailTab === 'GIVING' && (
                 <div className="animate-in slide-in-from-bottom-2 duration-400 space-y-6 sm:space-y-8">
                    {currentUserRole === UserRole.MEMBER && selectedMember.id !== transactions[0]?.memberId ? (
                      <div className="p-10 sm:p-20 text-center space-y-4 bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100">
                         <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-brand-primary">
                            <Lock size={30}/>
                         </div>
                         <h4 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Financial Privacy Restrict</h4>
                         <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-sm mx-auto">Treasury data is protected. Only admins can view records for other members.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                           <div className="bg-white p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 sm:mb-8">Total Contributions</h4>
                              <p className="text-3xl sm:text-5xl font-black text-slate-800 tracking-tighter">KES {memberGivings.reduce((s, t) => s + t.amount, 0).toLocaleString()}</p>
                              <div className="mt-6 sm:mt-8 flex gap-2">
                                 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-lg">Faithful</span>
                              </div>
                           </div>
                           <div className="bg-brand-primary p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] text-white shadow-xl">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-6 sm:mb-8">Primary Method</h4>
                              <div className="flex items-center gap-3 sm:gap-4">
                                 <div className="p-3 sm:p-4 bg-white/10 rounded-xl sm:rounded-2xl"><Smartphone size={24} className="text-brand-gold"/></div>
                                 <p className="text-xl sm:text-2xl font-black">M-Pesa Webhook</p>
                              </div>
                           </div>
                        </div>

                        <div className="bg-white rounded-[1rem] sm:rounded-[2rem] border border-slate-100 overflow-x-auto shadow-sm">
                           <table className="w-full text-left min-w-[500px]">
                              <thead className="bg-slate-50 text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                                 <tr>
                                    <th className="px-6 sm:px-8 py-3 sm:py-4">Reference</th>
                                    <th className="px-6 sm:px-8 py-3 sm:py-4">Date</th>
                                    <th className="px-6 sm:px-8 py-3 sm:py-4 text-right">Amount</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {memberGivings.length > 0 ? memberGivings.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                       <td className="px-6 sm:px-8 py-3 sm:py-4 font-mono text-[10px] text-brand-primary font-bold">{t.reference}</td>
                                       <td className="px-6 sm:px-8 py-3 sm:py-4 text-xs font-bold text-slate-600">{t.date}</td>
                                       <td className="px-6 sm:px-8 py-3 sm:py-4 text-right font-black text-slate-800 text-sm">KES {t.amount.toLocaleString()}</td>
                                    </tr>
                                 )) : (
                                    <tr><td colSpan={3} className="px-8 py-16 text-center text-slate-300 font-bold">No records found.</td></tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                      </>
                    )}
                 </div>
               )}

               {activeDetailTab === 'ATTENDANCE' && (
                 <div className="animate-in slide-in-from-bottom-2 duration-400 space-y-6 sm:space-y-8">
                    <div className="bg-white p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[3rem] border border-slate-100 shadow-sm">
                       <h4 className="text-xl sm:text-2xl font-black text-slate-800 mb-6 sm:mb-8 flex items-center gap-3"><Calendar className="text-brand-primary" size={22}/> Presence Logs</h4>
                       <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
                          {[
                            { val: memberAttendance.length, label: 'Services', color: 'brand-primary' },
                            { val: '85%', label: 'Consistency', color: 'brand-primary' },
                            { val: 5, label: 'Months', color: 'emerald' }
                          ].map((st, i) => (
                            <div key={i} className="p-4 sm:p-6 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 text-center">
                              <p className={`text-xl sm:text-3xl font-black ${st.color === 'brand-primary' ? 'text-brand-primary' : 'text-emerald-600'}`}>{st.val}</p>
                              <p className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400 mt-1">{st.label}</p>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="bg-white rounded-[1rem] sm:rounded-[2rem] border border-slate-100 overflow-x-auto shadow-sm">
                       <table className="w-full text-left min-w-[500px]">
                          <thead className="bg-slate-50 text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                             <tr>
                                <th className="px-6 sm:px-8 py-3 sm:py-4">Service</th>
                                <th className="px-6 sm:px-8 py-3 sm:py-4">Date</th>
                                <th className="px-6 sm:px-8 py-3 sm:py-4 text-right">Status</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {memberAttendance.length > 0 ? memberAttendance.map(e => (
                                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                                   <td className="px-6 sm:px-8 py-4 sm:py-5">
                                      <p className="font-bold text-slate-800 text-sm">{e.title}</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{e.location}</p>
                                   </td>
                                   <td className="px-6 sm:px-8 py-4 sm:py-5 text-xs font-bold text-slate-600 whitespace-nowrap">{e.date}</td>
                                   <td className="px-6 sm:px-8 py-4 sm:py-5 text-right">
                                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-lg">Present</span>
                                   </td>
                                </tr>
                             )) : (
                                <tr><td colSpan={3} className="px-8 py-16 text-center text-slate-300 font-bold">No logs yet.</td></tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
               )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 sm:p-8 lg:p-12 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-solid rounded-lg flex items-center justify-center text-white text-[8px] sm:text-[10px] font-black">I</div>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">Intelligent Soul Profile</p>
               </div>
               <div className="flex w-full sm:w-auto gap-2 sm:gap-4">
                  <button onClick={() => setSelectedMember(null)} className="flex-1 sm:flex-none px-6 sm:px-10 py-3 sm:py-4 bg-slate-100 text-slate-600 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Dismiss</button>
                  {currentUserRole !== UserRole.MEMBER && (
                    <button 
                      onClick={() => { setShowEditModal(selectedMember); setSelectedMember(null); }}
                      className="flex-1 sm:flex-none px-6 sm:px-10 py-3 sm:py-4 bg-brand-primary text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      Modify
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
