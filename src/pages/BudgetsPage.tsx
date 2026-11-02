import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR, formatCompactINR } from '@/utils/formatters';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { AddEditBudgetModal } from '@/components/budgets/AddEditBudgetModal';
import { Budget } from '@/types';
import {
  PieChart,
  Plus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Edit2,
  Trash2,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const {
    budgets,
    categories,
    getCategoryById,
    getSpentForCategoryMonth,
    deleteBudget,
    transactions,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('2026-11');

  // Filter budgets for active month
  const activeMonthBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === selectedMonth);
  }, [budgets, selectedMonth]);

  // Aggregate totals
  const totalBudgeted = activeMonthBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpentInBudgets = activeMonthBudgets.reduce((sum, b) => {
    const spent = getSpentForCategoryMonth(b.category_id, selectedMonth);
    return sum + spent;
  }, 0);

  const overallPercent = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpentInBudgets / totalBudgeted) * 100)) : 0;

  const handleEdit = (b: Budget) => {
    setBudgetToEdit(b);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setBudgetToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Top Title & Month Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Category Budgets & Envelopes
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              Active
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Smart envelopes with rollover for Indian festivals, rent and daily groceries
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="2026-11">November 2026</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-12">December 2026</option>
            </select>
          </div>

          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Budget</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card (Phosdeep Liquid Glass & Aurora Bloom) */}
      <div className="phos-card p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-950 text-white shadow-2xl shadow-teal-950/40 border border-teal-500/20 relative overflow-hidden">
        <div className="phos-corner-tl" />
        <div className="phos-corner-tr" />
        <div className="phos-corner-bl" />
        <div className="phos-corner-br" />

        {/* Ambient Drifting Aurora Blobs */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-aurora-1" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-aurora-2" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs text-teal-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Monthly Budget Utilization ({selectedMonth})</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 hud-blink shadow-xs shadow-emerald-400 ml-1" />
            </span>
            <div className="text-3xl sm:text-5xl font-black rupee-num">
              {formatINR(totalSpentInBudgets)}
              <span className="text-xl font-normal text-teal-200/80"> / {formatINR(totalBudgeted)}</span>
            </div>
            <p className="text-xs text-teal-200/80 pt-1">
              {totalBudgeted - totalSpentInBudgets >= 0 ? (
                <>
                  <span className="text-emerald-300 font-bold">
                    {formatINR(totalBudgeted - totalSpentInBudgets)}
                  </span>{' '}
                  available across {activeMonthBudgets.length} active budget envelopes.
                </>
              ) : (
                <span className="text-rose-300 font-bold">
                  Over budget by {formatINR(totalSpentInBudgets - totalBudgeted)}
                </span>
              )}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
            <span className="text-3xl font-extrabold text-emerald-300 rupee-num">
              {overallPercent}%
            </span>
            <span className="text-xs text-teal-200">Envelope Cap Used</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 pt-4 border-t border-white/15">
          <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercent > 90 ? 'bg-rose-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Budget Envelopes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Active Budget Envelopes
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
              {activeMonthBudgets.length}
            </span>
          </h2>
          <span className="text-xs text-slate-400">
            Dynamically tracked against live expenses
          </span>
        </div>

        {activeMonthBudgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMonthBudgets.map((b) => {
              const cat = getCategoryById(b.category_id);
              const spent = getSpentForCategoryMonth(b.category_id, selectedMonth);
              const remaining = b.amount - spent;
              const isOver = spent > b.amount;
              const percent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;

              return (
                <div
                  key={b.id}
                  className={`phos-card p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm space-y-3.5 group relative ${
                    isOver
                      ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                      : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="phos-corner-tl" />
                  <div className="phos-corner-br" />
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon
                        name={cat?.icon || 'HelpCircle'}
                        backgroundColor={cat?.color || '#0d9488'}
                        color={cat?.color || '#0d9488'}
                        size={20}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {cat?.name || 'Category'}
                          </h3>
                          {b.rollover && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold flex items-center gap-1"
                              title="Unused balance rolls over to next month"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Rollover</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Limit: <span className="font-semibold">{formatINR(b.amount)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(b)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 transition"
                        title="Edit budget"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteBudget(b.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Delete budget"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold rupee-num text-slate-800 dark:text-slate-200">
                        {formatINR(spent)} spent
                      </span>
                      <span
                        className={`font-semibold ${
                          isOver ? 'text-rose-600 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {percent}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver
                            ? 'bg-rose-500'
                            : percent > 80
                            ? 'bg-amber-500'
                            : cat?.color || '#10b981'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Envelope Footer */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800/80 text-slate-400">
                    <span className="flex items-center gap-1">
                      {isOver ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          <span className="text-rose-500 font-bold">
                            Exceeded by {formatINR(spent - b.amount)}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Within budget</span>
                        </>
                      )}
                    </span>

                    {!isOver && (
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {formatINR(remaining)} left
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <PieChart className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No envelopes set for {selectedMonth}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create category envelopes to keep groceries, dining, and utility spends on track.
            </p>
            <button
              onClick={handleCreate}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow"
            >
              Set First Budget
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      <AddEditBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budgetToEdit={budgetToEdit}
      />
    </div>
  );
};
