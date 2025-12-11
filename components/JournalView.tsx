import React, { useState } from 'react';
import { JournalEntry } from '../types';
import { ambientSound } from '../services/audioService';

interface JournalViewProps {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
}

const GENTLE_PROMPTS = [
  "What’s one small thing on your mind?",
  "What felt heavy today?",
  "What felt soft or peaceful recently?",
  "What is a color that describes your day?",
  "If your heart could speak gently, what would it say?",
  "What is one tiny win you had?"
];

export const JournalView: React.FC<JournalViewProps> = ({ entries, setEntries }) => {
  const [inputText, setInputText] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(() => {
    return GENTLE_PROMPTS[Math.floor(Math.random() * GENTLE_PROMPTS.length)];
  });

  const handleSave = () => {
    if (!inputText.trim()) return;

    const now = new Date();
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      dateString: now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      prompt: currentPrompt,
      text: inputText,
    };

    setEntries(prev => [newEntry, ...prev]);
    setInputText('');
    ambientSound.playChime(523.25); // Gentle C5 chime
    
    // Pick a new prompt for next time
    setTimeout(() => {
      setCurrentPrompt(GENTLE_PROMPTS[Math.floor(Math.random() * GENTLE_PROMPTS.length)]);
    }, 500);
  };

  // Group entries by date
  const groupedEntries: { [key: string]: JournalEntry[] } = {};
  entries.forEach(entry => {
    if (!groupedEntries[entry.dateString]) {
      groupedEntries[entry.dateString] = [];
    }
    groupedEntries[entry.dateString].push(entry);
  });

  return (
    <div className="flex flex-col h-full w-full p-6 overflow-y-auto bg-gradient-to-b from-white/40 to-white/10">
      <div className="text-center mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Mul Journal</h2>
        <p className="text-slate-500">A safe place for your thoughts to flow.</p>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-8">
        
        {/* Input Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-mul-soft/50 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-mul-main opacity-50"></div>
          
          <label className="block text-mul-deep font-medium mb-3 italic">
            "{currentPrompt}"
          </label>
          
          <textarea
            className="w-full h-32 bg-slate-50 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-mul-soft transition-all resize-none border-none"
            placeholder="Let your thoughts drift here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          
          <div className="flex justify-end mt-3">
             <button
               onClick={handleSave}
               disabled={!inputText.trim()}
               className={`px-6 py-2 rounded-full font-medium transition-all transform active:scale-95 ${
                 inputText.trim() 
                  ? 'bg-mul-main text-white hover:bg-mul-deep shadow-md' 
                  : 'bg-slate-100 text-slate-300'
               }`}
             >
               Keep Safe
             </button>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-6">
           {Object.keys(groupedEntries).length === 0 ? (
             <div className="text-center py-10 opacity-40">
                <div className="text-4xl mb-2">📖</div>
                <p>No memories yet.</p>
             </div>
           ) : (
             Object.keys(groupedEntries).map(date => (
               <div key={date} className="animate-fade-in">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">{date}</h3>
                 <div className="space-y-4">
                   {groupedEntries[date].map(entry => (
                     <div key={entry.id} className="bg-white/60 p-5 rounded-2xl border border-white shadow-sm">
                       <p className="text-xs text-mul-deep mb-2 font-medium opacity-80">{entry.prompt}</p>
                       <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                     </div>
                   ))}
                 </div>
               </div>
             ))
           )}
        </div>

      </div>
    </div>
  );
};
