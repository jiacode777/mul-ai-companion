import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { BreathingExercise } from './components/BreathingExercise';
import { TodoView } from './components/TodoView';
import { NightSummary } from './components/NightSummary';
import { JournalView } from './components/JournalView';
import { GroundingExercise } from './components/GroundingExercise';
import { AppMode, TodoItem, JournalEntry } from './types';
import { initializeChat } from './services/geminiService';
import { ambientSound } from './services/audioService';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [isIntroDone, setIsIntroDone] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [waterLevel, setWaterLevel] = useState(3); 
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  
  // New Modes
  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => {
    initializeChat();
  }, []);

  const handleStart = () => {
    setIsIntroDone(true);
    if (!isMuted) {
      ambientSound.playWater();
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (newMutedState) {
      ambientSound.stopCurrent();
    } else {
      // Restore sound based on mode
      if (isNightMode) ambientSound.playNight();
      else ambientSound.playWater();
    }
  };

  const toggleNightMode = () => {
    const newNightState = !isNightMode;
    setIsNightMode(newNightState);
    
    // If entering night mode, we can just leave the current "mode" as is behind the scene
    // or switch to something else, but visual override happens via isNightMode check.

    if (!isMuted) {
      if (newNightState) ambientSound.playNight();
      else ambientSound.playWater(); // Default back to water
    }
  };

  const switchToJournal = () => {
    if (isNightMode) toggleNightMode();
    setMode(AppMode.JOURNAL);
  };

  const switchToGrounding = () => {
    if (isNightMode) toggleNightMode();
    setMode(AppMode.GROUNDING);
  };

  // Intro Screen
  if (!isIntroDone) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-gradient-to-b from-[#F0F9FF] to-transparent">
        {/* Background blobs */}
        <div className="absolute top-1/4 -left-10 w-64 h-64 bg-mul-soft rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute bottom-1/4 -right-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-md w-full bg-white/40 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/50">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-mul-light to-mul-main rounded-full shadow-lg mb-6 flex items-center justify-center animate-wiggle">
             <div className="text-4xl">💧</div>
          </div>
          <h1 className="text-3xl font-bold text-slate-700 mb-2 font-sans tracking-tight">Mul</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your gentle water companion for calm moments. Flow, breathe, and untangle your thoughts.
          </p>
          <button
            onClick={handleStart}
            className="w-full py-4 bg-mul-main hover:bg-mul-deep text-white rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02] font-semibold text-lg"
          >
            Start Flowing
          </button>
          <div className="mt-4 text-sm text-slate-400">
            (Includes gentle ambient sounds)
          </div>
        </div>
      </div>
    );
  }

  // Styles based on mode
  const appBgClass = isNightMode 
    ? 'bg-gradient-to-b from-[#0F172A] to-[#1E1B4B]' 
    : 'bg-gradient-to-b from-[#F0F9FF] to-[#E0F2FE]';

  const navBgClass = isNightMode
    ? 'bg-indigo-950/60 border-indigo-800'
    : 'bg-white/60 border-white/50';

  const navTextClass = isNightMode ? 'text-indigo-100' : 'text-slate-800';

  return (
    <div className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-1000 overflow-hidden relative ${appBgClass}`}>
      
      {/* Side Tabs (Left Side) */}
      <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-30 flex flex-col gap-2">
        {/* Journal Tab */}
        <button
          onClick={switchToJournal}
          className={`py-3 pl-1 pr-2 rounded-r-2xl shadow-md transition-all duration-300 group flex items-center justify-center ${
              mode === AppMode.JOURNAL && !isNightMode
              ? 'bg-mul-main text-white w-12 hover:w-14' 
              : 'bg-white/80 text-mul-deep hover:bg-mul-light w-8 hover:w-12'
          }`}
          title="Journal"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">📖</span>
        </button>

        {/* Night Mode Tab */}
        <button
          onClick={toggleNightMode}
          className={`py-3 pl-1 pr-2 rounded-r-2xl shadow-md transition-all duration-500 group flex items-center justify-center ${
              isNightMode 
              ? 'bg-indigo-600 text-yellow-200 w-12 hover:w-14' 
              : 'bg-white/80 text-slate-400 hover:bg-slate-100 w-8 hover:w-12'
          }`}
          title={isNightMode ? "Wake up" : "Night Mode"}
        >
          <span className="text-xl group-hover:scale-110 transition-transform">{isNightMode ? '☀️' : '🌙'}</span>
        </button>

        {/* Grounding Mode Tab (Plant) */}
        <button
          onClick={switchToGrounding}
          className={`py-3 pl-1 pr-2 rounded-r-2xl shadow-md transition-all duration-300 group flex items-center justify-center ${
              mode === AppMode.GROUNDING && !isNightMode
              ? 'bg-green-600 text-white w-12 hover:w-14' 
              : 'bg-white/80 text-green-600 hover:bg-green-50 w-8 hover:w-12'
          }`}
          title="Grounding"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🌿</span>
        </button>
      </div>

      {/* Top Navigation Bar */}
      <nav className={`flex-none h-16 px-4 sm:px-6 flex items-center justify-between backdrop-blur-md z-20 shadow-sm transition-colors duration-1000 ${navBgClass}`}>
        <span className={`text-xl font-bold flex items-center gap-2 cursor-pointer ${isNightMode ? 'text-indigo-300' : 'text-mul-deep'}`} onClick={() => setMode(AppMode.CHAT)}>
          💧 Mul
        </span>
        
        {/* If in Night Mode, we hide the standard nav buttons to focus on rest */}
        {!isNightMode && (
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setMode(AppMode.CHAT)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  mode === AppMode.CHAT 
                    ? 'bg-mul-soft text-mul-deep' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setMode(AppMode.TODO)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                  mode === AppMode.TODO 
                    ? 'bg-mul-soft text-mul-deep' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                To-Do
                {todos.length > 0 && mode !== AppMode.TODO && (
                   <span className="w-2 h-2 rounded-full bg-red-300 animate-pulse"></span>
                )}
              </button>
              <button
                onClick={() => setMode(AppMode.BREATHING)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  mode === AppMode.BREATHING 
                    ? 'bg-mul-soft text-mul-deep' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Breathe
              </button>
            </div>
            
            {/* Audio Toggle */}
            <button 
              onClick={toggleMute}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-mul-deep transition-colors flex-shrink-0"
              title={isMuted ? "Turn on sound" : "Turn off sound"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.525 4.48a.75.75 0 011.06 0 9.75 9.75 0 010 13.79.75.75 0 01-1.06-1.06 8.25 8.25 0 000-11.67.75.75 0 010-1.06z" />
                  <path d="M19.05 19.05a.75.75 0 10-1.06 1.06l1.06-1.06zM15.53 15.53a.75.75 0 10-1.06 1.06l1.06-1.06z" />
                  <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L16.97 10.53a.75.75 0 010-2.12l-1.06-1.06a.75.75 0 00-1.06 1.06l1.06 1.06a.75.75 0 00.75.75z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Background ambient effect */}
        {!isNightMode && (
          <div className="absolute inset-0 z-0 pointer-events-none">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-float"></div>
             <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-float-slow"></div>
          </div>
        )}

        {isNightMode ? (
          <NightSummary waterLevel={waterLevel} todos={todos} />
        ) : (
          <div className="w-full h-full relative z-10 flex flex-col">
            {mode === AppMode.CHAT && (
              <ChatInterface 
                waterLevel={waterLevel} 
                setWaterLevel={setWaterLevel}
                setTodos={setTodos}
                onSwitchMode={setMode}
              />
            )}
            {mode === AppMode.TODO && (
              <TodoView 
                todos={todos} 
                setTodos={setTodos}
                switchToChat={() => setMode(AppMode.CHAT)}
              />
            )}
            {mode === AppMode.BREATHING && (
              <BreathingExercise 
                waterLevel={waterLevel}
                onComplete={() => setMode(AppMode.CHAT)}
              />
            )}
            {mode === AppMode.JOURNAL && (
              <JournalView 
                entries={journalEntries}
                setEntries={setJournalEntries}
              />
            )}
            {mode === AppMode.GROUNDING && (
              <GroundingExercise 
                waterLevel={waterLevel}
                onComplete={() => setMode(AppMode.CHAT)}
              />
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default App;