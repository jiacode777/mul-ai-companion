import React, { useState, useRef, useEffect } from 'react';
import { Message, MulState, TodoItem, AppMode, InterventionResponse } from '../types';
import { sendMessageStream, generateGentleTodos, analyzeMoodAndIntervention } from '../services/geminiService';
import { MulAvatar } from './MulAvatar';
import { ambientSound } from '../services/audioService';

interface ChatInterfaceProps {
  waterLevel: number;
  setWaterLevel: (level: number) => void;
  setTodos: React.Dispatch<React.SetStateAction<TodoItem[]>>;
  onSwitchMode: (mode: AppMode) => void;
  isNightMode?: boolean;
}

// Simple keyword matching for sentiment (Fallback/Instant)
const basicSentiment = (text: string): MulState['mood'] => {
  const t = text.toLowerCase();
  if (t.match(/\b(sad|cry|lonely|hurt|pain|grief|bad|awful|sorrow|drained|tired|exhausted)\b/)) return 'sad';
  if (t.match(/\b(calm|breathe|relax|peace|quiet|still|zen|slow)\b/)) return 'calm';
  if (t.match(/\b(why|what|how|where|who|\?)\b/)) return 'curious';
  return 'happy';
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  waterLevel, 
  setWaterLevel, 
  setTodos,
  onSwitchMode,
  isNightMode = false
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mulMood, setMulMood] = useState<MulState['mood']>('happy');
  const [showTodoLink, setShowTodoLink] = useState(false);
  
  // Smart Analysis State
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [suggestedIntervention, setSuggestedIntervention] = useState<AppMode | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Track last drink time for reminder
  const lastDrinkTimeRef = useRef<number>(Date.now());

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        const greeting: Message = {
          id: 'init',
          role: 'model',
          text: "Hello friend... I’m Mul. I’m happy to flow with you today. How is your heart feeling?",
        };
        setMessages([greeting]);
      }, 500);
    }
  }, [messages.length]);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiReasoning]);

  // Water Reminder Effect
  useEffect(() => {
    const REMINDER_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours
    
    const timer = setInterval(() => {
      const now = Date.now();
      const timeSinceLastDrink = now - lastDrinkTimeRef.current;

      if (timeSinceLastDrink >= REMINDER_INTERVAL && waterLevel < 8) {
        lastDrinkTimeRef.current = now;
        const reminderMsg: Message = {
          id: Date.now().toString(),
          role: 'model',
          text: "Gentle ripple... I noticed it's been a little while. Maybe a sip of cool water would feel nice for your body? 💧",
        };
        setMessages((prev) => [...prev, reminderMsg]);
        ambientSound.playChime(440); 
      }
    }, 60000); 

    return () => clearInterval(timer);
  }, [waterLevel]);

  const handleWaterDrink = () => {
    if (waterLevel < 8) {
      const newLevel = waterLevel + 1;
      setWaterLevel(newLevel);
      ambientSound.playWaterPour();
      lastDrinkTimeRef.current = Date.now();
      if (newLevel === 8) {
        setMulMood('celebrating');
        setTimeout(() => setMulMood('happy'), 3000);
      }
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userText = inputText;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setShowTodoLink(false);
    setSuggestedIntervention(null);
    setAiReasoning("✨ Sensing your ripples..."); // Immediate visual feedback
    
    // 1. Immediate local heuristic for instant responsiveness
    const initialMood = basicSentiment(userText);
    setMulMood(initialMood === 'happy' ? 'thinking' : initialMood);

    // 2. Parallel: Send to Chat Stream (The conversation)
    const botMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: botMsgId, role: 'model', text: '', isTyping: true }
    ]);

    const chatPromise = sendMessageStream(userText, (streamedText) => {
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMsgId ? { ...msg, text: streamedText, isTyping: false } : msg
        )
      );
      if (initialMood !== 'sad' && initialMood !== 'calm') {
         setMulMood('listening');
      }
    });

    // 3. Parallel: Smart Analysis (The "Wow" Multimodal Logic)
    const analysisPromise = analyzeMoodAndIntervention(userText).then((result) => {
      if (result) {
        // Visual Reaction
        setMulMood(result.mood);
        setAiReasoning(`🌊 ${result.reasoning}`);

        // Audio Reaction
        if (result.mood === 'sad') ambientSound.playChime(300); // Low calming
        if (result.mood === 'calm') ambientSound.playChime(440); // Neutral
        if (result.mood === 'curious' || result.mood === 'happy') ambientSound.playChime(600); // Bright

        // Intervention Suggestion
        if (result.recommendedMode !== AppMode.CHAT) {
          setSuggestedIntervention(result.recommendedMode);
        }

        // Special handling for Todo generation if recommended
        if (result.recommendedMode === AppMode.TODO) {
          generateGentleTodos(userText).then((newTasks) => {
            if (newTasks.length > 0) {
              const newTodoItems: TodoItem[] = newTasks.map(t => ({
                id: Date.now().toString() + Math.random().toString(),
                text: t,
                completed: false
              }));
              setTodos(prev => [...newTodoItems, ...prev]); 
              setShowTodoLink(true);
            }
          });
        }
      }
    });

    await Promise.all([chatPromise, analysisPromise]);

    setIsTyping(false);
    
    // Clear reasoning bubble after a delay for cleaner UI
    setTimeout(() => {
        setAiReasoning(null);
        if (mulMood !== 'calm' && mulMood !== 'sad') {
             setMulMood('happy');
        }
    }, 5000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // --- Dynamic Styling based on Mode ---
  const headerBgClass = isNightMode 
    ? 'from-indigo-950 to-transparent' 
    : 'from-[#F0F9FF] to-transparent';

  const userBubbleClass = isNightMode
    ? 'bg-indigo-700 text-indigo-100 border-indigo-600'
    : 'bg-white text-slate-700 border-slate-100';

  const modelBubbleClass = isNightMode
    ? 'bg-indigo-900 text-indigo-200 border-indigo-800'
    : 'bg-mul-light text-slate-800 border-mul-soft';
  
  const inputContainerClass = isNightMode
    ? 'bg-indigo-900/50 border-indigo-700'
    : 'bg-white border-mul-soft/50';

  const inputTextClass = isNightMode ? 'text-indigo-200 placeholder-indigo-400' : 'text-slate-700 placeholder-slate-400';
  const bottomGradient = isNightMode ? 'from-indigo-950 via-indigo-950' : 'from-[#E0F2FE] via-[#E0F2FE]';

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full relative">
      
      {/* Header / Avatar Area */}
      <div className={`flex-none p-4 flex flex-col items-center justify-center bg-gradient-to-b ${headerBgClass} z-10 sticky top-0 transition-colors duration-700`}>
        <div className="relative flex items-center justify-center">
          
          <MulAvatar mood={mulMood} size="sm" waterLevel={waterLevel} isNightMode={isNightMode} />
          
          {/* AI Reasoning Bubble - The "Transparent Intelligence" Element */}
          {aiReasoning && (
             <div className="absolute left-full ml-4 top-0 w-48 animate-fade-in z-20 hidden sm:block">
               <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl rounded-tl-none border border-mul-soft/50 shadow-lg transform translate-y-2">
                 <p className="text-xs font-bold text-mul-deep uppercase tracking-wider mb-1">Spirit Sense</p>
                 <p className="text-sm text-slate-600 leading-tight">{aiReasoning}</p>
               </div>
             </div>
          )}

          {/* Mobile version of reasoning bubble (centered below) */}
          {aiReasoning && (
             <div className="absolute -bottom-16 w-48 sm:hidden animate-fade-in z-20">
               <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-mul-soft/50 shadow-lg text-center">
                 <p className="text-xs text-slate-600 leading-tight">{aiReasoning}</p>
               </div>
             </div>
          )}

          <div className={`absolute -bottom-2 -right-2 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold shadow-sm border transition-colors ${isNightMode ? 'bg-indigo-900/80 text-indigo-200 border-indigo-700' : 'bg-white/80 text-mul-deep border-mul-soft'}`}>
            {waterLevel}/8 💧
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-2xl text-[16px] leading-relaxed shadow-sm transition-all duration-300 ${
                msg.role === 'user'
                  ? `${userBubbleClass} rounded-br-none border`
                  : `${modelBubbleClass} rounded-bl-none border`
              }`}
            >
              {msg.text || (msg.isTyping ? <span className="animate-pulse">...</span> : '')}
            </div>
          </div>
        ))}
        {waterLevel === 8 && mulMood === 'celebrating' && (
          <div className="flex justify-center w-full animate-fade-in">
             <div className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm border border-yellow-200">
               Yay! You reached your water goal! 🎉
             </div>
          </div>
        )}
        
        {/* Quick Action Suggestion (Smart Intervention) */}
        {suggestedIntervention && (
           <div className="flex justify-center w-full animate-fade-in-up mt-2">
             <div className={`p-1 rounded-2xl bg-gradient-to-r from-mul-soft via-mul-main to-mul-soft p-[1px]`}>
               <div className="bg-white rounded-xl px-4 py-3 shadow-sm flex items-center gap-3">
                 <span className="text-2xl">
                    {suggestedIntervention === AppMode.BREATHING ? '🌬️' : 
                     suggestedIntervention === AppMode.GROUNDING ? '🌿' : 
                     suggestedIntervention === AppMode.JOURNAL ? '📖' : '📝'}
                 </span>
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Suggested for you</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {suggestedIntervention === AppMode.BREATHING ? 'Take a slow breath?' : 
                       suggestedIntervention === AppMode.GROUNDING ? 'Try a grounding moment?' :
                       suggestedIntervention === AppMode.JOURNAL ? 'Write this feeling down?' : 'Make a gentle plan?'}
                    </p>
                 </div>
                 <button 
                   onClick={() => {
                      if (suggestedIntervention) {
                          onSwitchMode(suggestedIntervention);
                      }
                   }}
                   className="ml-2 px-3 py-1.5 bg-mul-main text-white text-sm rounded-lg hover:bg-mul-deep transition-colors"
                 >
                   {suggestedIntervention === AppMode.TODO ? 'Go' : 'Try'}
                 </button>
               </div>
             </div>
           </div>
        )}

        {showTodoLink && !suggestedIntervention && (
           <div className="flex justify-center w-full animate-fade-in">
             <button 
               onClick={() => onSwitchMode(AppMode.TODO)}
               className={`px-4 py-2 rounded-full text-sm border shadow-md hover:scale-105 transition-transform flex items-center gap-2 ${isNightMode ? 'bg-indigo-800 text-indigo-200 border-indigo-600' : 'bg-white text-mul-deep border-mul-soft'}`}
             >
               📝 I made a gentle plan for you
             </button>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`flex-none p-4 bg-gradient-to-t ${bottomGradient} to-transparent transition-colors duration-700`}>
        
        <div className="flex items-end gap-2">
           <button
             onClick={handleWaterDrink}
             className={`mb-1 w-10 h-10 rounded-full border flex items-center justify-center transition-all shadow-sm active:scale-95 group relative ${isNightMode ? 'bg-indigo-800 border-indigo-600 text-indigo-300 hover:bg-indigo-700' : 'bg-white border-mul-soft text-mul-main hover:bg-mul-light'}`}
             title="Drink a cup of water"
           >
             <span className="text-xl group-hover:animate-bounce">💧</span>
             <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border ${isNightMode ? 'bg-indigo-500 text-white border-indigo-900' : 'bg-mul-deep text-white border-white'}`}>
               +
             </div>
           </button>

          <div className={`relative flex-1 flex items-center rounded-full shadow-lg border p-1 pl-4 ${inputContainerClass}`}>
            <input
              ref={inputRef}
              type="text"
              className={`flex-1 bg-transparent outline-none py-3 ${inputTextClass}`}
              placeholder={isNightMode ? "Whisper to Mul..." : "Tell Mul how you feel..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className={`w-10 h-10 rounded-full flex items-center justify-center ml-2 transition-colors ${
                !inputText.trim() || isTyping
                  ? (isNightMode ? 'bg-indigo-900 text-indigo-700' : 'bg-slate-100 text-slate-300')
                  : (isNightMode ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'bg-mul-main text-white hover:bg-mul-deep')
              } shadow-md`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="text-center mt-2">
            <p className={`text-xs ${isNightMode ? 'text-indigo-400' : 'text-slate-400'}`}>Mul is a spirit companion, not a medical professional.</p>
        </div>
      </div>
    </div>
  );
};