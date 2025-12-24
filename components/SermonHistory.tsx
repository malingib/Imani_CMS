
import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Calendar, Clock, Search, 
  Download, Plus, History, Loader2, Sparkles, Send, Quote, Wand2,
  Book, ChevronRight, Bookmark, Share2, Info
} from 'lucide-react';
import { Sermon, ChurchEvent } from '../types';
import { getBibleScriptureAndReflection } from '../services/geminiService';

interface SermonHistoryProps {
  events: ChurchEvent[];
}

const SermonHistory: React.FC<SermonHistoryProps> = ({ events }) => {
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'BIBLE'>('HISTORY');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingSermon, setViewingSermon] = useState<Sermon | null>(null);

  // Bible State
  const [bibleSearch, setBibleSearch] = useState('Matthew 5:13-16');
  const [bibleContent, setBibleContent] = useState<{ text: string, reflection: string } | null>(null);
  const [isSearchingBible, setIsSearchingBible] = useState(false);

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

  const handleBibleSearch = async () => {
    if (!bibleSearch) return;
    setIsSearchingBible(true);
    setBibleContent(null);
    try {
      const response = await getBibleScriptureAndReflection(bibleSearch);
      if (response) {
        // Simple parsing logic based on service prompt
        const textMatch = response.match(/TEXT:([\s\S]*?)REFLECTION:/);
        const reflectionMatch = response.match(/REFLECTION:([\s\S]*)/);
        
        setBibleContent({
          text: textMatch ? textMatch[1].trim() : 'Scripture text not found.',
          reflection: reflectionMatch ? reflectionMatch[1].trim() : 'Reflection not available.'
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearchingBible(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase leading-tight">Ministry Hub</h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-lg font-medium">Archive past messages or explore the Living Word.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start lg:self-center overflow-x-auto no-scrollbar max-w-full">
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'HISTORY' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}
          >
            <History size={16}/> Sermon History
          </button>
          <button 
            onClick={() => setActiveTab('BIBLE')}
            className={`px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'BIBLE' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}
          >
            <Book size={16}/> Scripture Hub
          </button>
        </div>
      </div>

      {activeTab === 'HISTORY' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Find a message..." 
                className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-xl sm:rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => setShowAddModal(true)} className="w-full sm:w-auto px-8 py-3.5 bg-brand-primary text-white rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-brand-primary-700 shadow-xl shadow-brand-primary/20 transition-all text-xs uppercase tracking-widest"><Plus size={18}/> New Archive</button>
          </div>

          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50 text-[9px] sm:text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-50">
                    <th className="px-6 sm:px-8 py-5">Message Title</th>
                    <th className="px-6 sm:px-8 py-5">Speaker</th>
                    <th className="px-6 sm:px-8 py-5">Scripture</th>
                    <th className="px-6 sm:px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSermons.map(sermon => (
                    <tr key={sermon.id} className="hover:bg-slate-50 transition-all group">
                      <td className="px-6 sm:px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 sm:p-3 bg-indigo-50 text-brand-primary rounded-xl sm:rounded-2xl flex-shrink-0"><BookOpen size={20}/></div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm sm:text-base truncate">{sermon.title}</p>
                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{sermon.date} • {sermon.event}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 sm:px-8 py-6 text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">{sermon.speaker}</td>
                      <td className="px-6 sm:px-8 py-6 text-xs sm:text-sm font-bold text-brand-primary italic whitespace-nowrap">{sermon.scripture}</td>
                      <td className="px-6 sm:px-8 py-6 text-right">
                        <button className="text-brand-primary hover:underline font-black text-[10px] uppercase tracking-widest">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
          {/* Left Panel: Search and Quick Access */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-2xl">
                    <Book size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Living Word</h3>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Search Reference</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-xl sm:rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none shadow-inner text-sm"
                          value={bibleSearch}
                          onChange={e => setBibleSearch(e.target.value)}
                          placeholder="e.g. John 1:1"
                          onKeyDown={(e) => e.key === 'Enter' && handleBibleSearch()}
                        />
                        <button 
                          onClick={handleBibleSearch}
                          disabled={isSearchingBible || !bibleSearch}
                          className="p-4 bg-brand-primary text-white rounded-xl sm:rounded-2xl hover:bg-brand-primary-700 transition-all disabled:opacity-50 shadow-lg"
                        >
                          {isSearchingBible ? <Loader2 className="animate-spin" size={20}/> : <ChevronRight size={20}/>}
                        </button>
                      </div>
                   </div>

                   <div className="space-y-2 pt-4">
                      <p className="text-[10px] font-black uppercase text-slate-300 ml-2 tracking-widest">Saved Highlights</p>
                      <div className="space-y-2">
                         {[
                           { ref: 'Isaiah 40:31', tag: 'Strength' },
                           { ref: 'Psalm 23:1', tag: 'Peace' },
                           { ref: 'Galatians 5:22', tag: 'Fruit' }
                         ].map(item => (
                           <button 
                            key={item.ref}
                            onClick={() => { setBibleSearch(item.ref); setTimeout(handleBibleSearch, 100); }}
                            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all group"
                           >
                              <span className="text-sm font-bold text-slate-600 group-hover:text-brand-primary">{item.ref}</span>
                              <span className="text-[8px] font-black uppercase bg-white px-2 py-0.5 rounded-full text-slate-400 border border-slate-50">{item.tag}</span>
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-brand-primary p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-3">
                      <Sparkles className="text-brand-gold" size={20}/>
                      <h4 className="font-black uppercase tracking-tight text-sm">Bible AI Insight</h4>
                   </div>
                   <p className="text-xs text-indigo-100 leading-relaxed font-medium opacity-80">
                     Our AI assistant provides historical context and modern Kenyan applications for every scripture you search.
                   </p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl opacity-20"></div>
             </div>
          </div>

          {/* Right Panel: Content Display */}
          <div className="lg:col-span-8">
            {bibleContent ? (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
                   <div className="flex justify-between items-start border-b border-slate-50 pb-8">
                      <div>
                        <h3 className="text-3xl sm:text-5xl font-black text-brand-primary tracking-tighter uppercase">{bibleSearch}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">King James Version • Digital Outreach</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-3 bg-slate-50 text-slate-400 hover:text-brand-primary rounded-xl transition-all"><Bookmark size={20}/></button>
                        <button className="p-3 bg-slate-50 text-slate-400 hover:text-brand-primary rounded-xl transition-all"><Share2 size={20}/></button>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-2xl sm:text-3xl font-serif text-slate-800 leading-relaxed italic border-l-4 border-brand-gold pl-8 py-2">
                        {bibleContent.text}
                      </p>
                   </div>

                   <div className="p-8 sm:p-10 bg-indigo-50/50 rounded-[2rem] sm:rounded-[3rem] border border-indigo-100/50 space-y-6">
                      <div className="flex items-center gap-3 text-brand-indigo">
                         <Quote size={24} className="opacity-50"/>
                         <h4 className="text-lg font-black uppercase tracking-tight">Ministry Reflection</h4>
                      </div>
                      <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
                        {bibleContent.reflection}
                      </p>
                      <div className="pt-4 flex items-center gap-3 border-t border-indigo-100/50">
                         <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-[10px] text-white font-black">I</div>
                         <p className="text-[10px] font-black text-brand-primary/60 uppercase tracking-widest">Analyzed for Imani Central Parish Context</p>
                      </div>
                   </div>
                </div>
                
                <div className="flex justify-center">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center gap-3">
                     <span className="w-12 h-px bg-slate-200"></span> Word of Life <span className="w-12 h-px bg-slate-200"></span>
                   </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm h-[600px] flex flex-col items-center justify-center p-10 text-center space-y-6">
                 {isSearchingBible ? (
                   <div className="space-y-4 flex flex-col items-center">
                      <Loader2 className="animate-spin text-brand-primary" size={48}/>
                      <p className="font-black text-brand-primary uppercase tracking-widest text-sm">Synthesizing Scripture...</p>
                   </div>
                 ) : (
                   <>
                     <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <BookOpen size={48}/>
                     </div>
                     <div className="max-w-sm space-y-2">
                        <h4 className="text-xl font-black text-slate-800 uppercase">Explore the Hub</h4>
                        <p className="text-sm font-medium text-slate-400 leading-relaxed">Enter any scripture reference in the search bar to access the text and AI-powered theological insights tailored for your congregation.</p>
                     </div>
                     <button 
                        onClick={() => { setBibleSearch('Matthew 5:13-16'); handleBibleSearch(); }}
                        className="text-[10px] font-black uppercase text-brand-indigo hover:underline tracking-widest"
                     >
                       Try: Matthew 5:13-16
                     </button>
                   </>
                 )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SermonHistory;
