
import React, { useState } from 'react';
import { Sparkles, Send, BookOpen, Quote, Download, History } from 'lucide-react';
import { generateSermonOutline } from '../services/geminiService';

const AISermonAssistant: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [scripture, setScripture] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic || !scripture) return;
    setLoading(true);
    try {
      const outline = await generateSermonOutline(topic, scripture);
      setResult(outline || 'Error generating outline.');
    } catch (error) {
      console.error(error);
      setResult('Failed to connect to AI service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
          <Sparkles size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">AI Sermon Assistant</h2>
          <p className="text-slate-500">Draft inspiring sermon outlines with Kenyan contextual examples.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Sermon Topic</label>
              <input 
                type="text" 
                placeholder="e.g. Divine Favor in Work"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Key Scripture</label>
              <input 
                type="text" 
                placeholder="e.g. Psalm 90:17"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={scripture}
                onChange={(e) => setScripture(e.target.value)}
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 active:scale-95'}`}
            >
              {loading ? 'Processing...' : <><Send size={18} /> Generate Outline</>}
            </button>
          </div>

          <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg shadow-indigo-950/20 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <History size={18} /> Recent Drafts
            </h3>
            <ul className="space-y-3 text-sm text-indigo-200">
              <li className="cursor-pointer hover:text-white transition-colors">• Faith during harvest (Matt 9:37)</li>
              <li className="cursor-pointer hover:text-white transition-colors">• Community Spirit (Acts 2:44)</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <BookOpen className="text-indigo-600" size={24} />
                  <h3 className="text-xl font-bold text-slate-800">Draft Outline</h3>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <Download size={20} />
                  </button>
                </div>
              </div>
              <div className="prose prose-indigo max-w-none flex-1">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-serif text-lg">
                  {result}
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-400 italic text-sm">
                <Quote size={14} /> AI-generated content should be reviewed by spiritual leadership.
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-[500px] flex flex-col items-center justify-center text-slate-400">
              <Sparkles size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Enter a topic to generate a sermon guide</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISermonAssistant;
