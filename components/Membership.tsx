
import React, { useState, useRef } from 'react';
import { 
  Search, Plus, MoreHorizontal, Filter, Mail, Phone, MapPin, 
  MessageCircle, X, Camera, Check, User, Send
} from 'lucide-react';
import { Member, MemberStatus, MembershipType, MaritalStatus } from '../types';

interface MembershipProps {
  members: Member[];
  onAddMember: (member: Member) => void;
}

const Membership: React.FC<MembershipProps> = ({ members, onAddMember }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [groupFilter, setGroupFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Congregation</h2>
          <p className="text-slate-500">Manage {members.length} church members.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-md"
          >
            <Plus size={20} /> Add Member
          </button>
          <button 
            onClick={() => setShowSMSModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all"
          >
            <MessageCircle size={20} className="text-emerald-500" /> Bulk SMS
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search members..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select 
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
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
              <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Contact & Type</th>
                <th className="px-6 py-4 font-semibold">Details</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-indigo-50 overflow-hidden bg-slate-100">
                        {member.photo ? <img src={member.photo} alt="" className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-300" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin size={10} /> {member.location}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-600 font-medium">{member.phone}</p>
                      <p className="text-indigo-500 font-semibold text-xs">{member.membershipType}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <p className="text-slate-500"><span className="font-semibold">Fellowship:</span> {member.group}</p>
                      <p className="text-slate-500"><span className="font-semibold">Marital:</span> {member.maritalStatus}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.status === MemberStatus.ACTIVE ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
              <h3 className="text-xl font-bold text-slate-800">Add New Member</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              {/* Photo Upload Section */}
              <div className="md:col-span-2 flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">
                {isCameraActive ? (
                  <div className="relative w-48 h-48 rounded-full overflow-hidden bg-black">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    <button onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white p-3 rounded-full shadow-lg text-indigo-600 hover:scale-110 transition-transform"><Check/></button>
                  </div>
                ) : (
                  <div className="relative w-48 h-48 rounded-full overflow-hidden bg-slate-200 border-4 border-white shadow-md flex items-center justify-center">
                    {photo ? <img src={photo} className="w-full h-full object-cover" /> : <User size={64} className="text-slate-400" />}
                    <button onClick={startCamera} className="absolute bottom-2 right-2 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"><Camera size={18}/></button>
                  </div>
                )}
                <p className="text-xs font-semibold text-slate-500 uppercase">Profile Photo</p>
              </div>

              <div className="space-y-4">
                <input type="text" placeholder="First Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setNewMember({...newMember, firstName: e.target.value})} />
                <input type="text" placeholder="Last Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setNewMember({...newMember, lastName: e.target.value})} />
                <input type="text" placeholder="Phone (e.g. 07...)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setNewMember({...newMember, phone: e.target.value})} />
                <input type="date" placeholder="Birthday" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setNewMember({...newMember, birthday: e.target.value})} />
              </div>
              
              <div className="space-y-4">
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setNewMember({...newMember, status: e.target.value as MemberStatus})}>
                  {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setNewMember({...newMember, membershipType: e.target.value as MembershipType})}>
                  {Object.values(MembershipType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setNewMember({...newMember, maritalStatus: e.target.value as MaritalStatus})}>
                  {Object.values(MaritalStatus).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input type="text" placeholder="Fellowship/Group" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" onChange={e => setNewMember({...newMember, group: e.target.value})} />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button 
                onClick={() => {
                  onAddMember({ ...newMember, id: Date.now().toString(), photo: photo || undefined, joinDate: new Date().toISOString() } as Member);
                  setShowAddModal(false);
                  setPhoto(null);
                }}
                className="flex-1 py-3 font-bold bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
              >
                Save Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk SMS Modal */}
      {showSMSModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Bulk SMS Broadcast</h3>
              <button onClick={() => setShowSMSModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
              <p className="text-sm text-indigo-700 font-medium">Recipients: <span className="font-bold">{filteredMembers.length} members</span></p>
              <p className="text-xs text-indigo-500 mt-1">Filters: {statusFilter}, {groupFilter}</p>
            </div>
            <textarea 
              rows={5}
              placeholder="Type your message here..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              value={smsMessage}
              onChange={e => setSmsMessage(e.target.value)}
            />
            <button 
              onClick={handleSendSMS}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <Send size={18} /> Send Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;
