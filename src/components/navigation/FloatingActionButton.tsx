import React from 'react';
import { Plus } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';

export const FloatingActionButton: React.FC = () => {
  const { setIsAddTxOpen, setPrefilledTxData } = useFinance();

  const handleOpen = () => {
    setPrefilledTxData(null);
    setIsAddTxOpen(true);
  };

  return (
    <button
      onClick={handleOpen}
      aria-label="Add Transaction"
      className="fixed bottom-20 right-5 sm:bottom-8 sm:right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white shadow-xl shadow-teal-700/30 dark:shadow-teal-950/80 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-teal-500/30"
    >
      <Plus className="w-7 h-7 stroke-[2.5] transition-transform duration-300 group-hover:rotate-90" />
      <span className="sr-only">Quick Add Expense</span>
    </button>
  );
};
