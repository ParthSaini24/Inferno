import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Goal } from '@/types';
import { formatINR } from '@/utils/formatters';
import { X, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface ContributeGoalModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_CONTRIBUTIONS = [1000, 2000, 5000, 10000];

export const ContributeGoalModal: React.FC<ContributeGoalModalProps> = ({
  goal,
  isOpen,
  onClose,
}) => {
  const { contributeToGoal } = useFinance();
  const [amountStr, setAmountStr] = useState('2000');

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    await contributeToGoal(goal.id, amount);
    onClose();
  };

  const currentPercent = Math.round((goal.saved_amount / goal.target_amount) * 100);
  const newPercent = Math.min(
    100,
    Math.round(((goal.saved_amount + (parseFloat(amountStr) || 0)) / goal.target_amount) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
        {/* Header - Fixed */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Savings to Goal
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-[200px]">{goal.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {/* Goal progress card */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-emerald-800 dark:text-emerald-200">Current Progress</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                {currentPercent}% → {newPercent}%
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white rupee-num">
              {formatINR(goal.saved_amount)} / {formatINR(goal.target_amount)}
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Contribution Amount (₹)
            </label>
            <div className="flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-2xl font-black text-slate-400 mr-2">₹</span>
              <input
                type="number"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full text-2xl font-black bg-transparent text-slate-900 dark:text-white focus:outline-none rupee-num"
              />
            </div>

            {/* Quick chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {QUICK_CONTRIBUTIONS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmountStr(String(amt))}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 border border-slate-200 dark:border-slate-700"
                >
                  +{formatINR(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20"
            >
              Save Contribution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
