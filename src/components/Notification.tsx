import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, HelpCircle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'confirm';

interface NotificationProps {
  show: boolean;
  type: NotificationType;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function Notification({ 
  show, 
  type, 
  message, 
  onClose, 
  onConfirm,
  confirmText = "نعم",
  cancelText = "إلغاء"
}: NotificationProps) {
  useEffect(() => {
    if (show && type !== 'confirm') {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, type, onClose]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-400" />,
    error: <AlertCircle className="text-red-400" />,
    info: <Info className="text-blue-400" />,
    confirm: <HelpCircle className="text-amber-400" />
  };

  const colors = {
    success: "border-emerald-500/20 bg-emerald-500/10",
    error: "border-red-500/20 bg-red-500/10",
    info: "border-blue-500/20 bg-blue-500/10",
    confirm: "border-amber-500/20 bg-amber-500/10"
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pointer-events-none">
          {type === 'confirm' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
              onClick={onClose}
            />
          )}
          
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className={`
              pointer-events-auto
              w-full max-w-sm overflow-hidden rounded-3xl border shadow-2xl backdrop-blur-md
              ${colors[type]}
            `}
            dir="rtl"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-white/5">
                  {icons[type]}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium text-white leading-relaxed">
                    {message}
                  </p>
                </div>
                {type !== 'confirm' && (
                  <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                )}
              </div>

              {type === 'confirm' && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                        onConfirm?.();
                        onClose();
                    }}
                    className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase rounded-2xl transition-all"
                  >
                    {confirmText}
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase rounded-2xl border border-white/10 transition-all"
                  >
                    {cancelText}
                  </button>
                </div>
              )}
            </div>
            
            {type !== 'confirm' && (
              <motion.div 
                className="h-1 bg-current opacity-20 origin-right"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4, ease: "linear" }}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
