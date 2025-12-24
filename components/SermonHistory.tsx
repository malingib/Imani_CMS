
import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Calendar, Clock, Search, 
  Download, Plus, History, Loader2, Sparkles, Send, Quote, Wand2
} from 'lucide-react';
import { Sermon, ChurchEvent } from '../types';
import { generateSermonOutline } from '../services/geminiService';

interface SermonHistoryProps {
  events: ChurchEvent[];
}

const SermonHistory: React.FC<SermonHistoryProps> = ({ events }) => {
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'LAB'>('HISTORY');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingSermon, setViewingSermon] = useState<Sermon | null>(null);

  // AI Lab State
  const [aiTopic, setAiTopic] = useState('');
  const [aiScripture, setAiScripture] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [sermons] = useState<Sermon[]>([
    {
      id: '1',
      title: 'Divine Favor in Your Work',
      speaker: 'Pastor John Kamau',
      date: '2023-10-25',
      time: '09:00 AM',
      scripture: 'Psalm 90:17',
      event: 'Sunday Morning Worship',
      eventId: 'ev1',
      transcript: 'Today we discuss the favor of God in our daily labor...'
    }
  ]);

  const filteredSermons = sermons.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateAI = async () => {
    if (!aiTopic || !aiScripture) return;
    setAiLoading(true);
    try {
      const outline = await generateSermonOutline(aiTopic, aiScripture);
      setAiResult(outline || 'Error generating outline.');
    } catch (error) {
      setAiResult('Failed to connect to AI service.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight text-brand-red uppercase">Ministry Hub</h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">Archive past messages or co-create with Gemini AI.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'HISTORY' ? 'bg-brand-red text-white shadow-lg' : 'text-slate-400 hover:text-brand-red'}`}
          >
            <History size={16}/> Sermon History
          </button>
          <button 
            onClick={() => setActiveTab('LAB')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'LAB' ? 'bg-brand-red text-white shadow-lg' : 'text-slate-400 hover:text-brand-red'}`}
          >
            <Sparkles size={16}/> AI Sermon Lab
          </button>
        </div>
      </div>

      {activeTab === 'HISTORY' ? (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search sermons..." 
                className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-red"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-brand-red text-white rounded-2xl font-bold hover:bg-red-700 shadow-lg"><Plus size={20}/></button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-50">
                  <th className="px-8 py-5">Message Title</th>
                  <th className="px-8 py-5">Speaker</th>
                  <th className="px-8 py-5">Scripture</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredSermons.map(sermon => (
                  <tr key={sermon.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 text-brand-red rounded-2xl"><BookOpen size={20}/></div>
                        <div>
                          <p className="font-bold text-slate-800">{sermon.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{sermon.date} • {sermon.event}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-700">{sermon.speaker}</td>
                    <td className="px-8 py-6 text-sm font-bold text-brand-red italic">{sermon.scripture}</td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-brand-red hover:underline font-black text-xs uppercase tracking-widest">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase"><Wand2 size={20} className="text-brand-red"/> Sermon Lab</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Topic / Theme</label>
                  <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-red outline-none" value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="e.g. Faith in Nairobi City" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Key Scripture</label>
                  <input type="text" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-red outline-none" value={aiScripture} onChange={e => setAiScripture(e.target.value)} placeholder="e.g. Hebrews 11:1" />
                </div>
                <button 
                  onClick={handleGenerateAI}
                  disabled={aiLoading || !aiTopic}
                  className="w-full py-4 bg-brand-red text-white rounded-2xl font-black shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                  {aiLoading ? 'Drafting...' : 'Generate AI Outline'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {aiResult ? (
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                   <h4 className="text-2xl font-black text-slate-800 uppercase">Draft Outline</h4>
                   <button className="p-3 bg-slate-50 text-slate-400 hover:text-brand-red rounded-xl transition-all"><Download size={20}/></button>
                </div>
                <div className="prose prose-red max-w-none flex-1">
                  <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-serif text-lg">
                    {aiResult}
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-400 italic text-sm">
                  <Quote size={14} /> AI-generated content should be refined by leadership.
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] h-[500px] flex flex-col items-center justify-center text-slate-300">
                <Sparkles size={64} className="mb-4 opacity-10" />
                <p className="font-bold">Co-create your next message with Gemini.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SermonHistory;
