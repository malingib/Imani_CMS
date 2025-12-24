
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
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Congregation Directory</h2>
          <p className="text-slate-500 mt-1 text-lg font-medium">Manage and view the spiritual family of Imani Parish.</p>
        </div>
        <div className="flex gap-3">
          {currentUserRole !== UserRole.MEMBER && (
            <>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                <Plus size={20} /> Add Member
              </button>
              <button 
                onClick={() => setShowSMSModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
              >
                <MessageCircle size={20} className="text-emerald-500" /> Bulk SMS
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, phone or location..." 
              className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="px-4 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase bg-white outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              className="px-4 py-3 border border-slate-200 rounded-2xl text-xs font-black uppercase bg-white outline-none"
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="All">All Groups</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Member Information</th>
                <th className="px-8 py-5">Contact & Location</th>
                <th className="px-8 py-5">Ministry Group</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl border-2 border-indigo-50 overflow-hidden bg-slate-100 shadow-sm">
                        {member.photo ? <img src={member.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-300" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 leading-tight">{member.firstName} {member.lastName}</p>
                        <p className="text-[10px] text-indigo-600 font-black uppercase mt-1">{member.membershipType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-700 font-bold">{member.phone}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                        <MapPin size={10} className="text-rose-400" /> {member.location}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-sm font-bold text-slate-600">{member.group}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      member.status === MemberStatus.ACTIVE ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => { setSelectedMember(member); setActiveDetailTab('OVERVIEW'); }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                       >
                         <Eye size={14} /> View
                       </button>
                       {currentUserRole !== UserRole.MEMBER && (
                         <div className="relative">
                            <button 
                              onClick={() => setOpenActionMenuId(openActionMenuId === member.id ? null : member.id)}
                              className={`p-2 rounded-lg transition-colors ${openActionMenuId === member.id ? 'bg-slate-200 text-slate-900' : 'text-slate-300 hover:text-slate-600'}`}
                            >
                                <MoreHorizontal size={20} />
                            </button>
                            {openActionMenuId === member.id && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <button 
                                  onClick={() => { setShowEditModal(member); setOpenActionMenuId(null); }}
                                  className="w-full text-left px-5 py-3 text-xs font-bold text-slate-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors border-b border-slate-50"
                                >
                                  <Edit2 size={14} className="text-indigo-600"/> Edit Record
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[250] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="p-6 bg-rose-50 text-rose-600 rounded-full">
                <AlertTriangle size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">Delete Record?</h3>
                <p className="text-slate-500 mt-2 font-medium">Are you sure you want to remove <span className="font-bold text-slate-800">{showDeleteConfirm.firstName} {showDeleteConfirm.lastName}</span>? This action is permanent.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">Cancel</button>
              <button 
                onClick={() => {
                  onDeleteMember(showDeleteConfirm.id);
                  setShowDeleteConfirm(null);
                }}
                className="flex-1 py-4 font-black bg-rose-600 text-white rounded-2xl shadow-xl hover:bg-rose-700 transition-all"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member 360 View Modal (Modified with better scroll behavior) */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4 lg:p-12">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl h-full lg:max-h-[85vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="p-8 lg:p-12 bg-indigo-950 text-white relative overflow-hidden flex-shrink-0">
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl relative">
                       {selectedMember.photo ? <img src={selectedMember.photo} className="w-full h-full object-cover rounded-[1.8rem]" /> : <div className="w-full h-full bg-slate-100 rounded-[1.8rem] flex items-center justify-center text-slate-300"><User size={40}/></div>}
                       <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-xl border-4 border-indigo-950">
                          <CheckCircle2 size={16} className="text-white" />
                       </div>
                    </div>
                    <div>
                       <h3 className="text-3xl lg:text-4xl font-black tracking-tight">{selectedMember.firstName} {selectedMember.lastName}</h3>
                       <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 bg-white/10 px-3 py-1 rounded-lg border border-white/10">{selectedMember.membershipType}</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Joined {new Date(selectedMember.joinDate).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedMember(null)} className="p-4 bg-white/10 hover:bg-rose-500 transition-all rounded-[1.5rem] border border-white/10">
                    <X size={24}/>
                  </button>
               </div>
               <div className="absolute bottom-0 left-0 w-full flex border-t border-white/10 bg-black/20 backdrop-blur-md px-12 pt-4">
                  {[
                    { id: 'OVERVIEW', label: 'Overview', icon: User },
                    { id: 'GIVING', label: 'Giving History', icon: Wallet },
                    { id: 'ATTENDANCE', label: 'Attendance', icon: Calendar }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveDetailTab(tab.id as any)}
                      className={`px-8 pb-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b-4 transition-all ${activeDetailTab === tab.id ? 'border-indigo-400 text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                    >
                      <tab.icon size={14}/> {tab.label}
                    </button>
                  ))}
               </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar bg-slate-50/50">
               {activeDetailTab === 'OVERVIEW' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
                    <div className="space-y-8">
                       <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">Contact Details</h4>
                          <div className="space-y-4">
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Phone size={18}/></div>
                                <div><p className="text-[10px] text-slate-400 font-black uppercase">Phone Number</p><p className="font-bold text-slate-800">{selectedMember.phone}</p></div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Mail size={18}/></div>
                                <div><p className="text-[10px] text-slate-400 font-black uppercase">Email Address</p><p className="font-bold text-slate-800">{selectedMember.email}</p></div>
                             </div>
                             <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><MapPin size={18}/></div>
                                <div><p className="text-[10px] text-slate-400 font-black uppercase">Home Location</p><p className="font-bold text-slate-800">{selectedMember.location}</p></div>
                             </div>
                          </div>
                       </section>
                       <section className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-xl flex items-center justify-between">
                          <div>
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Outreach Center</h5>
                             <p className="text-xl font-bold mt-1">{selectedMember.location} Parish Hub</p>
                          </div>
                          <Map size={32} className="text-indigo-400 opacity-50" />
                       </section>
                    </div>

                    <div className="space-y-8">
                       <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                          <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">Personal & Group</h4>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Status</p>
                                <p className="text-sm font-bold text-slate-800">{selectedMember.status}</p>
                             </div>
                             <div className="p-4 bg-slate-50 rounded-2xl">
                                <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Marital</p>
                                <p className="text-sm font-bold text-slate-800">{selectedMember.maritalStatus}</p>
                             </div>
                             <div className="col-span-2 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                <div className="flex justify-between items-center">
                                   <div>
                                      <p className="text-[10px] text-indigo-400 font-black uppercase mb-1">Primary Fellowship</p>
                                      <p className="text-lg font-black text-indigo-900">{selectedMember.group}</p>
                                   </div>
                                   <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm"><ExternalLink size={16}/></div>
                                </div>
                             </div>
                          </div>
                       </section>
                       <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center gap-6">
                          <div className="p-4 bg-white text-emerald-600 rounded-2xl shadow-sm"><CheckCircle2 size={24}/></div>
                          <div>
                             <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Compliance Status</h5>
                             <p className="text-sm font-bold text-emerald-900">Member is in Good Standing (Active)</p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {activeDetailTab === 'GIVING' && (
                 <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                    {currentUserRole === UserRole.MEMBER && selectedMember.id !== transactions[0]?.memberId ? (
                      <div className="p-20 text-center space-y-4 bg-white rounded-[3rem] border border-slate-100">
                         <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                            <Lock size={40}/>
                         </div>
                         <h4 className="text-2xl font-black text-slate-800 tracking-tight">Financial Privacy Restrict</h4>
                         <p className="text-slate-500 font-medium max-w-sm mx-auto">Directory access for members excludes financial data of other members. Only admins and treasurers can view these records.</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Lifetime Contribution</h4>
                              <p className="text-5xl font-black text-slate-800 tracking-tighter">KES {memberGivings.reduce((s, t) => s + t.amount, 0).toLocaleString()}</p>
                              <div className="mt-8 flex gap-2">
                                 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg">Faithful Giver</span>
                              </div>
                           </div>
                           <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-xl">
                              <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-8">Preferred Method</h4>
                              <div className="flex items-center gap-4">
                                 <div className="p-4 bg-white/10 rounded-2xl"><Smartphone size={32} className="text-emerald-400"/></div>
                                 <p className="text-2xl font-black">M-Pesa Webhook</p>
                              </div>
                              <p className="text-xs text-indigo-200 mt-4 opacity-70">Used in 92% of all transactions.</p>
                           </div>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                           <table className="w-full text-left">
                              <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                                 <tr>
                                    <th className="px-8 py-4">Ref ID</th>
                                    <th className="px-8 py-4">Date</th>
                                    <th className="px-8 py-4">Type</th>
                                    <th className="px-8 py-4 text-right">Amount</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {memberGivings.length > 0 ? memberGivings.map(t => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                       <td className="px-8 py-4 font-mono text-[10px] text-indigo-600 font-bold">{t.reference}</td>
                                       <td className="px-8 py-4 text-xs font-bold text-slate-600">{t.date}</td>
                                       <td className="px-8 py-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase">{t.type}</span></td>
                                       <td className="px-8 py-4 text-right font-black text-slate-800">KES {t.amount.toLocaleString()}</td>
                                    </tr>
                                 )) : (
                                    <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-bold">No giving records found.</td></tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                      </>
                    )}
                 </div>
               )}

               {activeDetailTab === 'ATTENDANCE' && (
                 <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                       <h4 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3"><Calendar className="text-indigo-600" size={24}/> Service Presence</h4>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                             <p className="text-3xl font-black text-indigo-600">{memberAttendance.length}</p>
                             <p className="text-[10px] font-black uppercase text-slate-400 mt-2">Services Attended</p>
                          </div>
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                             <p className="text-3xl font-black text-indigo-600">85%</p>
                             <p className="text-[10px] font-black uppercase text-slate-400 mt-2">Consistency Rate</p>
                          </div>
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                             <p className="text-3xl font-black text-emerald-600">5</p>
                             <p className="text-[10px] font-black uppercase text-slate-400 mt-2">Months Active</p>
                          </div>
                       </div>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                       <table className="w-full text-left">
                          <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
                             <tr>
                                <th className="px-8 py-4">Event / Service Name</th>
                                <th className="px-8 py-4">Date & Time</th>
                                <th className="px-8 py-4 text-right">Status</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                             {memberAttendance.length > 0 ? memberAttendance.map(e => (
                                <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                                   <td className="px-8 py-5">
                                      <p className="font-bold text-slate-800">{e.title}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase">{e.location}</p>
                                   </td>
                                   <td className="px-8 py-5 text-xs font-bold text-slate-600">{e.date} • {e.time}</td>
                                   <td className="px-8 py-5 text-right">
                                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-lg">Present</span>
                                   </td>
                                </tr>
                             )) : (
                                <tr><td colSpan={3} className="px-8 py-20 text-center text-slate-300 font-bold">No attendance logs available.</td></tr>
                             )}
                          </tbody>
                       </table>
                    </div>
                 </div>
               )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 lg:p-12 border-t border-slate-100 bg-white flex justify-between items-center flex-shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black">I</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Member Intelligence Profile</p>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setSelectedMember(null)} className="px-10 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Close Profile</button>
                  {currentUserRole !== UserRole.MEMBER && (
                    <button 
                      onClick={() => { setShowEditModal(selectedMember); setSelectedMember(null); }}
                      className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                    >
                      Edit Record
                    </button>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{showEditModal ? 'Edit Member Profile' : 'Add New Member'}</h3>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(null); }} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto no-scrollbar">
              {/* Photo Upload Section */}
              <div className="md:col-span-2 flex flex-col items-center gap-4 bg-slate-50 p-8 rounded-[2.5rem] border border-dashed border-slate-200 group">
                {isCameraActive ? (
                  <div className="relative w-48 h-48 rounded-[2rem] overflow-hidden bg-black shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    <button onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-4 rounded-full shadow-2xl text-indigo-600 hover:scale-110 transition-transform"><Check size={24}/></button>
                  </div>
                ) : (
                  <div className="relative w-48 h-48 rounded-[2rem] overflow-hidden bg-white border-4 border-white shadow-2xl flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                    {(photo || (showEditModal && showEditModal.photo)) ? <img src={photo || showEditModal?.photo} className="w-full h-full object-cover" /> : <User size={64} className="text-slate-200" />}
                    <button onClick={startCamera} className="absolute bottom-3 right-3 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-colors"><Camera size={20}/></button>
                  </div>
                )}
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Biometric Profile Capture</p>
              </div>

              <div className="space-y-4">
                <input type="text" placeholder="First Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" defaultValue={showEditModal?.firstName} onChange={e => setNewMember({...newMember, firstName: e.target.value})} />
                <input type="text" placeholder="Last Name" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" defaultValue={showEditModal?.lastName} onChange={e => setNewMember({...newMember, lastName: e.target.value})} />
                <input type="text" placeholder="Phone (e.g. 07...)" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" defaultValue={showEditModal?.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} />
                <input type="date" placeholder="Birthday" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" defaultValue={showEditModal?.birthday} onChange={e => setNewMember({...newMember, birthday: e.target.value})} />
              </div>
              
              <div className="space-y-4">
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" defaultValue={showEditModal?.status} onChange={e => setNewMember({...newMember, status: e.target.value as MemberStatus})}>
                  {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" defaultValue={showEditModal?.membershipType} onChange={e => setNewMember({...newMember, membershipType: e.target.value as MembershipType})}>
                  {Object.values(MembershipType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" defaultValue={showEditModal?.maritalStatus} onChange={e => setNewMember({...newMember, maritalStatus: e.target.value as MaritalStatus})}>
                  {Object.values(MaritalStatus).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="text" placeholder="Fellowship/Group" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" defaultValue={showEditModal?.group} onChange={e => setNewMember({...newMember, group: e.target.value})} />
              </div>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button onClick={() => { setShowAddModal(false); setShowEditModal(null); }} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  if (showEditModal) {
                    onUpdateMember({ ...showEditModal, ...newMember, photo: photo || showEditModal.photo } as Member);
                  } else {
                    onAddMember({ ...newMember, id: Date.now().toString(), photo: photo || undefined, joinDate: new Date().toISOString() } as Member);
                  }
                  setShowAddModal(false);
                  setShowEditModal(null);
                  setPhoto(null);
                  setNewMember({});
                }}
                className="flex-1 py-4 font-black bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all"
              >
                {showEditModal ? 'Update Profile' : 'Enroll Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk SMS Modal */}
      {showSMSModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden p-10 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Bulk SMS Dispatch</h3>
              <button onClick={() => setShowSMSModal(false)} className="text-slate-400 hover:text-rose-500"><X size={20}/></button>
            </div>
            <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
              <p className="text-sm text-indigo-700 font-bold">Recipients: <span className="font-black underline">{filteredMembers.length} souls</span></p>
              <p className="text-[10px] text-indigo-400 mt-2 font-black uppercase tracking-widest">Filters: {statusFilter} • {groupFilter}</p>
            </div>
            <textarea 
              rows={5}
              placeholder="Type your ministry word here..."
              className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold text-slate-700 outline-none resize-none focus:ring-2 focus:ring-indigo-500"
              value={smsMessage}
              onChange={e => setSmsMessage(e.target.value)}
            />
            <button 
              onClick={handleSendSMS}
              className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
            >
              <Send size={20} /> Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
