import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Atmosphere from "./components/Atmosphere";
import FocusTimer, { AppMode } from "./components/FocusTimer";
import TaskSolo from "./components/TaskSolo";
import AmbientNoise from "./components/AmbientNoise";
import SettingsModal from "./components/SettingsModal";
import Introduction from "./components/Introduction";
import Notification, { NotificationType } from "./components/Notification";
import { Settings, Zap, Heart, Sparkles, Moon, Brain, PenLine, Volume2, VolumeX } from "lucide-react";

interface Task {
  id: string;
  text: string;
}

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>("focus");
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("detox_admin_mode") === "true");
  
  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: NotificationType;
    message: string;
    onConfirm?: () => void;
  }>({
    show: false,
    type: 'success',
    message: ''
  });

  const notify = (type: NotificationType, message: string, onConfirm?: () => void) => {
    setNotification({ show: true, type, message, onConfirm });
  };
  
  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.5);
  const [volumeFade, setVolumeFade] = useState(1);

  // Settings state
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [sleepMinutes, setSleepMinutes] = useState(60);
  const [hearts, setHearts] = useState(0);
  const [showHeartPopup, setShowHeartPopup] = useState(false);

  // Sleep mode specific
  const [sleepThoughts, setSleepThoughts] = useState("");
  const [screenDim, setScreenDim] = useState(0); // 0 to 1

  // Load persistence
  useEffect(() => {
    const savedFocus = localStorage.getItem("detox_focus");
    const savedBreak = localStorage.getItem("detox_break");
    const savedSleep = localStorage.getItem("detox_sleep");
    const savedHearts = localStorage.getItem("detox_hearts");
    const introSeen = localStorage.getItem("detox_intro_seen");

    if (savedFocus) setFocusMinutes(parseInt(savedFocus));
    if (savedBreak) setBreakMinutes(parseInt(savedBreak));
    if (savedSleep) setSleepMinutes(parseInt(savedSleep));
    if (savedHearts) setHearts(parseInt(savedHearts));
    if (!introSeen) setShowIntroduction(true);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const handleIntroComplete = () => {
    localStorage.setItem("detox_intro_seen", "true");
    setShowIntroduction(false);
  };

  const handleSessionComplete = (mode: AppMode) => {
    setIsSessionActive(false);
    if (mode === "focus") {
      const newHearts = hearts + 1;
      setHearts(newHearts);
      localStorage.setItem("detox_hearts", newHearts.toString());
      setShowHeartPopup(true);
      setTimeout(() => setShowHeartPopup(false), 3000);
      
      // Auto-remove task after focus session
      setActiveTask(null);
    }
  };

  const handleTimeUpdate = useCallback((secondsLeft: number, totalSeconds: number) => {
    setIsSessionActive(secondsLeft > 0 && secondsLeft < totalSeconds);

    // Sleep mode logic: Fade out volume and dim screen in last 10 minutes
    if (appMode === "sleep") {
      const tenMinsInSecs = 10 * 60;
      if (secondsLeft <= tenMinsInSecs) {
        const factor = secondsLeft / tenMinsInSecs;
        setVolumeFade(factor);
        setScreenDim(1 - factor);
      } else {
        setVolumeFade(1);
        setScreenDim(0);
      }
    } else {
      setVolumeFade(1);
      setScreenDim(0);
    }
  }, [appMode]);

  const addTask = (text: string) => {
    setActiveTask({ id: Math.random().toString(36).substring(7), text });
  };

  const currentThemeColor = () => {
    if (appMode === "focus") return "bg-emerald-500";
    if (appMode === "break") return "bg-blue-500";
    return "bg-indigo-600";
  };

  const currentAccent = () => {
    if (appMode === "focus") return "text-emerald-400";
    if (appMode === "break") return "text-blue-400";
    return "text-indigo-400";
  };

  return (
    <div className={`min-h-screen text-white font-sans selection:bg-emerald-500/30 transition-colors duration-1000 ${appMode === 'sleep' ? 'bg-[#050810]' : 'bg-[#0a0f0d]'}`}>
      <AnimatePresence>
        {showIntroduction && (
          <Introduction onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>
      <Atmosphere />
      
      {/* Screen Dimmer for Sleep Mode */}
      <div 
        className="fixed inset-0 z-[999] pointer-events-none bg-black transition-opacity duration-1000" 
        style={{ opacity: screenDim * 0.9 }} 
      />

      {/* Header */}
      {!isImmersive && (
        <header className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-50">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-1000 ${currentThemeColor()}`}>
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-medium tracking-tight leading-none">Detox</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">{appMode} mode</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 transition-all">
                <Heart size={16} className={`transition-colors ${hearts > 0 ? "text-red-400 fill-red-400/20" : "text-white/20"}`} />
                <span className="text-xs font-mono font-bold leading-none">{hearts}</span>
            </div>
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`transition-all duration-1000 ${isImmersive ? "pt-0 max-w-none" : "pt-32 pb-20 px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"}`}>
        
        {/* Left Column: Tasks & Noise (Standard View Only) */}
        {!isImmersive && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-8 order-2 lg:order-1"
          >
            {appMode !== "sleep" ? (
                <TaskSolo 
                    activeTask={activeTask} 
                    onAddTask={addTask} 
                    onRemoveTask={() => setActiveTask(null)}
                    isSessionActive={isSessionActive}
                />
            ) : (
                <div className="p-6 rounded-[2rem] bg-indigo-500/5 backdrop-blur-3xl border border-indigo-500/10 space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                        <PenLine size={16} />
                        <h2 className="text-[10px] font-bold uppercase tracking-widest">Clear Your Mind</h2>
                    </div>
                    <motion.textarea
                        disabled={isSessionActive}
                        value={sleepThoughts}
                        onChange={(e) => setSleepThoughts(e.target.value)}
                        placeholder="Write down any thoughts keeping you awake..."
                        animate={isSessionActive ? { opacity: 0.1, filter: "blur(4px)" } : { opacity: 1, filter: "blur(0px)" }}
                        className="w-full h-32 bg-transparent text-sm text-indigo-200/60 placeholder:text-indigo-900/50 resize-none outline-none focus:placeholder:opacity-0 transition-all border-none"
                    />
                    {isSessionActive && (
                        <p className="text-[9px] text-indigo-500/40 uppercase tracking-tighter text-center">Your thoughts are fading away...</p>
                    )}
                </div>
            )}
            
            <AmbientNoise 
                isMuted={isMuted} 
                onMuteToggle={() => setIsMuted(!isMuted)} 
                masterVolume={masterVolume}
                sleepModeVolumeFade={volumeFade}
                notify={notify}
                isAdmin={isAdmin}
                setIsAdmin={setIsAdmin}
            />
          </motion.div>
        )}

        {/* Center Column: Timer */}
        <motion.div 
          animate={{ x: isImmersive ? 0 : 0 }}
          className={`${isImmersive ? "fixed inset-0 z-[100]" : "lg:col-span-8"} flex flex-col items-center order-1 lg:order-2`}
        >
          <FocusTimer 
            focusMinutes={focusMinutes}
            breakMinutes={breakMinutes}
            sleepMinutes={sleepMinutes}
            mode={appMode}
            onModeChange={setAppMode}
            onSessionComplete={handleSessionComplete}
            isImmersive={isImmersive}
            onToggleImmersive={() => setIsImmersive(!isImmersive)}
            onTimeUpdate={handleTimeUpdate}
          />
          
          {!isImmersive && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
               <FocusFeature 
                  icon={appMode === 'sleep' ? <Moon size={18} /> : <Brain size={18} />} 
                  title={appMode === 'sleep' ? "Dark Therapy" : "ADHD Optimized"} 
                  desc={appMode === 'sleep' ? "Delta waves for deep restoration." : "Minimal sensory overhead."} 
                  accent={currentAccent()}
               />
               <FocusFeature 
                  icon={<Sparkles size={18} />} 
                  title="Master Mix" 
                  desc="Layered noises and binaural beats." 
                  accent={currentAccent()}
               />
               <FocusFeature 
                  icon={isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />} 
                  title="Persistence" 
                  desc="Works continuously in the background." 
                  accent={currentAccent()}
               />
            </div>
          )}
        </motion.div>
      </main>

      {/* Heart Popup */}
      <AnimatePresence>
        {showHeartPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-4 rounded-3xl text-white shadow-2xl flex items-center space-x-3 z-[1000] pointer-events-none ${currentThemeColor()}`}
          >
            <Sparkles size={20} className="animate-pulse" />
            <span className="font-semibold tracking-tight">Focus milestone reached! +1 Heart.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        focusMinutes={focusMinutes}
        breakMinutes={breakMinutes}
        sleepMinutes={sleepMinutes}
        onUpdateFocus={(v) => { setFocusMinutes(v); localStorage.setItem("detox_focus", v.toString()); }}
        onUpdateBreak={(v) => { setBreakMinutes(v); localStorage.setItem("detox_break", v.toString()); }}
        onUpdateSleep={(v) => { setSleepMinutes(v); localStorage.setItem("detox_sleep", v.toString()); }}
        isInstallable={isInstallable}
        onInstall={installApp}
        notify={notify}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      <Notification 
        {...notification}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
      
      {/* Immersive Minimize Overlay */}
      {isImmersive && (
          <button 
            onClick={() => setIsImmersive(false)}
            className="fixed top-8 right-8 z-[1001] p-4 rounded-full bg-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all backdrop-blur-xl border border-white/5"
          >
            <Minimize size={24} />
          </button>
      )}

      {/* Status Bar */}
      {!isImmersive && (
        <footer className="fixed bottom-0 left-0 right-0 p-8 flex flex-col items-center space-y-4 pointer-events-none">
          <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 bg-black/40 backdrop-blur-2xl px-6 py-2.5 rounded-full border border-white/5 font-bold">
            {isSessionActive ? `Current session active • ${appMode}` : "System Ready • Awaiting Intent"}
          </p>
          <div className="flex flex-col items-center opacity-30">
            <p className="text-[8px] uppercase tracking-[0.2em] font-medium">Made by Amer Atef with love</p>
            <p className="text-[8px] font-mono mt-1">V1.0 🎉</p>
          </div>
        </footer>
      )}
    </div>
  );
}

function FocusFeature({ icon, title, desc, accent }: any) {
  return (
    <div className="p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
      <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center transition-colors mb-4 ${accent}`}>
        {icon}
      </div>
      <h4 className="text-sm font-bold text-white tracking-tight group-hover:translate-x-0.5 transition-transform mb-1">{title}</h4>
      <p className="text-[11px] text-white/30 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function Minimize({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v5H3"/><path d="M21 8h-5V3"/><path d="M3 16h5v5"/><path d="M16 21v-5h5"/></svg>
    )
}

