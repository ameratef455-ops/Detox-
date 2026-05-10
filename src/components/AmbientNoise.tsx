import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Wind, CloudRain, TreePine, Coffee, Zap, Moon, Sparkles, Heart, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SoundNode {
  source: AudioBufferSourceNode | OscillatorNode | null;
  gain: GainNode | null;
}

export type BinauralMode = "none" | "alpha" | "beta" | "delta";

interface AmbientNoiseProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  masterVolume: number;
  sleepModeVolumeFade?: number; // 0 to 1
}

export default function AmbientNoise({ 
  isMuted, 
  onMuteToggle, 
  masterVolume, 
  sleepModeVolumeFade = 1 
}: AmbientNoiseProps) {
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [binauralMode, setBinauralMode] = useState<BinauralMode>("none");
  const [unlockedSounds, setUnlockedSounds] = useState<Set<string>>(new Set());
  const [promoInput, setPromoInput] = useState("");
  const [showPromo, setShowPromo] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [dynamicCodes, setDynamicCodes] = useState<string[]>([]);
  
  const audioContext = useRef<AudioContext | null>(null);
  const soundNodes = useRef<{ [key: string]: SoundNode }>({});
  const binauralNodes = useRef<{ left: OscillatorNode | null, right: OscillatorNode | null, gain: GainNode | null }>({
    left: null,
    right: null,
    gain: null
  });
  const masterGain = useRef<GainNode | null>(null);

  const HARDCODED_CODES = ["DETOX100", "FLOW2026", "AMER_DETOX", "FOCUS_KING", "SILENCE_GOLD", "DEEP_WORK", "NO_DISTRACTION", "LEVEL_UP", "PREMIUM_ZEN", "ADHD_GOD"];
  const ADMIN_SECRET = "ADMIN_ACCESS_2026";

  useEffect(() => {
    const savedUnlocked = localStorage.getItem("detox_unlocked");
    if (savedUnlocked) setUnlockedSounds(new Set(JSON.parse(savedUnlocked)));

    const savedDynamic = localStorage.getItem("detox_dynamic_codes");
    if (savedDynamic) setDynamicCodes(JSON.parse(savedDynamic));
  }, []);

  const handleUnlock = () => {
    const code = promoInput.toUpperCase().trim();
    
    if (code === ADMIN_SECRET) {
        setShowAdminPanel(true);
        setPromoInput("");
        return;
    }

    const usedCodes = JSON.parse(localStorage.getItem("detox_used_codes") || "[]");

    if (usedCodes.includes(code)) {
      alert("This code has already been used on this device!");
      return;
    }

    const isHardcoded = HARDCODED_CODES.includes(code);
    const isDynamic = dynamicCodes.includes(code);

    if (isHardcoded || isDynamic) {
      const newUnlocked = new Set([...unlockedSounds, "PREMIUM_ALL"]);
      setUnlockedSounds(newUnlocked);
      localStorage.setItem("detox_unlocked", JSON.stringify([...newUnlocked]));
      
      // Mark code as used locally
      const newUsed = [...usedCodes, code];
      localStorage.setItem("detox_used_codes", JSON.stringify(newUsed));
      
      // If dynamic, remove it so it's "burned"
      if (isDynamic) {
        const remaining = dynamicCodes.filter(c => c !== code);
        setDynamicCodes(remaining);
        localStorage.setItem("detox_dynamic_codes", JSON.stringify(remaining));
      }

      setPromoInput("");
      setShowPromo(false);
      alert("Successfully Unlocked Supporter Content! 🚀\nEnjoy the Deep Flow Mixes (One-time usage code applied).");
    } else {
      alert("Invalid Code. Support the project to get your unique key!");
    }
  };

  const addAdminCode = (newCode: string) => {
    const formatted = newCode.toUpperCase().trim();
    if (!formatted) return;
    const updated = [...dynamicCodes, formatted];
    setDynamicCodes(updated);
    localStorage.setItem("detox_dynamic_codes", JSON.stringify(updated));
  };

  const initAudio = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGain.current = audioContext.current.createGain();
      masterGain.current.connect(audioContext.current.destination);
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  }, []);

  useEffect(() => {
    if (masterGain.current) {
      const targetGain = isMuted ? 0 : masterVolume * sleepModeVolumeFade;
      masterGain.current.gain.setTargetAtTime(targetGain, audioContext.current!.currentTime, 0.1);
    }
  }, [isMuted, masterVolume, sleepModeVolumeFade]);

  const createNoiseBuffer = (type: 'brown' | 'pink' | 'white') => {
    const ctx = audioContext.current!;
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    } else if (type === 'pink') {
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }
    } else {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }
    return buffer;
  };

  const startSound = (id: string) => {
    initAudio();
    const ctx = audioContext.current!;
    
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    
    // Custom processing based on ID
    if (id === 'rain') {
      source.buffer = createNoiseBuffer('pink');
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1000;
      source.connect(filter);
      filter.connect(gain);
    } else if (id === 'forest') {
       source.buffer = createNoiseBuffer('brown');
       const filter = ctx.createBiquadFilter();
       filter.type = "lowpass";
       filter.frequency.value = 500;
       
       // Crickets (simple modulation)
       const osc = ctx.createOscillator();
       const oscGain = ctx.createGain();
       osc.type = "sine";
       osc.frequency.value = 4000;
       oscGain.gain.value = 0.01;
       
       const lfo = ctx.createOscillator();
       lfo.frequency.value = 0.5;
       lfo.connect(oscGain.gain);
       lfo.start();
       osc.connect(oscGain);
       oscGain.connect(gain);
       osc.start();

       source.connect(filter);
       filter.connect(gain);
    } else if (id === 'space') {
      source.buffer = createNoiseBuffer('brown');
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 200;
      source.connect(filter);
      filter.connect(gain);
    } else if (id === 'coffee') {
       source.buffer = createNoiseBuffer('pink');
       const filter = ctx.createBiquadFilter();
       filter.type = "bandpass";
       filter.frequency.value = 1500;
       filter.Q.value = 1;
       source.connect(filter);
       filter.connect(gain);
    } else if (id === 'cyber') {
      source.buffer = createNoiseBuffer('brown');
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 250;
      filter.Q.value = 5;
      
      const pulseOsc = ctx.createOscillator();
      const pulseGain = ctx.createGain();
      pulseOsc.type = "sawtooth"; // Richer harmonics
      pulseOsc.frequency.value = 55; // Sub bass
      pulseGain.gain.value = 0.01;
      
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 8; 
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 100;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      pulseOsc.connect(pulseGain);
      pulseGain.connect(gain);
      pulseOsc.start();
      
      source.connect(filter);
      filter.connect(gain);
    } else if (id === 'nebula') {
      const carrier1 = ctx.createOscillator();
      const carrier2 = ctx.createOscillator();
      const pan1 = ctx.createStereoPanner();
      const pan2 = ctx.createStereoPanner();
      
      carrier1.type = "sine";
      carrier1.frequency.value = 220;
      carrier2.type = "sine";
      carrier2.frequency.value = 222; // Slight detune for chorus effect
      
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.2;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1;
      lfo.connect(lfoGain);
      lfo.connect(pan1.pan); // Auto-pan
      
      carrier1.connect(pan1);
      carrier2.connect(pan2);
      pan1.connect(gain);
      pan2.connect(gain);
      
      carrier1.start();
      carrier2.start();
      lfo.start();

      source.buffer = createNoiseBuffer('pink');
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 600;
      source.connect(filter);
      filter.connect(gain);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
    } else if (id === 'zen') {
      const harmonic1 = ctx.createOscillator();
      const harmonic2 = ctx.createOscillator();
      harmonic1.type = "sine";
      harmonic1.frequency.value = 174; 
      harmonic2.type = "sine";
      harmonic2.frequency.value = 285; // Solfeggio tones
      
      const breath = ctx.createGain();
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.1; // Very slow breathing
      lfo.connect(breath.gain);
      lfo.start();
      
      harmonic1.connect(breath);
      harmonic2.connect(breath);
      breath.connect(gain);
      
      harmonic1.start();
      harmonic2.start();

      source.buffer = createNoiseBuffer('brown');
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 150;
      source.connect(filter);
      filter.connect(gain);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
    } else if (id === 'pulse') {
      const carrier = ctx.createOscillator();
      carrier.type = "triangle";
      carrier.frequency.value = 40; // Sub
      
      const mod = ctx.createGain();
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 1; // 60 BPM pulse
      lfo.connect(mod.gain);
      lfo.start();
      
      carrier.connect(mod);
      mod.connect(gain);
      carrier.start();
      
      source.buffer = createNoiseBuffer('white');
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2000;
      filter.Q.value = 10;
      source.connect(filter);
      filter.connect(gain);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
    } else if (id === 'void') {
      source.buffer = createNoiseBuffer('brown');
      const filter1 = ctx.createBiquadFilter();
      const filter2 = ctx.createBiquadFilter();
      filter1.type = "lowpass";
      filter1.frequency.value = 60;
      filter2.type = "notch";
      filter2.frequency.value = 120;
      
      source.connect(filter1);
      filter1.connect(filter2);
      filter2.connect(gain);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
    } else if (id === 'focus_deep') {
      source.buffer = createNoiseBuffer('brown');
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 350;
      
      const resonance = ctx.createBiquadFilter();
      resonance.type = "peaking";
      resonance.frequency.value = 1000;
      resonance.Q.value = 10;
      resonance.gain.value = 10;
      
      source.connect(filter);
      filter.connect(resonance);
      resonance.connect(gain);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
    } else if (id === 'calm_pure') {
      source.buffer = createNoiseBuffer('pink');
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 100;
      source.connect(filter);
      filter.connect(gain);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
    }

    source.loop = true;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 2);
    
    gain.connect(masterGain.current!);
    source.start();
    
    soundNodes.current[id] = { source, gain };
  };

  const stopSound = (id: string) => {
    const node = soundNodes.current[id];
    if (node && node.gain && node.source) {
      const ctx = audioContext.current!;
      node.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
      setTimeout(() => {
        if (node.source) {
            node.source.stop();
            delete soundNodes.current[id];
        }
      }, 2100);
    }
  };

  const toggleSound = (id: string, isPremium: boolean = false) => {
    if (isPremium && !unlockedSounds.has("PREMIUM_ALL")) {
      setShowPromo(true);
      return;
    }
    const newActive = new Set(activeSounds);
    if (newActive.has(id)) {
      newActive.delete(id);
      stopSound(id);
    } else {
      newActive.add(id);
      startSound(id);
    }
    setActiveSounds(newActive);
  };

  const updateBinaural = (mode: BinauralMode) => {
    initAudio();
    const ctx = audioContext.current!;
    
    // Stop old
    if (binauralNodes.current.left) {
        binauralNodes.current.left.stop();
        binauralNodes.current.right?.stop();
        binauralNodes.current.gain?.disconnect();
    }

    if (mode === "none") {
      setBinauralMode("none");
      return;
    }

    const baseFreq = 200;
    let diff = 0;
    if (mode === "alpha") diff = 10;
    if (mode === "beta") diff = 20;
    if (mode === "delta") diff = 2;

    const left = ctx.createOscillator();
    const right = ctx.createOscillator();
    const gain = ctx.createGain();
    const panL = ctx.createStereoPanner();
    const panR = ctx.createStereoPanner();

    left.frequency.value = baseFreq;
    right.frequency.value = baseFreq + diff;
    
    panL.pan.value = -1;
    panR.pan.value = 1;

    left.connect(panL);
    right.connect(panR);
    panL.connect(gain);
    panR.connect(gain);
    gain.connect(masterGain.current!);

    gain.gain.value = 0.03;
    left.start();
    right.start();

    binauralNodes.current = { left, right, gain };
    setBinauralMode(mode);
  };

  useEffect(() => {
    return () => {
      Object.keys(soundNodes.current).forEach(id => stopSound(id));
      if (binauralNodes.current.left) {
          binauralNodes.current.left.stop();
          binauralNodes.current.right?.stop();
      }
    };
  }, []);

  return (
    <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <h2 className="text-white/50 text-[10px] font-bold uppercase tracking-widest leading-none">Soundscape</h2>
            {activeSounds.size > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase tracking-tighter">Mix Active</span>
            )}
        </div>
        <button 
          onClick={onMuteToggle}
          className="p-1 text-white/40 hover:text-white transition-colors"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SoundButton 
          id="rain" 
          active={activeSounds.has("rain")} 
          onClick={() => toggleSound("rain")} 
          icon={<CloudRain size={16} />} 
          label="Midnight Rain" 
        />
        <SoundButton 
          id="space" 
          active={activeSounds.has("space")} 
          onClick={() => toggleSound("space")} 
          icon={<Moon size={16} />} 
          label="Deep Space" 
        />
        <SoundButton 
          id="forest" 
          active={activeSounds.has("forest")} 
          onClick={() => toggleSound("forest")} 
          icon={<TreePine size={16} />} 
          label="Night Forest" 
        />
        <SoundButton 
          id="coffee" 
          active={activeSounds.has("coffee")} 
          onClick={() => toggleSound("coffee")} 
          icon={<Coffee size={16} />} 
          label="Coffee Shop" 
        />
        <SoundButton 
          id="focus_deep" 
          active={activeSounds.has("focus_deep")} 
          onClick={() => toggleSound("focus_deep")} 
          icon={<Zap size={16} />} 
          label="Deep Focus" 
        />
        <SoundButton 
          id="calm_pure" 
          active={activeSounds.has("calm_pure")} 
          onClick={() => toggleSound("calm_pure")} 
          icon={<Heart size={16} />} 
          label="Deep Calm" 
        />
      </div>

      <div className="pt-6 border-t border-white/5">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-[9px] uppercase tracking-widest text-amber-500/40 font-bold">Deep Flow Mixes</h3>
            {!unlockedSounds.has("PREMIUM_ALL") && (
                <button 
                  onClick={() => setShowPromo(true)}
                  className="text-[8px] font-bold text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full hover:bg-amber-500/10 transition-all"
                >
                  Unlock All
                </button>
            )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SoundButton 
            id="cyber" 
            premium
            locked={!unlockedSounds.has("PREMIUM_ALL")}
            active={activeSounds.has("cyber")} 
            onClick={() => toggleSound("cyber", true)} 
            icon={<Zap size={16} />} 
            label="Cyber Drift" 
          />
          <SoundButton 
            id="nebula" 
            premium
            locked={!unlockedSounds.has("PREMIUM_ALL")}
            active={activeSounds.has("nebula")} 
            onClick={() => toggleSound("nebula", true)} 
            icon={<Sparkles size={16} />} 
            label="Nebula Stream" 
          />
          <SoundButton 
            id="zen" 
            premium
            locked={!unlockedSounds.has("PREMIUM_ALL")}
            active={activeSounds.has("zen")} 
            onClick={() => toggleSound("zen", true)} 
            icon={<Moon size={16} />} 
            label="Ethereal Zen" 
          />
          <SoundButton 
            id="pulse" 
            premium
            locked={!unlockedSounds.has("PREMIUM_ALL")}
            active={activeSounds.has("pulse")} 
            onClick={() => toggleSound("pulse", true)} 
            icon={<Heart size={16} />} 
            label="Focus Pulse" 
          />
          <SoundButton 
            id="void" 
            premium
            locked={!unlockedSounds.has("PREMIUM_ALL")}
            active={activeSounds.has("void")} 
            onClick={() => toggleSound("void", true)} 
            icon={<VolumeX size={16} />} 
            label="Digital Void" 
          />
        </div>
      </div>

      <AnimatePresence>
        {showPromo && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
            >
                {showAdminPanel ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-amber-500">
                            <span className="text-[10px] font-black uppercase tracking-widest">Admin Control Center</span>
                            <button onClick={() => setShowAdminPanel(false)} className="text-[8px] border border-amber-500/20 px-2 py-0.5 rounded">Exit</button>
                        </div>
                        <div className="flex space-x-2">
                           <input 
                              id="new-code-input"
                              type="text" 
                              placeholder="New Promo Code..."
                              className="flex-1 bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] uppercase outline-none"
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                    addAdminCode((e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = "";
                                 }
                              }}
                           />
                        </div>
                        <div className="max-h-24 overflow-y-auto flex flex-wrap gap-2 p-2 bg-black/20 rounded-xl">
                            {dynamicCodes.map(c => (
                                <span key={c} className="text-[8px] bg-amber-500/20 text-amber-500 px-2 py-1 rounded-md border border-amber-500/10 flex items-center space-x-2">
                                    <span>{c}</span>
                                    <button onClick={() => {
                                        const updated = dynamicCodes.filter(x => x !== c);
                                        setDynamicCodes(updated);
                                        localStorage.setItem("detox_dynamic_codes", JSON.stringify(updated));
                                    }} className="hover:text-white">×</button>
                                </span>
                            ))}
                            {dynamicCodes.length === 0 && <span className="text-[8px] text-white/20 uppercase">No dynamic codes active</span>}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-3 text-amber-500">
                            <div className="flex items-center space-x-2">
                                <Zap size={14} fill="currentColor" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Supporter Content</span>
                            </div>
                            <button onClick={() => setShowPromo(false)} className="opacity-40 hover:opacity-100 transition-opacity">
                            <VolumeX size={14} />
                            </button>
                        </div>
                        <p className="text-[9px] text-white/40 leading-relaxed mb-4">
                        To get a code, support the project in Settings! It helps us keep the app free and growing.
                        </p>
                        <div className="flex space-x-2">
                            <input 
                                type="text" 
                                placeholder="ENTER PROMO CODE..."
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value)}
                                className="flex-1 bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-mono uppercase focus:ring-1 focus:ring-amber-500 outline-none"
                            />
                            <button 
                                onClick={handleUnlock}
                                className="px-4 py-2 bg-amber-500 text-black rounded-xl font-black text-[9px] uppercase hover:bg-amber-400 transition-all"
                            >
                                Apply
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
         <h3 className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Binaural Waves</h3>
         <div className="flex flex-wrap gap-2">
            <WaveButton 
                active={binauralMode === "beta"} 
                onClick={() => updateBinaural(binauralMode === "beta" ? "none" : "beta")} 
                label="Deep Focus" 
                sub="Beta"
                color="emerald"
            />
            <WaveButton 
                active={binauralMode === "alpha"} 
                onClick={() => updateBinaural(binauralMode === "alpha" ? "none" : "alpha")} 
                label="Creative" 
                sub="Alpha"
                color="blue"
            />
            <WaveButton 
                active={binauralMode === "delta"} 
                onClick={() => updateBinaural(binauralMode === "delta" ? "none" : "delta")} 
                label="Sleep" 
                sub="Delta"
                color="indigo"
            />
         </div>
      </div>
    </div>
  );
}

function SoundButton({ id, active, onClick, icon, label, premium, locked }: any) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl border transition-all flex flex-col items-center space-y-2 group relative overflow-hidden ${
        active 
          ? "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
          : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:border-white/10 hover:text-white/60"
      } ${premium && locked ? "opacity-40 grayscale" : ""}`}
    >
      {premium && (
        <div className="absolute top-0 right-0 bg-amber-500 text-black text-[6px] font-black uppercase px-2 py-0.5 rounded-bl-lg tracking-tighter flex items-center space-x-1">
            {locked && <Lock size={6} />}
            <span>{locked ? "Locked" : "SUPPORTER"}</span>
        </div>
      )}
      <div className={`p-2 rounded-full transition-colors ${active ? "bg-white text-black" : "bg-white/5 group-hover:bg-white/10"}`}>
        {icon}
      </div>
      <span className="text-[10px] uppercase tracking-tight font-bold">{label}</span>
      {active && (
         <motion.div 
            layoutId="active-indicator"
            className="w-1 h-1 rounded-full bg-white mt-1" 
         />
      )}
    </button>
  );
}

function WaveButton({ active, onClick, label, sub, color }: any) {
    const colors = {
        emerald: active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-white/5 text-white/30 border-white/5",
        blue: active ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-white/5 text-white/30 border-white/5",
        indigo: active ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" : "bg-white/5 text-white/30 border-white/5",
    };
    
    return (
        <button
            onClick={onClick}
            className={`px-3 py-2 rounded-xl border text-[10px] uppercase transition-all flex items-center space-x-2 ${colors[color as keyof typeof colors]}`}
        >
            <div className="flex flex-col items-start leading-none gap-1">
                <span className={`font-bold ${active ? "" : "group-hover:text-white"}`}>{label}</span>
                <span className="opacity-40 text-[8px] tracking-tighter">{sub}</span>
            </div>
            {active && <Sparkles size={10} className="animate-pulse" />}
        </button>
    );
}
