import React, { useState } from 'react';
import { TodoItem } from '../types';
import { MulAvatar } from './MulAvatar';

interface NightSummaryProps {
  waterLevel: number;
  todos: TodoItem[];
}

export const NightSummary: React.FC<NightSummaryProps> = ({ waterLevel, todos }) => {
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const completedTodos = todos.filter(t => t.completed);

  const handleSave = () => {
    // Just a visual confirmation since we don't have a backend
    setIsSaved(true);
  };

  return (
    <div className="flex flex-col h-full w-full p-6 items-center justify-start overflow-y-auto animate-fade-in text-indigo-100">
      
      {/* Avatar sleeping */}
      <div className="mb-6 mt-4">
        <MulAvatar mood="sleeping" size="md" waterLevel={waterLevel} isNightMode={true} />
      </div>

      <h2 className="text-2xl font-bold mb-1 text-indigo-50">You did well today.</h2>
      <p className="text-indigo-300 text-sm mb-8">Rest now, gentle soul.</p>

      {/* Stats Container */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-8">
        
        {/* Water Stat */}
        <div className="bg-indigo-900/40 p-4 rounded-2xl border border-indigo-700/50 backdrop-blur-sm flex flex-col items-center">
           <span className="text-3xl mb-1">💧</span>
           <span className="text-2xl font-bold">{waterLevel}</span>
           <span className="text-xs text-indigo-300 uppercase tracking-wider">Drops Drank</span>
        </div>

        {/* Todo Stat */}
        <div className="bg-indigo-900/40 p-4 rounded-2xl border border-indigo-700/50 backdrop-blur-sm flex flex-col items-center">
           <span className="text-3xl mb-1">✨</span>
           <span className="text-2xl font-bold">{completedTodos.length}</span>
           <span className="text-xs text-indigo-300 uppercase tracking-wider">Small Wins</span>
        </div>

      </div>

      {/* Completed List (Mini) */}
      {completedTodos.length > 0 && (
        <div className="w-full max-w-sm mb-8">
           <h3 className="text-sm font-semibold text-indigo-300 mb-3 uppercase tracking-wide text-center">Your Gentle Steps</h3>
           <div className="flex flex-wrap gap-2 justify-center">
             {completedTodos.map(t => (
               <span key={t.id} className="text-xs px-3 py-1 rounded-full bg-indigo-800/50 text-indigo-200 border border-indigo-700/30">
                 {t.text}
               </span>
             ))}
           </div>
        </div>
      )}

      {/* Gratitude Journal */}
      <div className="w-full max-w-sm bg-indigo-950/30 p-6 rounded-3xl border border-indigo-800/30">
        <h3 className="text-lg font-medium text-indigo-100 mb-4 text-center">3 Things I'm Grateful For</h3>
        
        {!isSaved ? (
          <div className="space-y-3">
            <input 
              type="text" 
              value={gratitude1}
              onChange={(e) => setGratitude1(e.target.value)}
              placeholder="1. A warm cup of tea..."
              className="w-full bg-indigo-900/50 border border-indigo-700/50 rounded-xl px-4 py-3 text-indigo-100 placeholder-indigo-500 outline-none focus:border-indigo-400 transition-colors"
            />
             <input 
              type="text" 
              value={gratitude2}
              onChange={(e) => setGratitude2(e.target.value)}
              placeholder="2. The quiet sky..."
              className="w-full bg-indigo-900/50 border border-indigo-700/50 rounded-xl px-4 py-3 text-indigo-100 placeholder-indigo-500 outline-none focus:border-indigo-400 transition-colors"
            />
             <input 
              type="text" 
              value={gratitude3}
              onChange={(e) => setGratitude3(e.target.value)}
              placeholder="3. A friend's smile..."
              className="w-full bg-indigo-900/50 border border-indigo-700/50 rounded-xl px-4 py-3 text-indigo-100 placeholder-indigo-500 outline-none focus:border-indigo-400 transition-colors"
            />
            <button 
              onClick={handleSave}
              className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-900/50 transition-all"
            >
              Keep safe in my heart
            </button>
          </div>
        ) : (
          <div className="text-center py-8 animate-fade-in">
             <div className="text-4xl mb-2">🌙</div>
             <p className="text-indigo-200">Your gratitude is kept safe.</p>
             <p className="text-indigo-400 text-sm mt-2">Sleep well.</p>
          </div>
        )}
      </div>

    </div>
  );
};