
import React, { useState } from 'react';
import { 
  BookOpen, Calendar, Clock, Search, 
  Download, Plus, History, Loader2, Sparkles, Send, Quote, Wand2,
  Book, ChevronRight, Bookmark, Share2, Info, X, FileText,
  Printer, MessageSquare, User
} from 'lucide-react';
import { Sermon, ChurchEvent } from '../types';
import { getBibleScriptureAndReflection } from '../services/geminiService';

interface SermonHistoryProps {
  events: ChurchEvent[];
}

const SermonHistory: React.FC<SermonHistoryProps> = ({ events }) => {
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'BIBLE'>('HISTORY');
  const [searchTerm, setSearchTerm] = useState('');
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
      transcript: 'Today we discuss the favor of God in our daily labor. The Bible says in Psalm 90:17: "Let the favor of the Lord our God be upon us, and establish the work of our hands upon us; yes, establish the work of our hands!" \n\nIn our Kenyan context, we often face challenges in business, job security, and career growth. But we must remember that it is the Lord who establishes our work. When we put God first in our professional lives, His favor opens doors that no man can shut. \n\nConclusion: Let us commit our jobs and businesses to Him this week, trusting His favor is more than enough.'
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
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight text-brand-primary uppercase leading-tight">Word Archive</h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-lg font-medium">Digital storage for past messages and living scripture.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm self-start lg:self-center overflow-x-auto no-scrollbar max-w-full">
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'HISTORY' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}
          >
            <History size={16}/> Sermon Vault
          </button>
          <button 
            onClick={() => setActiveTab('BIBLE')}
            className={`px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'BIBLE' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-brand-primary'}`}
          >
            <Book size={16}/> Scripture Explorer
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
                placeholder="Find a past message..." 
                className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-primary shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-all text-xs uppercase tracking-widest"><FileText size={18}/> Manage Transcripts</button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
            {filteredSermons.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-50">
                    <tr>
                      <th className="px-10 py-6">Message Context</th>
                      <th className="px-10 py-6">Orator</th>
                      <th className="px-10 py-6">Biblical Key</th>
                      <th className="px-10 py-6 text-right">Integrity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredSermons.map(sermon => (
                      <tr key={sermon.id} className="hover:bg-slate-50 transition-all group cursor-pointer" onClick={() => setViewingSermon(sermon)}>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-5">
                            <div className="p-3 bg-brand-indigo/10 text-brand-indigo rounded-2xl group-hover:bg-brand-indigo group-hover:text-white transition-all"><BookOpen size={24}/></div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-800 text-base truncate">{sermon.title}</p>
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{sermon.date} • {sermon.event}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                           <p className="text-sm font-bold text-slate-700">{sermon.speaker}</p>
                        </td>
                        <td className="px-10 py-8 font-black text-brand-indigo italic text-sm">{sermon.scripture}</td>
                        <td className="px-10 py-8 text-right">
                          <button className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-brand-primary group-hover:text-white transition-all">View Archive</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-32 text-center space-y-6">
                 <History size={64} className="mx-auto text-slate-100" />
                 <div>
                    <h4 className="text-xl font-black text-slate-400 uppercase">Archive Empty</h4>
                    <p className="text-sm font-medium text-slate-300">Sermons are recorded during the 'Roll Call' event workflow.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-2xl">
                    <Book size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Living Word Hub</h3>
                </div>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Search Reference</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-brand-primary outline-none shadow-inner text-sm"
                          value={bibleSearch}
                          onChange={e => setBibleSearch(e.target.value)}
                          placeholder="e.g. John 1:1"
                          onKeyDown={(e) => e.key === 'Enter' && handleBibleSearch()}
                        />
                        <button 
                          onClick={handleBibleSearch}
                          disabled={isSearchingBible || !bibleSearch}
                          className="p-4 bg-brand-primary text-white rounded-2xl hover:bg-brand-primary-700 transition-all disabled:opacity-50 shadow-lg shadow-brand-primary/10"
                        >
                          {isSearchingBible ? <Loader2 className="animate-spin" size={20}/> : <ChevronRight size={20}/>}
                        </button>
                      </div>
                   </div>

                   <div className="space-y-3 pt-4">
                      <p className="text-[10px] font-black uppercase text-slate-300 ml-2 tracking-widest">Global Favourites</p>
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
                              <span className="text-[8px] font-black uppercase bg-white px-3 py-1 rounded-full text-slate-400 border border-slate-100">{item.tag}</span>
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-brand-primary p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                <div className="relative z-10 space-y-4">
                   <div className="flex items-center gap-3">
                      <Sparkles className="text-brand-gold animate-pulse" size={20}/>
                      <h4 className="font-black uppercase tracking-tight text-sm">AI Theology Lens</h4>
                   </div>
                   <p className="text-xs text-indigo-100 leading-relaxed font-medium opacity-80">
                     Our AI layer maps ancient texts to modern Kenyan realities: community, work, and faith.
                   </p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl opacity-20"></div>
             </div>
          </div>

          <div className="lg:col-span-8">
            {bibleContent ? (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <div className="bg-white p-10 sm:p-14 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12">
                   <div className="flex justify-between items-start border-b border-slate-50 pb-10">
                      <div>
                        <h3 className="text-3xl sm:text-5xl font-black text-brand-primary tracking-tighter uppercase">{bibleSearch}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">KJV Standard • Contextually Analyzed</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-4 bg-slate-50 text-slate-400 hover:text-brand-primary rounded-2xl transition-all shadow-sm"><Bookmark size={20}/></button>
                        <button className="p-4 bg-slate-50 text-slate-400 hover:text-brand-primary rounded-2xl transition-all shadow-sm"><Share2 size={20}/></button>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <p className="text-2xl sm:text-3xl font-serif text-slate-800 leading-relaxed italic border-l-8 border-brand-gold pl-10 py-4">
                        {bibleContent.text}
                      </p>
                   </div>

                   <div className="p-10 bg-indigo-50/50 rounded-[3rem] border border-indigo-100 space-y-8">
                      <div className="flex items-center gap-4 text-brand-indigo">
                         <Quote size={32} className="opacity-50"/>
                         <h4 className="text-xl font-black uppercase tracking-tight">Kenyan Ministry Exegesis</h4>
                      </div>
                      <p className="text-sm sm:text-lg font-medium text-slate-600 leading-relaxed">
                        {bibleContent.reflection}
                      </p>
                      <div className="pt-6 flex items-center gap-4 border-t border-indigo-100/50">
                         <div className="w-10 h-10 rounded-2xl bg-brand-primary flex items-center justify-center text-xs text-white font-black">I</div>
                         <p className="text-[10px] font-black text-brand-primary/60 uppercase tracking-widest">Strategic Insight generated for Imani global parish</p>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm h-[600px] flex flex-col items-center justify-center p-12 text-center space-y-8">
                 {isSearchingBible ? (
                   <div className="space-y-6 flex flex-col items-center">
                      <div className="relative">
                         <div className="w-20 h-20 border-4 border-brand-indigo/10 rounded-full animate-spin border-t-brand-primary"></div>
                         <BookOpen className="absolute inset-0 m-auto text-brand-primary" size={24}/>
                      </div>
                      <p className="font-black text-brand-primary uppercase tracking-widest text-sm">Synthesizing the Word...</p>
                   </div>
                 ) : (
                   <>
                     <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-inner">
                        <BookOpen size={48}/>
                     </div>
                     <div className="max-w-md space-y-4">
                        <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Scripture Intelligence</h4>
                        <p className="text-base font-medium text-slate-400 leading-relaxed">Access the living word with AI-assisted contextual reflection. Perfect for sermon prep or personal study.</p>
                     </div>
                     <button 
                        onClick={() => { setBibleSearch('Matthew 5:13-16'); handleBibleSearch(); }}
                        className="px-8 py-3 bg-slate-50 text-brand-indigo rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-indigo hover:text-white transition-all shadow-sm"
                     >
                       Try Matthew 5:13-16
                     </button>
                   </>
                 )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sermon Reader Modal */}
      {viewingSermon && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-0 sm:p-4 lg:p-12 overflow-y-auto no-scrollbar">
          <div className="bg-white rounded-none sm:rounded-[3.5rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-300">
             <div className="p-8 sm:p-14 bg-brand-primary text-white relative overflow-hidden flex-shrink-0">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 text-brand-gold">
                         <BookOpen size={20}/>
                         <span className="text-[10px] font-black uppercase tracking-widest">Sermon Archive</span>
                      </div>
                      <h3 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight">{viewingSermon.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-slate-300 font-bold">
                         <span className="flex items-center gap-2 text-xs"><User size={14}/> {viewingSermon.speaker}</span>
                         <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                         <span className="flex items-center gap-2 text-xs"><Calendar size={14}/> {viewingSermon.date}</span>
                      </div>
                   </div>
                   <button onClick={() => setViewingSermon(null)} className="absolute -top-4 -right-4 md:relative md:top-0 md:right-0 p-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl"><X size={28}/></button>
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
             </div>

             <div className="flex-1 p-8 sm:p-14 lg:p-20 overflow-y-auto no-scrollbar bg-white">
                <div className="max-w-3xl mx-auto space-y-12">
                   <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl"><Sparkles size={20}/></div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Anchor Scripture</p>
                            <p className="text-xl font-black text-brand-primary">{viewingSermon.scripture}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-3 bg-slate-50 text-slate-400 hover:text-brand-indigo rounded-xl transition-all shadow-sm"><Printer size={20}/></button>
                         <button className="p-3 bg-slate-50 text-slate-400 hover:text-brand-indigo rounded-xl transition-all shadow-sm"><MessageSquare size={20}/></button>
                      </div>
                   </div>

                   <div className="prose prose-slate max-w-none">
                      <p className="text-lg sm:text-2xl font-serif text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {viewingSermon.transcript}
                      </p>
                   </div>

                   <div className="pt-12 border-t border-slate-50">
                      <div className="bg-slate-50 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6">
                         <div className="text-center md:text-left">
                            <h4 className="font-black text-slate-800 uppercase tracking-tight">Spread the Word</h4>
                            <p className="text-xs text-slate-400 font-medium">Share this message with your department or fellowship.</p>
                         </div>
                         <button className="w-full md:w-auto px-10 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-brand-indigo transition-all flex items-center justify-center gap-3">
                            <Share2 size={18}/> Push to Outreach
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SermonHistory;
