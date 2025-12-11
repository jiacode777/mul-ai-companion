import React, { useState } from 'react';
import { MulState } from '../types';
import { ambientSound } from '../services/audioService';

interface MulAvatarProps {
  mood: MulState['mood'];
  size?: 'sm' | 'md' | 'lg';
  waterLevel?: number; // 0 to 8
  isNightMode?: boolean;
}

export const MulAvatar: React.FC<MulAvatarProps> = ({ mood, size = 'md', waterLevel = 4, isNightMode = false }) => {
  const [isBooped, setIsBooped] = useState(false);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  // --- Animation Logic ---
  const bodyAnimation = 
    mood === 'celebrating' ? 'animate-bounce-wild' :
    mood === 'listening' ? 'animate-float-fast' : 
    mood === 'thinking' ? 'animate-pulse' : 
    mood === 'sad' ? 'animate-float-slow' :
    mood === 'calm' ? 'animate-float-slow' :
    'animate-float';

  const limbAnimation = 
    mood === 'celebrating' ? 'animate-wave' :
    mood === 'listening' ? 'animate-wave' : 
    'animate-wiggle';

  const rotationClass = 
    mood === 'curious' ? 'rotate-6' : 
    mood === 'sad' ? '-rotate-3' : 
    'rotate-0';

  // --- Water Level Calculation ---
  const fillPercentage = Math.min(100, Math.max(15, (waterLevel / 8) * 100));

  // --- Mood Specific Styles ---
  const isSad = mood === 'sad';
  
  // Body Gradient overrides
  const bodyGradient = isNightMode 
    ? 'bg-gradient-to-br from-indigo-200 to-indigo-400'
    : isSad 
      ? 'bg-gradient-to-br from-slate-200 to-mul-sad' 
      : 'bg-gradient-to-br from-mul-light to-mul-light'; 

  // Water Fill Color
  const waterColor = isNightMode
    ? 'bg-indigo-500'
    : isSad 
      ? 'bg-mul-sad' 
      : 'bg-mul-main';

  const handleInteraction = () => {
    if (!isBooped) {
      setIsBooped(true);
      ambientSound.playBoop();
      setTimeout(() => setIsBooped(false), 500);
    }
  };

  const handleMouseEnter = () => {
    ambientSound.playHover();
  };

  return (
    <div 
      className={`relative flex items-center justify-center ${sizeClasses[size]} select-none transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 group`}
      onClick={handleInteraction}
      onMouseEnter={handleMouseEnter}
      title="Boop Mul!"
    >
      
      {/* Outer Glow / Ripple Effect */}
      <div className={`absolute inset-0 opacity-30 blur-xl rounded-full ${mood === 'happy' || mood === 'listening' || mood === 'celebrating' ? 'animate-pulse' : 'animate-pulse-slow'} ${isNightMode ? 'bg-indigo-300' : 'bg-mul-glow'}`}></div>
      
      {/* Hover Ripple Animation */}
      <div 
        className={`absolute inset-0 rounded-full border-2 opacity-0 group-hover:opacity-40 group-hover:animate-ping ${isNightMode ? 'border-indigo-300' : 'border-mul-main'}`} 
        style={{ animationDuration: '2.5s' }}
      ></div>

      {/* Interaction Ripple */}
      {isBooped && (
        <div className={`absolute inset-0 border-2 rounded-full animate-ping opacity-50 ${isNightMode ? 'border-indigo-200' : 'border-mul-main'}`}></div>
      )}

      {/* Main Motion Container */}
      <div className={`relative w-full h-full flex items-center justify-center ${bodyAnimation}`}>
        
        {/* Limbs (Starfish Nubs) */}
        <div className={`absolute -left-[10%] top-[45%] w-[30%] h-[30%] ${isNightMode ? 'bg-indigo-400' : isSad ? 'bg-mul-sad' : 'bg-mul-main'} rounded-full origin-right ${limbAnimation}`}></div>
        <div className={`absolute -right-[10%] top-[45%] w-[30%] h-[30%] ${isNightMode ? 'bg-indigo-400' : isSad ? 'bg-mul-sad' : 'bg-mul-main'} rounded-full origin-left ${limbAnimation}`} style={{ animationDelay: '0.5s' }}></div>
        <div className={`absolute left-[15%] -bottom-[5%] w-[25%] h-[25%] ${isNightMode ? 'bg-indigo-400' : isSad ? 'bg-mul-sad' : 'bg-mul-main'} rounded-full origin-top-right ${limbAnimation}`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute right-[15%] -bottom-[5%] w-[25%] h-[25%] ${isNightMode ? 'bg-indigo-400' : isSad ? 'bg-mul-sad' : 'bg-mul-main'} rounded-full origin-top-left ${limbAnimation}`} style={{ animationDelay: '1.5s' }}></div>

        {/* Night Cap */}
        {isNightMode && (
          <div className="absolute -top-[25%] left-[10%] w-[80%] h-[60%] z-30 animate-wiggle origin-bottom-left pointer-events-none">
             {/* Cap Body */}
             <div className="w-full h-full bg-slate-700 rounded-t-full rounded-br-full relative" style={{ borderRadius: '100% 0 60% 0' }}>
                {/* Pompom */}
                <div className="absolute -right-2 top-10 w-6 h-6 bg-yellow-100 rounded-full animate-bounce"></div>
                {/* Stripes */}
                <div className="absolute top-4 left-2 w-4 h-full border-r-2 border-slate-600/30 transform rotate-12"></div>
                <div className="absolute top-4 left-6 w-4 h-full border-r-2 border-slate-600/30 transform rotate-12"></div>
             </div>
          </div>
        )}

        {/* Main Body Droplet */}
        <div className={`
          relative w-full h-full 
          ${bodyGradient}
          shadow-inner border-2 
          ${isNightMode ? 'border-indigo-200/30' : 'border-white/40'}
          flex items-center justify-center
          overflow-hidden
          backdrop-blur-sm
          z-10
          transition-transform duration-500
          ${rotationClass}
          ${isBooped ? 'scale-90' : ''} 
        `}
        style={{
          borderRadius: '45% 45% 40% 40%', 
          boxShadow: isSad || isNightMode
            ? 'inset -10px -10px 20px rgba(0,0,0,0.1), inset 10px 10px 20px rgba(255, 255, 255, 0.4)'
            : 'inset -10px -10px 20px rgba(0, 151, 167, 0.1), inset 10px 10px 20px rgba(255, 255, 255, 0.8)'
        }}
        >
          {/* Water Fill Visual */}
          <div 
            className={`absolute bottom-0 left-0 right-0 ${waterColor} transition-all duration-1000 ease-in-out opacity-90`}
            style={{ height: `${fillPercentage}%` }}
          >
             <div className="absolute -top-1 left-0 w-full h-2 bg-white/30 rounded-[100%] animate-tide"></div>
             {mood === 'celebrating' && (
                <>
                  <div className="absolute bottom-2 left-1/4 w-2 h-2 bg-white/50 rounded-full animate-float-fast"></div>
                  <div className="absolute bottom-4 right-1/4 w-1 h-1 bg-white/50 rounded-full animate-float-fast delay-75"></div>
                </>
             )}
          </div>

          {/* Shine Reflection */}
          <div className="absolute top-4 left-4 w-1/4 h-1/4 bg-white opacity-60 rounded-full blur-[2px] z-20"></div>

          {/* Face Container */}
          <div className={`flex flex-col items-center justify-center gap-1 transition-transform duration-500 z-20 relative`}>
            
            {/* Eyes */}
            <div className="flex gap-4 items-center">
              {mood === 'sleeping' || isNightMode ? (
                <>
                  <div className="w-3 h-1 bg-slate-700 rounded-full opacity-60 translate-y-1"></div>
                  <div className="w-3 h-1 bg-slate-700 rounded-full opacity-60 translate-y-1"></div>
                </>
              ) : mood === 'calm' ? (
                <>
                  <div className="w-3 h-0.5 bg-slate-700 rounded-full"></div>
                  <div className="w-3 h-0.5 bg-slate-700 rounded-full"></div>
                </>
               ) : mood === 'sad' ? (
                <>
                   <div className="w-3 h-1 bg-slate-700 rounded-full rotate-12 mt-1"></div>
                   <div className="w-3 h-1 bg-slate-700 rounded-full -rotate-12 mt-1"></div>
                </>
              ) : mood === 'curious' ? (
                <>
                   <div className="w-3 h-4 bg-slate-700 rounded-full animate-blink"></div>
                   <div className="w-3 h-2 bg-slate-700 rounded-full"></div>
                </>
              ) : mood === 'thinking' ? (
                 <>
                   <div className="w-3 h-3 bg-slate-700 rounded-full animate-bounce"></div>
                   <div className="w-3 h-3 bg-slate-700 rounded-full animate-bounce delay-100"></div>
                </>
              ) : (
                <>
                   <div className="w-3 h-4 bg-slate-700 rounded-full animate-blink"></div>
                   <div className="w-3 h-4 bg-slate-700 rounded-full animate-blink delay-75"></div>
                </>
              )}
            </div>

            {/* Mouth */}
            <div className="mt-1 transition-all duration-300">
               {isBooped ? (
                 <div className="w-2 h-2 border-2 border-slate-700 rounded-full opacity-60"></div>
               ) : (
                 <>
                   {(mood === 'happy' || mood === 'celebrating') && !isNightMode && <div className="w-2 h-1 bg-slate-700 rounded-b-full opacity-50"></div>}
                   {isNightMode && <div className="w-1 h-1 bg-slate-700 rounded-full opacity-30"></div>}
                   {mood === 'listening' && !isNightMode && <div className="w-2 h-1 bg-slate-700 rounded-full opacity-30"></div>}
                   {mood === 'thinking' && !isNightMode && <div className="w-2 h-2 border-b-2 border-slate-700 rounded-full opacity-40"></div>}
                   {mood === 'sad' && !isNightMode && <div className="w-2 h-1 border-t-2 border-slate-700 rounded-t-full opacity-50 mt-1"></div>}
                   {mood === 'calm' && !isNightMode && <div className="w-2 h-0.5 bg-slate-700 rounded-full opacity-40"></div>}
                   {mood === 'curious' && !isNightMode && <div className="w-1.5 h-1.5 border-2 border-slate-700 rounded-full opacity-50"></div>}
                 </>
               )}
            </div>
            
            {/* Cheeks */}
            <div className="absolute top-1/2 w-full flex justify-between px-3 opacity-40">
                <div className={`w-3 h-2 ${isSad ? 'bg-slate-300' : 'bg-pink-300'} rounded-full blur-[1px]`}></div>
                <div className={`w-3 h-2 ${isSad ? 'bg-slate-300' : 'bg-pink-300'} rounded-full blur-[1px]`}></div>
            </div>

            {/* Snot bubble if sleeping/night */}
            {isNightMode && (
                <div className="absolute top-1 right-2 w-3 h-3 bg-white/40 rounded-full animate-pulse-slow border border-white/50"></div>
            )}

          </div>
        </div>
      </div>
      
      {/* Shadow/Ripples at bottom */}
      <div className={`absolute -bottom-4 w-2/3 h-4 opacity-10 blur-md rounded-[100%] animate-pulse ${isNightMode ? 'bg-black' : 'bg-mul-deep'}`}></div>
    </div>
  );
};