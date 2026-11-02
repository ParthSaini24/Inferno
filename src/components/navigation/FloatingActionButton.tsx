import React, { useState } from 'react';
import { Plus, X, Mic, Sparkles, ReceiptText } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { VoiceExpenseModal } from '@/components/voice/VoiceExpenseModal';

export const FloatingActionButton: React.FC = () => {
  const { setIsAddTxOpen, setIsSmartPasteOpen, setPrefilledTxData } = useFinance();

  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const handleOpenManual = () => {
    setPrefilledTxData(null);
    setIsAddTxOpen(true);
    setIsOpen(false);
  };

  const handleOpenSms = () => {
    setIsSmartPasteOpen(true);
    setIsOpen(false);
  };

  const handleOpenVoice = () => {
    setIsVoiceOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Speed Dial Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200"
        />
      )}

      {/* Floating Speed Dial Container */}
      <div className="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 z-40 flex flex-col items-end gap-3 select-none">
        {/* Expanded Options */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-1 animate-in slide-in-from-bottom-5 duration-200">
            {/* Voice Log Button */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 shadow-md text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800">
                Voice Log (Hinglish)
              </span>
              <button
                onClick={handleOpenVoice}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-500 text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition"
                title="Voice Log Expense"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            {/* Smart SMS Paste Button */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 shadow-md text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800">
                Smart SMS Paste
              </span>
              <button
                onClick={handleOpenSms}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition"
                title="Parse Bank SMS"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>

            {/* Fast Manual Expense Button */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 shadow-md text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800">
                Fast Form Entry
              </span>
              <button
                onClick={handleOpenManual}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition"
                title="Quick Add Expense"
              >
                <ReceiptText className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Primary Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close Menu' : 'Add Expense'}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white shadow-xl shadow-teal-700/30 dark:shadow-teal-950/80 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-teal-500/30"
        >
          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.5] transition-transform duration-200 rotate-90" />
          ) : (
            <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Voice Expense Modal */}
      <VoiceExpenseModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />
    </>
  );
};
