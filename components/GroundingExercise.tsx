import React, { useState } from 'react';
import { MulAvatar } from './MulAvatar';
import { ambientSound } from '../services/audioService';

interface GroundingExerciseProps {
  onComplete: () => void;
  waterLevel: number;
}

const STEPS = [
  {
    id: 'start',
    title: "Roots in the Water",
    text: "Let's gently find our place here. Like a lotus flower resting on the surface, or roots holding onto the riverbed.",
    action: "Get comfortable...",
    color: "bg-green-100"
  },
  {
    id: '5',
    title: "5 Things You See",
    text: "Look around gently. Find 5 things that have color or light. Let your eyes rest on them like a butterfly landing.",
    action: "Tap when found",
    count: 5,
    color: "bg-blue-50"
  },
  {
    id: '4',
    title: "4 Things You Can Touch",
    text: "Reach out or feel where you are. The fabric of your clothes, the smooth table, the air on your skin. Find 4 textures.",
    action: "Tap when felt",
    count: 4,
    color: "bg-amber-50"
  },
  {
    id: '3',
    title: "3 Things You Hear",
    text: "Close your eyes if you like. Listen for 3 sounds. A distant car? A bird? The hum of the room?",
    action: "Tap when heard",
    count: 3,
    color: "bg-purple-50"
  },
  {
    id: '2',
    title: "2 Things You Can Smell",
    text: "Breathe in... is there a scent of coffee? Rain? Or just the clean smell of air? Find 2 scents.",
    action: "Tap when found",
    count: 2,
    color: "bg-rose-50"
  },
  {
    id: '1',
    title: "1 Thing You Can Taste",
    text: "Notice one taste in your mouth. Or notice one emotion you are feeling right now, just one, and let it be.",
    action: "Tap when noticed",
    count: 1,
    color: "bg-teal-50"
  },
  {
    id: 'end',
    title: "You Are Here",
    text: "You are grounded. Safe. Connected. Like a tree drinking from a quiet stream.",
    action: "Finish",
    color: "bg-emerald-100"
  }
];

export const GroundingExercise: React.FC<GroundingExerciseProps> = ({ onComplete, waterLevel }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [subProgress, setSubProgress] = useState(0);

  const currentStep = STEPS[stepIndex];

  const handleNext = () => {
    // Play interaction sound
    ambientSound.playChime(400 + (stepIndex * 50));

    if (currentStep.count && subProgress < currentStep.count - 1) {
      setSubProgress(prev => prev + 1);
    } else {
      if (stepIndex < STEPS.length - 1) {
        setStepIndex(prev => prev + 1);
        setSubProgress(0);
      } else {
        onComplete();
      }
    }
  };

  return (
    <div className={`flex flex-col h-full w-full p-6 overflow-y-auto transition-colors duration-700 ${currentStep.color} bg-opacity-40`}>
      
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in pt-4">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">{currentStep.title}</h2>
        <div className="flex justify-center gap-1 mt-2">
          {STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-500 ${idx === stepIndex ? 'w-8 bg-mul-deep' : 'w-2 bg-slate-300'}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative">
        
        {/* Avatar */}
        <div className="mb-8 transform transition-all duration-500 hover:scale-105">
           <MulAvatar mood={stepIndex === STEPS.length - 1 ? 'celebrating' : 'calm'} size="md" waterLevel={waterLevel} />
        </div>

        {/* Text Card */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-white/50 text-center animate-float w-full">
           <p className="text-lg text-slate-700 leading-relaxed font-medium">
             {currentStep.text}
           </p>

           {/* Sub-progress dots for steps with counts (5, 4, 3...) */}
           {currentStep.count && (
             <div className="flex justify-center gap-3 mt-6">
                {Array.from({ length: currentStep.count }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-3 h-3 rounded-full border border-mul-deep transition-all duration-300 ${i <= subProgress ? 'bg-mul-main scale-110' : 'bg-transparent opacity-30'}`}
                  ></div>
                ))}
             </div>
           )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="mt-10 px-10 py-4 bg-mul-main hover:bg-mul-deep text-white rounded-full shadow-lg hover:shadow-xl transition-all transform active:scale-95 font-bold text-lg flex items-center gap-2"
        >
          <span>{currentStep.action}</span>
          {stepIndex < STEPS.length - 1 && <span>🌿</span>}
        </button>

      </div>
    </div>
  );
};
