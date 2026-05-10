import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sliders, MessageSquare, Rocket, Heart, Star, ExternalLink, ChevronDown, Download, Upload, ShieldCheck } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusMinutes: number;
  breakMinutes: number;
  sleepMinutes: number;
  onUpdateFocus: (val: number) => void;
  onUpdateBreak: (val: number) => void;
  onUpdateSleep: (val: number) => void;
  isInstallable?: boolean;
  onInstall?: () => void;
  notify: (type: any, message: string, onConfirm?: () => void) => void;
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  focusMinutes,
  breakMinutes,
  sleepMinutes,
  onUpdateFocus,
  onUpdateBreak,
  onUpdateSleep,
  isInstallable,
  onInstall,
  notify,
  isAdmin,
  setIsAdmin
}: SettingsModalProps) {
  const [dynamicCodes, setDynamicCodes] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const unlocked = localStorage.getItem("detox_unlocked");
      setIsPremium(unlocked ? JSON.parse(unlocked).includes("PREMIUM_ALL") : false);
      
      const saved = localStorage.getItem("detox_dynamic_codes");
      setDynamicCodes(saved ? JSON.parse(saved) : []);
    }
  }, [isOpen]);

  const exportData = () => {
    const data = {
      focus: localStorage.getItem("detox_focus"),
      break: localStorage.getItem("detox_break"),
      sleep: localStorage.getItem("detox_sleep"),
      hearts: localStorage.getItem("detox_hearts"),
      intro: localStorage.getItem("detox_intro_seen"),
      unlocked: localStorage.getItem("detox_unlocked"),
      used_codes: localStorage.getItem("detox_used_codes")
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `detox-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.focus) localStorage.setItem("detox_focus", data.focus);
        if (data.break) localStorage.setItem("detox_break", data.break);
        if (data.sleep) localStorage.setItem("detox_sleep", data.sleep);
        if (data.hearts) localStorage.setItem("detox_hearts", data.hearts);
        if (data.intro) localStorage.setItem("detox_intro_seen", data.intro);
        if (data.unlocked) localStorage.setItem("detox_unlocked", data.unlocked);
        if (data.used_codes) localStorage.setItem("detox_used_codes", data.used_codes);
        notify('success', "تم استعادة البيانات بنجاح! جاري التحديث...");
        setTimeout(() => window.location.reload(), 2000);
      } catch (err) {
        notify('error', "ملف النسخة الاحتياطية غير صالح.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#0d1512] border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-2xl z-[101] flex flex-col max-h-[85vh]"
          >
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-white/5 text-emerald-400">
                  <Sliders size={20} />
                </div>
                <h2 className="text-xl font-medium tracking-tight">Settings</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-10 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
              {/* Flexible Timers */}
              <div className="space-y-8">
                <section>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Focus Duration</label>
                    <div className="flex items-center space-x-2">
                       <input 
                          type="number"
                          value={focusMinutes}
                          onChange={(e) => onUpdateFocus(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 bg-white/5 border-none text-right font-mono italic text-xl p-0 focus:ring-0 text-emerald-400"
                       />
                       <span className="text-emerald-400/40 text-xs italic">m</span>
                    </div>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="120"
                    step="1"
                    value={focusMinutes}
                    onChange={(e) => onUpdateFocus(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500 transition-all"
                  />
                </section>

                <section>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Break Duration</label>
                    <div className="flex items-center space-x-2">
                       <input 
                          type="number"
                          value={breakMinutes}
                          onChange={(e) => onUpdateBreak(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 bg-white/5 border-none text-right font-mono italic text-xl p-0 focus:ring-0 text-blue-400"
                       />
                       <span className="text-blue-400/40 text-xs italic">m</span>
                    </div>
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={breakMinutes}
                    onChange={(e) => onUpdateBreak(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500 transition-all"
                  />
                </section>

                <section>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Sleep Session</label>
                    <div className="flex items-center space-x-2">
                       <input 
                          type="number"
                          value={sleepMinutes}
                          onChange={(e) => onUpdateSleep(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 bg-white/5 border-none text-right font-mono italic text-xl p-0 focus:ring-0 text-indigo-400"
                       />
                       <span className="text-indigo-400/40 text-xs italic">m</span>
                    </div>
                  </div>
                  <input 
                    type="range"
                    min="5"
                    max="240"
                    step="5"
                    value={sleepMinutes}
                    onChange={(e) => onUpdateSleep(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500 transition-all"
                  />
                </section>
              </div>

               {/* Support Section (Arabic) */}
              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="bg-white/5 rounded-3xl p-6 space-y-4 text-right" dir="rtl">
                   <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center space-x-reverse space-x-2">
                          <Rocket size={18} className="text-amber-400" />
                          <h3 className="text-lg font-bold tracking-tight text-white">ادعمنا وافتح المميزات الحصرية 💎</h3>
                       </div>
                       {isPremium && (
                           <div className="flex items-center space-x-reverse space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase">
                               <ShieldCheck size={10} />
                               <span>أنت داعم (Supporter)</span>
                           </div>
                       )}
                   </div>
                   <p className="text-xs leading-relaxed text-white/60 font-medium">
                      لو Detox ساعدك تستعيد تركيزك، فدعمك هو الوقود اللي بيخلينا نستمر. بمبلغ بسيط تقدر تفتح "Deep Flow Mixes" وأصوات مخصصة لحالات التركيز العالي، بالإضافة لدعم تطوير البرنامج.
                   </p>
                   
                   {!isAdmin && (
                      <div className="flex items-center justify-end space-x-reverse space-x-2">
                         <input 
                           type="password" 
                           placeholder="كود سري..."
                           className="bg-black/20 border border-white/5 rounded-lg px-2 py-1 text-[8px] text-white/40 focus:text-white/80 outline-none w-20 text-right"
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                               const val = (e.target as HTMLInputElement).value.toUpperCase();
                               // Obfuscated check: ADMIN_ACCESS_2026
                               if (val === atob("QURNSU5fQUNDRVNTXzIwMjY=")) {
                                 localStorage.setItem("detox_admin_mode", "true");
                                 setIsAdmin(true);
                                 notify('success', "Admin Mode Enabled!");
                               } else {
                                 notify('error', "كود غير صحيح.");
                               }
                               (e.target as HTMLInputElement).value = "";
                             }
                           }}
                         />
                         <span className="text-[8px] text-white/10 uppercase font-bold">Admin Only</span>
                      </div>
                   )}

                   <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
                      <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mb-1">فودافون كاش (التحويل مباشر):</p>
                      <p className="text-lg font-mono font-black text-white tracking-widest">01282920387</p>
                   </div>
                   <a 
                      href="https://wa.me/201282920387" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center space-x-reverse space-x-2 w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                   >
                      <MessageSquare size={18} />
                      <span>ابعت السكرين شوت واستلم كود التفعيل</span>
                   </a>
                   <p className="text-[8px] text-white/20 text-center uppercase tracking-widest leading-loose">
                      كل كود تفعيل مخصص لجهاز واحد وبيفتح كل المميزات الحالية والمستقبلية للأبد.
                   </p>
                </div>
              </div>

              {/* Admin Panel */}
              {isAdmin && (
                <div className="pt-6 border-t border-amber-500/20 space-y-4" dir="rtl">
                   <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/60 block text-right">Admin Control Center</label>
                      <button 
                        onClick={() => {
                          localStorage.removeItem("detox_admin_mode");
                          setIsAdmin(false);
                        }}
                        className="text-[8px] text-white/20 hover:text-red-400 transition-colors uppercase font-bold"
                      >
                        Exit Admin
                      </button>
                   </div>
                   <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 space-y-4">
                      <div className="flex space-x-reverse space-x-2">
                         <input 
                            id="admin-new-code"
                            type="text" 
                            placeholder="كود جديد..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const code = (e.target as HTMLInputElement).value.toUpperCase().trim();
                                if (!code) return;
                                const updated = [...dynamicCodes, code];
                                setDynamicCodes(updated);
                                localStorage.setItem("detox_dynamic_codes", JSON.stringify(updated));
                                (e.target as HTMLInputElement).value = "";
                                notify('success', "تم إضافة كود جديد بنجاح!");
                              }
                            }}
                            className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs uppercase outline-none focus:ring-1 focus:ring-amber-500"
                         />
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {dynamicCodes.map(c => (
                            <span key={c} className="text-[9px] bg-white/5 border border-white/5 px-2 py-1 rounded-lg font-mono text-white/60 flex items-center gap-2">
                               {c}
                               <button onClick={() => {
                                  notify('confirm', `هل أنت متأكد من حذف الكود ${c}؟`, () => {
                                      const updated = dynamicCodes.filter(x => x !== c);
                                      setDynamicCodes(updated);
                                      localStorage.setItem("detox_dynamic_codes", JSON.stringify(updated));
                                      notify('success', "تم حذف الكود.");
                                  });
                               }} className="text-red-400 p-1 hover:bg-black/20 rounded">×</button>
                            </span>
                         ))}
                         {dynamicCodes.length === 0 && <p className="text-[8px] text-white/20 uppercase tracking-widest leading-none">لا يوجد أكواد نشطة</p>}
                      </div>
                   </div>
                </div>
              )}

              {/* Install App Section - More prominent */}
              <div className="pt-6 border-t border-white/5 space-y-4">
                 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Application</label>
                 <button 
                    onClick={() => {
                      if (onInstall && isInstallable) {
                        onInstall();
                      } else {
                        notify('info', "لتحميل التطبيق كـ PWA: افتح التطبيق في نافذة منفصلة (New Tab) ثم اضغط على 'Install' من المتصفح.");
                      }
                    }}
                    className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all group ${
                      isInstallable 
                        ? "bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20" 
                        : "bg-white/5 border border-white/5 opacity-80"
                    }`}
                 >
                    <div className="flex items-center space-x-4">
                       <div className={`p-3 rounded-2xl text-white shadow-lg ${isInstallable ? "bg-emerald-500 shadow-emerald-500/20" : "bg-white/10"}`}>
                          <Download size={20} />
                       </div>
                       <div className="text-left">
                          <p className="text-sm font-bold text-white leading-tight">
                            {isInstallable ? "Install Detox" : "طريقة تثبيت التطبيق"}
                          </p>
                          <p className={`text-[10px] uppercase tracking-widest mt-1 ${isInstallable ? "text-emerald-400" : "text-white/40"}`}>
                            Get the full experience
                          </p>
                       </div>
                    </div>
                    {isInstallable && <ChevronDown size={16} className="text-emerald-400 animate-bounce" />}
                 </button>
              </div>

              {/* Data Management Section */}
              <div className="pt-6 border-t border-white/5 space-y-4">
                 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Data Management</label>
                 <div className="flex flex-col space-y-3">
                    <button 
                      onClick={exportData}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                         <Download size={16} className="text-white/40 group-hover:text-white transition-colors" />
                         <span className="text-xs font-bold">Export Backup JSON</span>
                      </div>
                      {isPremium && (
                          <div className="flex items-center space-x-1 text-[8px] text-emerald-400 uppercase font-black">
                            <ShieldCheck size={10} />
                            <span>Supporter Safe</span>
                          </div>
                      )}
                    </button>
                    
                    <label className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group cursor-pointer">
                      <div className="flex items-center space-x-3">
                         <Upload size={16} className="text-white/40 group-hover:text-white transition-colors" />
                         <span className="text-xs font-bold">Import Backup JSON</span>
                      </div>
                      <input type="file" accept=".json" onChange={importData} className="hidden" />
                    </label>

                    <p className="text-[8px] text-white/20 uppercase tracking-widest leading-relaxed px-2" dir="rtl">
                       * نسخة الـ JSON بتحفظ كل إعداداتك، عدد القلوب، وحالة الـ Supporter بتاعتك عشان لو مسحت الكاش أو غيرت المتصفح.
                    </p>
                 </div>
              </div>

              {/* Rate Us */}
              <a 
                href="https://forms.gle/FC8RuWBEkR7m5tzt9" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-amber-400/10 text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-all">
                        <Star size={20} fill="currentColor" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-white leading-tight">قيم تجربتك</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">ساعدنا نتحسن</p>
                    </div>
                </div>
                <ExternalLink size={16} className="text-white/20 group-hover:text-white transition-colors" />
              </a>
            </div>

            <button 
              onClick={onClose}
              className="w-full mt-6 py-4 rounded-2xl bg-white text-black font-black tracking-tighter uppercase text-sm hover:bg-emerald-50 transition-all active:scale-95 shrink-0"
            >
              Done
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

