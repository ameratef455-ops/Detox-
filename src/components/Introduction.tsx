import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Target, Volume2, Maximize2, Moon, ArrowRight, Check, Zap } from "lucide-react";
import { ANIMATION_SPRING } from "../constants";

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
    <div className="fixed inset-0 z-[2000] bg-[#0a0f0d] flex items-center justify-center font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={ANIMATION_SPRING.SOFT}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-[0_0_60px_rgba(52,211,153,0.2)] mb-8"
            >
              <Zap size={44} className="text-white fill-white" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0, letterSpacing: "0.5em" }}
              animate={{ y: 0, opacity: 1, letterSpacing: "0.2em" }}
              transition={{ delay: 0.3, ...ANIMATION_SPRING.SOFT }}
              className="text-4xl font-light text-white mb-2"
            >
              DETOX
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.6 }}
              className="text-[10px] uppercase font-bold tracking-[0.6em] text-white"
            >
              Focus Reclaimed
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="tutorial"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={ANIMATION_SPRING.SOFT}
            className="w-full max-w-md p-8 flex flex-col items-center text-center"
          >
            <div className="mb-12 flex space-x-2">
              {steps.map((_, i) => (
                <motion.div 
                  key={i} 
                  layout
                  className={`h-1.5 rounded-full ${i <= currentStep ? "bg-white" : "bg-white/10"}`} 
                  initial={false}
                  animate={{ 
                    width: i === currentStep ? 40 : (i < currentStep ? 8 : 8),
                    opacity: i === currentStep ? 1 : 0.3
                  }}
                  transition={ANIMATION_SPRING.SOFT}
                />
              ))}
            </div>

            <div className="h-[400px] flex items-center justify-center w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 40, scale: 0.9, filter: "blur(10px)" }}
                    animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -40, scale: 0.9, filter: "blur(10px)" }}
                    transition={ANIMATION_SPRING.SOFT}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-8 p-8 rounded-[3rem] bg-white/5 border border-white/5 shadow-2xl relative">
                      <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
                      <div className="relative z-10">
                        {steps[currentStep].icon}
                      </div>
                    </div>
                    <h2 className="text-3xl font-light tracking-tight text-white mb-4 italic">
                      {steps[currentStep].title}
                    </h2>
                    <p className="text-white/40 leading-relaxed max-w-xs font-medium">
                      {steps[currentStep].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="group flex items-center space-x-3 px-10 py-5 rounded-full bg-white text-black font-black uppercase text-xs tracking-widest transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] mt-8"
            >
              <span>{currentStep === steps.length - 1 ? "Start Flow" : "Continue"}</span>
              {currentStep === steps.length - 1 ? <Check size={18} /> : <ArrowRight size={18} />}
            </motion.button>
            
            <p className="mt-12 text-[9px] text-white/10 uppercase tracking-widest font-bold">
              Made by Amer Atef • V1.0
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
