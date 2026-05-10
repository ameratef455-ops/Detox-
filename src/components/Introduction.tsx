import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Target, Volume2, Maximize2, Moon, ArrowRight, Check, Zap } from "lucide-react";

interface IntroductionProps {
  onComplete: () => void;
}

const steps = [
  {
    id: "focus",
    title: "Define Your Move",
    desc: "Single-tasking is the antidote to distraction. Set one clear intent for your session.",
    icon: <Target className="text-emerald-400" size={32} />,
    color: "emerald"
  },
  {
    id: "sound",
    title: "Sculpt Your Silence",
    desc: "Layer binaural beats and ambient textures. Designed to drop you into deep flow states.",
    icon: <Volume2 className="text-blue-400" size={32} />,
    color: "blue"
  },
  {
    id: "immersive",
    title: "Immersive Presence",
    desc: "Expand the timer to full-screen. No notifications, no UI, just you and your work.",
    icon: <Maximize2 className="text-white" size={32} />,
    color: "white"
  },
  {
    id: "sleep",
    title: "Delta Restoration",
    desc: "Transition to sleep with volume fades and screen dimming. Reset your neurochemistry.",
    icon: <Moon className="text-indigo-400" size={32} />,
    color: "indigo"
  }
];

export default function Introduction({ onComplete }: IntroductionProps) {
  const [showSplash, setShowSplash] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-[#0a0f0d] flex items-center justify-center font-sans">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-[0_0_50px_rgba(52,211,153,0.3)] mb-6"
            >
              <Zap size={40} className="text-white fill-white" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-light tracking-tighter text-white mb-2"
            >
              DETOX
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.8 }}
              className="text-[10px] uppercase font-bold tracking-[0.6em] text-white"
            >
              Focus Reclaimed
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="tutorial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-8 flex flex-col items-center text-center"
          >
            <div className="mb-12 flex space-x-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i <= currentStep ? "w-8 bg-white" : "w-2 bg-white/10"}`} 
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center"
              >
                <div className="mb-8 p-6 rounded-[2.5rem] bg-white/5 border border-white/5 shadow-2xl">
                  {steps[currentStep].icon}
                </div>
                <h2 className="text-3xl font-light tracking-tight text-white mb-4 italic">
                  {steps[currentStep].title}
                </h2>
                <p className="text-white/40 leading-relaxed max-w-xs mb-12">
                  {steps[currentStep].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={handleNext}
              className="group flex items-center space-x-3 px-8 py-4 rounded-full bg-white text-black font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              <span>{currentStep === steps.length - 1 ? "Start Flow" : "Continue"}</span>
              {currentStep === steps.length - 1 ? <Check size={16} /> : <ArrowRight size={16} />}
            </button>
            
            <p className="mt-8 text-[9px] text-white/20 uppercase tracking-widest font-medium">
              Made by Amer Atef • V1.0
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
