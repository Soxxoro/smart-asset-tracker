import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';

const ToastContainer = ({ toasts, setToasts }) => {
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              layout
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border glass-panel transition-all ${
                isSuccess
                  ? 'border-green-500/30 bg-green-500/5 text-green-900 dark:text-green-300'
                  : isWarning
                  ? 'border-yellow-500/30 bg-yellow-500/5 text-yellow-900 dark:text-yellow-300'
                  : isError
                  ? 'border-red-500/30 bg-red-500/5 text-red-900 dark:text-red-300'
                  : 'border-blue-500/30 bg-blue-500/5 text-blue-900 dark:text-blue-300'
              }`}
            >
              {isSuccess && <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />}
              {isWarning && <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />}
              {isError && <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />}
              {!isSuccess && !isWarning && !isError && (
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              )}

              <div className="flex-1">
                <p className="text-sm font-medium leading-5">{toast.message}</p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 p-0.5 rounded-lg hover:bg-slate-200/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export { ToastContainer };
