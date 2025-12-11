import React, { useState, useEffect } from 'react';
import { MulAvatar } from './MulAvatar';
import { ambientSound } from '../services/audioService';

interface BreathingExerciseProps {
  onComplete: () => void;
  waterLevel: number;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({ onComplete, waterLevel }) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [text, setText] = useState('Breathe in gently...');
  const [timeLeft, setTimeLeft] = useState(4); // seconds per phase

  useEffect(() => {
    // Play a gentle chime when the phase changes
    if (phase === 'inhale') {
      ambientSound.playChime(349.23); // F4 - Uplifting
    } else if (phase === 'hold') {
      ambientSound.playChime(440.00); // A4 - Steady
    } else if (phase === 'exhale') {
      ambientSound.playChime(523.25); // C5 - Release
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Transition phase
          if (phase === 'inhale') {
            setPhase('hold');
            setText('Hold softly like a cloud...');
            return 4;
          } else if (phase === 'hold') {
            setPhase('exhale');
            setText('Let it go like water flowing...');
            return 6; // Longer exhale is relaxing
          } else {
            setPhase('inhale');
            setText('Breathe in gently...');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Smooth scale transition styles
  const circleStyle = {
    transform: `scale(${phase === 'inhale' ? 1.5 : phase === 'exhale' ? 1 : 1.5})`,
    transition: `transform ${phase === 'exhale' ? '6s' : '4s'} ease-in-out`
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in w-full">
      <div className="relative mb-12">
        {/* Breathing Visual Background */}
        <div 
          className="absolute inset-0 bg-mul-soft rounded-full opacity-30 blur-2xl"
          style={circleStyle}
        />
        {/* Avatar */}
        <div className="relative z-10 transition-transform duration-[4000ms] ease-in-out">
           <MulAvatar mood="calm" size="lg" waterLevel={waterLevel} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-600 mb-2 transition-opacity duration-500 min-h-[40px] text-center">
        {text}
      </h2>
      
      <p className="text-slate-400 mb-8 font-mono text-xl">{timeLeft}</p>

      <button 
        onClick={onComplete}
        className="px-8 py-3 bg-white text-mul-deep border border-mul-soft rounded-full hover:bg-mul-light transition-colors shadow-sm font-medium"
      >
        I feel calm now
      </button>
    </div>
  );
};
