import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Check, Trash2, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  text: string;
}

interface TaskSoloProps {
  activeTask: Task | null;
  onAddTask: (text: string) => void;
  onRemoveTask: () => void;
  isSessionActive: boolean;
}

export default function TaskSolo({ activeTask, onAddTask, onRemoveTask, isSessionActive }: TaskSoloProps) {
  const [inputValue, setInputValue] = useState("");
  const [warning, setWarning] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (activeTask) {
      setWarning("Finish what you started first!");
      setTimeout(() => setWarning(null), 3000);
      return;
    }

    onAddTask(inputValue.trim());
    setInputValue("");
  };

  const handleAttemptChange = () => {
    if (isSessionActive && activeTask) {
       setWarning("Focus is locked while timer is running.");
       setTimeout(() => setWarning(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-md p-6 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10 flex flex-col space-y-6 relative overflow-hidden group">
      <AnimatePresence>
        {warning && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute top-0 left-0 right-0 bg-red-500/90 text-white py-2 px-4 flex items-center justify-center space-x-2 z-50 text-xs font-bold uppercase tracking-widest"
          >
            <AlertCircle size={14} />
            <span>{warning}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <h2 className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Single Focus Target</h2>
        {activeTask && (
             <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-400 text-[8px] font-bold uppercase">Locked</span>
             </div>
        )}
      </div>

      <div className="min-h-[100px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {activeTask ? (
            <motion.div
              key={activeTask.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex items-center"
            >
              <div className="flex-1 overflow-hidden">
                <p className="text-3xl font-light text-white leading-tight tracking-tighter">
                  {activeTask.text}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Active Focus</span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isSessionActive) {
                    handleAttemptChange();
                  } else {
                    onRemoveTask();
                  }
                }}
                className={`p-3 rounded-2xl transition-all ${
                  isSessionActive 
                    ? "text-white/10 cursor-not-allowed" 
                    : "text-white/20 hover:text-red-400 hover:bg-red-500/10"
                }`}
              >
                <Trash2 size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group/prompt"
            >
              <p className="text-white/20 text-lg font-light tracking-wide italic group-hover/prompt:text-white/40 transition-colors">
                Waiting for your intent...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="relative mt-auto">
        <input
          type="text"
          value={inputValue}
          disabled={!!activeTask && isSessionActive}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={activeTask ? "Task locked during session" : "Define your one move..."}
          className={`w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-5 pr-14 text-white text-base focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all placeholder:text-white/10 ${
            activeTask && isSessionActive ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
        <button
          type="submit"
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            activeTask 
              ? "bg-red-500/10 text-white/20" 
              : "bg-white text-black hover:bg-emerald-50 active:scale-95"
          }`}
        >
          <Plus size={20} />
        </button>
      </form>
    </div>
  );
}
