
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Calendar, Clock, Search, 
  MoreHorizontal, Download, Filter, User,
  Plus, X, FileText, ChevronRight, Book,
  Hash, ExternalLink, Save, History, Loader2, AlertCircle
} from 'lucide-react';
import { Sermon, ChurchEvent } from '../types';

interface Verse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleResponse {
  reference: string;
  verses: Verse[];
  text: string;
  translation_name: string;
}

interface SermonHistoryProps {
  events: ChurchEvent[];
}

const SermonHistory: React.FC<SermonHistoryProps> = ({ events }) => {
  const [activeTab, setActiveTab] = useState<'HISTORY' | 'BIBLE'>('HISTORY');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('All');
  const [selectedEventId, setSelectedEventId] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingSermon, setViewingSermon] = useState<Sermon | null>(null);

  const [sermons, setSermons] = useState<Sermon[]>([
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
    },
    {
      id: '2',
      title: 'The Power of Gratitude',
      speaker: 'Pastor Mary Wambui',
      date: '2023-10-18',
      time: '09:00 AM',
      scripture: '1 Thessalonians 5:18',
      event: 'Sunday Morning Worship',
      eventId: 'ev1'
    }
  ]);

  const speakers = useMemo(() => Array.from(new Set(sermons.map(s => s.speaker))), [sermons]);

  const filteredSermons = useMemo(() => {
    return sermons.filter(s => {
      const matchesSearch = 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.scripture.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpeaker = selectedSpeaker === 'All' || s.speaker === selectedSpeaker;
      const matchesEvent = selectedEventId === 'All' || s.eventId === selectedEventId;
      const matchesDate = (!dateRange.start || s.date >= dateRange.start) && (!dateRange.end || s.date <= dateRange.end);

      return matchesSearch && matchesSpeaker && matchesEvent && matchesDate;
    });
  }, [sermons, searchTerm, selectedSpeaker, selectedEventId, dateRange]);

  const handleExportCSV = () => {
    const headers = ['Title', 'Speaker', 'Date', 'Scripture', 'Event'];
    const rows = filteredSermons.map(s => [s.title, s.speaker, s.date, s.scripture, s.event]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "sermon_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bible Browser State
  const [bibleSearch, setBibleSearch] = useState({ book: 'Genesis', chapter: '1' });
  const [bibleContent, setBibleContent] = useState<Verse[]>([]);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleError, setBibleError] = useState<string | null>(null);
  const [bibleReference, setBibleReference] = useState('Genesis 1');

  const bibleBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', 
    '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 
    'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 
    'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 
    'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', 
    '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', 
    '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 
    'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
  ];

  const fetchBiblePassage = async () => {
    setBibleLoading(true);
    setBibleError(null);
    try {
      const response = await fetch(`https://bible-api.com/${bibleSearch.book}+${bibleSearch.chapter}?translation=kjv`);
      if (!response.ok) throw new Error('Could not fetch scripture. Check your connection or the chapter number.');
      const data: BibleResponse = await response.json();
      setBibleContent(data.verses);
      setBibleReference(data.reference);
    } catch (err: any) {
      setBibleError(err.message || 'Failed to load scripture.');
    } finally {
      setBibleLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (activeTab === 'BIBLE' && bibleContent.length === 0) {
      fetchBiblePassage();
    }
  }, [activeTab]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Ministry Word & Bible</h2>
          <p className="text-slate-500 mt-2 text-lg">Access past messages, transcripts, and the Holy Scriptures.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'HISTORY' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            <History size={16}/> Sermon History
          </button>
          <button 
            onClick={() => setActiveTab('BIBLE')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'BIBLE' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            <Book size={16}/> Bible Study
          </button>
        </div>
      </div>

      {activeTab === 'HISTORY' ? (
        <>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px] space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Search</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Title, speaker, scripture..." 
                  className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Speaker</label>
              <select 
                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none shadow-sm min-w-[150px]"
                value={selectedSpeaker}
                onChange={e => setSelectedSpeaker(e.target.value)}
              >
                <option value="All">All Speakers</option>
                {speakers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Event</label>
              <select 
                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none shadow-sm min-w-[150px]"
                value={selectedEventId}
                onChange={e => setSelectedEventId(e.target.value)}
              >
                <option value="All">All Events</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Date Range</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  className="px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none shadow-sm"
                  value={dateRange.start}
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                />
                <input 
                  type="date" 
                  className="px-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none shadow-sm"
                  value={dateRange.end}
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-2 mb-[2px]">
              <button 
                onClick={handleExportCSV}
                className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                title="Export History"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-w-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-50">
                    <th className="px-8 py-5">Sermon Title</th>
                    <th className="px-8 py-5">Speaker</th>
                    <th className="px-8 py-5">Associated Event</th>
                    <th className="px-8 py-5">Scripture</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSermons.map(sermon => (
                    <tr key={sermon.id} className="hover:bg-slate-50 transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                            <BookOpen size={20}/>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-base">{sermon.title}</p>
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <Calendar size={12}/> {sermon.date} • <Clock size={12}/> {sermon.time}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 text-sm">{sermon.speaker}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
                            {events.find(e => e.id === sermon.eventId)?.title || sermon.event}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-bold text-indigo-600 text-sm italic">{sermon.scripture}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => setViewingSermon(sermon)}
                          className="px-4 py-2 bg-white text-indigo-600 text-[10px] font-black rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm uppercase tracking-widest"
                        >
                          View Transcript
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-2xl font-black text-slate-800">Bible Browser</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Book</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 outline-none"
                  value={bibleSearch.book}
                  onChange={e => setBibleSearch({...bibleSearch, book: e.target.value})}
                >
                  {bibleBooks.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Chapter</label>
                  <input 
                    type="number" 
                    min="1"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-700 outline-none"
                    value={bibleSearch.chapter}
                    onChange={e => setBibleSearch({...bibleSearch, chapter: e.target.value})}
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <button 
                    onClick={fetchBiblePassage}
                    disabled={bibleLoading}
                    className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    {bibleLoading ? <Loader2 className="animate-spin" size={18}/> : 'Read'}
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Saved Verses</p>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-600">Psalm 23:1 - The Lord is my shepherd...</div>
                <div className="p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-600">John 3:16 - For God so loved...</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
              <div>
                <h4 className="text-3xl font-black text-slate-800">{bibleReference}</h4>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">King James Version (KJV)</p>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"><ExternalLink size={20}/></button>
              </div>
            </div>
            
            <div className="flex-1 text-slate-700 space-y-6 font-serif text-lg leading-relaxed max-h-[500px] overflow-y-auto pr-4">
              {bibleLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300">
                  <Loader2 className="animate-spin mb-4" size={48} />
                  <p className="font-bold">Opening the scrolls...</p>
                </div>
              ) : bibleError ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-rose-300">
                  <AlertCircle className="mb-4" size={48} />
                  <p className="font-bold">{bibleError}</p>
                  <button 
                    onClick={fetchBiblePassage}
                    className="mt-4 text-xs font-black uppercase tracking-widest text-indigo-600 hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              ) : bibleContent.length > 0 ? (
                bibleContent.map(v => (
                  <p key={v.verse}>
                    <span className="font-black text-indigo-400 text-xs mr-2">{v.verse}</span>
                    {v.text}
                  </p>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-300">
                  <Book size={48} className="mb-4 opacity-20" />
                  <p className="font-bold">Select a book and chapter to start reading.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Viewing Sermon Detail / Transcript Modal */}
      {viewingSermon && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 border-b border-slate-100 bg-indigo-50/50 flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black text-slate-800">{viewingSermon.title}</h3>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">Transcript</span>
                </div>
                <p className="text-sm text-slate-500 font-bold flex items-center gap-2">
                  <User size={14}/> {viewingSermon.speaker} • <Calendar size={14}/> {viewingSermon.date} • <Hash size={14}/> {viewingSermon.scripture}
                </p>
              </div>
              <button onClick={() => setViewingSermon(null)} className="p-4 bg-white text-slate-400 hover:text-rose-500 rounded-2xl shadow-sm transition-all"><X size={24}/></button>
            </div>
            <div className="p-10">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 h-[400px] overflow-y-auto">
                <div className="prose prose-indigo max-w-none text-slate-700 leading-relaxed font-serif text-lg">
                  {viewingSermon.transcript ? (
                    <div className="whitespace-pre-wrap">{viewingSermon.transcript}</div>
                  ) : (
                    <div className="text-center py-20 text-slate-300">
                      <FileText size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold">No transcript recorded for this sermon yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-10 pb-10 flex gap-4">
              <button className="flex-1 py-4 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                <Download size={24}/> Download PDF
              </button>
              <button 
                className="py-4 px-8 bg-indigo-100 text-indigo-600 rounded-[2rem] font-black hover:bg-indigo-200 transition-all"
                onClick={() => alert('Transcript editor coming soon!')}
              >
                Edit Content
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Sermon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl p-10 space-y-6 animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">Archive New Sermon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Sermon Title</label>
                  <input type="text" placeholder="e.g. Walking in Grace" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Main Speaker</label>
                  <input type="text" placeholder="e.g. Pastor John" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Key Scripture</label>
                  <input type="text" placeholder="e.g. John 3:16" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Date & Time</label>
                  <div className="flex gap-2">
                    <input type="date" className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" />
                    <input type="time" className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Associate with Event</label>
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                    <option value="">None / External</option>
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Full Transcript (Paste Here)</label>
              <textarea 
                rows={8} 
                placeholder="Write or paste the full sermon text here for archiving..."
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl">Cancel</button>
              <button className="flex-1 py-4 font-black bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 flex items-center justify-center gap-2">
                <Save size={20}/> Archive Sermon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SermonHistory;
