import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Moon, ArrowRight } from "lucide-react";
import { ANIMATION_SPRING } from "../constants";

export type AppMode = "focus" | "break" | "sleep";

interface FocusTimerProps {
  focusMinutes: number;
  breakMinutes: number;
  sleepMinutes: number;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onSessionComplete: (mode: AppMode) => void;
  isImmersive: boolean;
  onToggleImmersive: () => void;
  onTimeUpdate: (secondsLeft: number, totalSeconds: number) => void;
}

export default function FocusTimer({ 
  focusMinutes, 
  breakMinutes, 
  sleepMinutes,
  mode,
  onModeChange,
  onSessionComplete,
  isImmersive,
  onToggleImmersive,
  onTimeUpdate
}: FocusTimerProps) {
  const getInitialTime = useCallback(() => {
    if (mode === "focus") return focusMinutes * 60;
    if (mode === "break") return breakMinutes * 60;
    return sleepMinutes * 60;
  }, [mode, focusMinutes, breakMinutes, sleepMinutes]);

  const [timeLeft, setTimeLeft] = useState(getInitialTime());
  const [isActive, setIsActive] = useState(false);
  const totalSecondsRef = useRef(getInitialTime());
  const workerRef = useRef<Worker | null>(null);

  const playAlert = useCallback(() => {
    try {
      const audioContent = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioContent.createOscillator();
      const envelope = audioContent.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioContent.currentTime);
      envelope.gain.setValueAtTime(0, audioContent.currentTime);
      envelope.gain.linearRampToValueAtTime(0.2, audioContent.currentTime + 0.1);
      envelope.gain.exponentialRampToValueAtTime(0.001, audioContent.currentTime + 1);
      osc.connect(envelope);
      envelope.connect(audioContent.destination);
      osc.start();
      osc.stop(audioContent.currentTime + 1);
    } catch (e) {
      console.error("Audio alert error", e);
    }
  }, []);

  const endTimeRef = useRef<number | null>(null);
  const isActiveRef = useRef(isActive);
  
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    workerRef.current = new Worker(new URL("../timerWorker.ts", import.meta.url), { type: "module" });
    workerRef.current.onmessage = (e: MessageEvent) => {
      if (e.data === 'tick' && isActiveRef.current && endTimeRef.current) {
        const remaining = Math.round((endTimeRef.current - Date.now()) / 1000);
        setTimeLeft(remaining <= 0 ? 0 : remaining);
      }
    };
    return () => workerRef.current?.terminate();
  }, []);

  const initialTimeRef = useRef(getInitialTime());

  useEffect(() => {
    const newInitial = getInitialTime();
    totalSecondsRef.current = newInitial;
    setTimeLeft(prev => {
      if (!isActive && prev === initialTimeRef.current) {
         return newInitial;
      }
      return prev;
    });
    initialTimeRef.current = newInitial;
  }, [getInitialTime]);

  useEffect(() => {
    setTimeLeft(getInitialTime());
    initialTimeRef.current = getInitialTime();
    setIsActive(false);
  }, [mode]);

  useEffect(() => {
    if (isActive) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      workerRef.current?.postMessage('start');
    } else {
      endTimeRef.current = null;
      workerRef.current?.postMessage('stop');
    }
  }, [isActive]); 

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(getInitialTime());
    workerRef.current?.postMessage('stop');
  }, [getInitialTime]);

  useEffect(() => {
    onTimeUpdate(timeLeft, totalSecondsRef.current);
    
    if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playAlert();
      onSessionComplete(mode);
      
      if (mode === "focus") {
        onModeChange("break");
      } else if (mode === "break") {
        onModeChange("focus");
      } else {
        onModeChange("focus");
      }
    }
  }, [timeLeft, isActive, mode, onModeChange, onSessionComplete, playAlert, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = timeLeft / totalSecondsRef.current;

  const getThemeColor = () => {
    if (mode === "focus") return "text-emerald-500";
    if (mode === "break") return "text-blue-400";
    return "text-indigo-400";
  };

  const getRadialColor = () => {
    if (mode === "focus") return "rgba(16, 185, 129, 0.2)";
    if (mode === "break") return "rgba(96, 165, 250, 0.2)";
    return "rgba(129, 140, 248, 0.2)";
  };

  return (
    <motion.div 
      layout
      className={`relative transition-all duration-1000 ${isImmersive ? "fixed inset-0 z-[100] bg-black flex items-center justify-center p-0" : "w-full"}`}
    >
      <AnimatePresence>
        {isImmersive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 overflow-hidden pointer-events-none"
          >
            <motion.div 
               animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.4, 0.3]
               }}
               transition={{ duration: 8, repeat: Infinity }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rounded-full blur-[160px]"
               style={{ background: `radial-gradient(circle, ${getRadialColor()} 0%, transparent 70%)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        layout
        transition={ANIMATION_SPRING.SOFT}
        className={`flex flex-col items-center justify-center space-y-12 p-8 md:p-12 transition-all duration-700 ${isImmersive ? "scale-110 md:scale-125" : "rounded-[3rem] bg-white/5 backdrop-blur-3xl border border-white/10"}`}
      >
        <div className="flex bg-white/5 p-1 rounded-full border border-white/5 relative">
          {(["focus", "break", "sleep"] as AppMode[]).map((m) => (
            <motion.button
              key={m}
              whileTap={{ scale: 0.95 }}
              onClick={() => { onModeChange(m); setIsActive(false); }}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all relative z-10 ${
                mode === m 
                  ? "text-black" 
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {m === "sleep" ? <Moon size={14} className="inline mr-1" /> : null}
              {m}
              {mode === m && (
                <motion.div 
                  layoutId="mode-pill"
                  className="absolute inset-0 bg-white rounded-full -z-10 shadow-lg"
                  transition={ANIMATION_SPRING.SOFT}
                />
              )}
            </motion.button>
          ))}
        </div>

        <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 group">
          <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-white/5"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              pathLength="1"
              style={{ pathLength: progress }}
              transition={{ duration: 1, ease: "linear" }}
              className={getThemeColor()}
            />
          </svg>
          
          <div className="absolute flex flex-col items-center">
            <motion.div 
               key={timeLeft}
               initial={{ y: 5, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="text-6xl md:text-8xl font-thin tracking-tighter text-white font-mono"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <div className={`mt-2 flex items-center space-x-2 transition-opacity ${isActive ? "opacity-30" : "opacity-0"}`}>
               <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
               <span className="text-[10px] uppercase font-bold tracking-[0.4em] text-white">Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-10">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleImmersive}
            className="p-4 rounded-full bg-white/5 text-white/30 hover:text-white transition-all transform"
            title="Focus Mode"
          >
            {isImmersive ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTimer}
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all transform shadow-2xl ${
              isActive 
                ? "bg-white/10 border border-white/20 text-white" 
                : "bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.15)]"
            }`}
          >
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" fill="currentColor" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            className="p-4 rounded-full bg-white/5 text-white/30 hover:text-white transition-all transform"
          >
            <RotateCcw size={24} />
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isImmersive && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={ANIMATION_SPRING.GENTLE}
            className="absolute bottom-12 left-12 right-12 flex justify-between items-end pointer-events-none"
          >
            <div>
               <p className="text-[10px] text-white/20 uppercase tracking-[0.5em] mb-2">Detox immersive</p>
               <h3 className="text-white/40 text-xl font-light tracking-tight italic">"Stay with the breath."</h3>
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="p-4 text-white/10 pointer-events-auto hover:text-white/40 transition-colors"
            >
               <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
