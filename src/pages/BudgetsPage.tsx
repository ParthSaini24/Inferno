import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/utils/formatters';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { INITIAL_BUDGETS } from '@/lib/mockData';
import { PieChart, Sparkles, Plus, AlertCircle, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { categories, getCategoryById } = useFinance();

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Category Budgets & Envelopes
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              Phase 2 Preview
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Set monthly spending limits for Indian households with rollover support
          </p>
        </div>

        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600/50 text-white text-xs font-bold cursor-not-allowed opacity-80"
        >
          <Plus className="w-4 h-4" />
          <span>New Budget (Coming Soon)</span>
        </button>
      </div>

      {/* Feature Highlight Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900/60 to-emerald-900/40 border border-teal-500/30 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Smart Indian Budgeting Concept</span>
            </div>
            <h2 className="text-lg font-black">
              Festival & Season Rollover Budgets
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Automatic envelope savings for high-spend Indian calendar events like Diwali, Weddings,
              School Admissions, and Annual Insurance premiums.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[160px]">
            <span className="text-xs text-teal-200">Total Budgeted</span>
            <p className="text-xl font-black rupee-num">₹44,500 / mo</p>
          </div>
        </div>
      </div>

      {/* Interactive Mock Envelopes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INITIAL_BUDGETS.map((b) => {
          const cat = getCategoryById(b.category_id);
          const mockSpent = Math.round(b.amount * 0.65);
          const percent = Math.round((mockSpent / b.amount) * 100);

          return (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CategoryIcon
                    name={cat?.icon || 'HelpCircle'}
                    backgroundColor={cat?.color || '#0d9488'}
                    color={cat?.color || '#0d9488'}
                    size={18}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cat?.name || 'Category'}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {b.rollover ? '• Rollover enabled' : '• Resets monthly'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black rupee-num text-slate-900 dark:text-white">
                    {formatINR(mockSpent)}
                  </p>
                  <p className="text-[11px] text-slate-400">of {formatINR(b.amount)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: percent > 90 ? '#ef4444' : cat?.color || '#0d9488',
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{percent}% spent</span>
                <span>{formatINR(b.amount - mockSpent)} remaining</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
