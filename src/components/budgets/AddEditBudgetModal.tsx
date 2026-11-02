import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Budget } from '@/types';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { X, Check, PieChart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AddEditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
}

const QUICK_BUDGETS = [3000, 5000, 8000, 12000, 20000];

export const AddEditBudgetModal: React.FC<AddEditBudgetModalProps> = ({
  isOpen,
  onClose,
  budgetToEdit,
}) => {
  const { categories, addBudget, updateBudget } = useFinance();

  const [categoryId, setCategoryId] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [month, setMonth] = useState('2026-11');
  const [rollover, setRollover] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (isOpen) {
      if (budgetToEdit) {
        setCategoryId(budgetToEdit.category_id);
        setAmountStr(String(budgetToEdit.amount));
        setMonth(budgetToEdit.month);
        setRollover(budgetToEdit.rollover);
      } else {
        setCategoryId(expenseCategories[0]?.id || '');
        setAmountStr('8000');
        setMonth('2026-11');
        setRollover(false);
      }
    }
  }, [isOpen, budgetToEdit, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid monthly budget amount');
      return;
    }

    if (budgetToEdit) {
      await updateBudget(budgetToEdit.id, {
        category_id: categoryId,
        amount,
        month,
        rollover,
      });
    } else {
      await addBudget({
        category_id: categoryId,
        amount,
        month,
        rollover,
      });
    }
    onClose();
  };

  const selectedCat = categories.find((c) => c.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {budgetToEdit ? 'Edit Budget Envelope' : 'Create Category Budget'}
              </h2>
              <p className="text-xs text-slate-400">Monthly expense limit & rollover</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-2xl">
              {expenseCategories.map((c) => {
                const isSelected = categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategoryId(c.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CategoryIcon name={c.icon} className="w-3.5 h-3.5" color={isSelected ? '#fff' : c.color} />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monthly Budget (₹)
            </label>
            <div className="flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-2xl font-black text-slate-400 mr-2">₹</span>
              <input
                type="number"
                placeholder="8000"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full text-2xl font-black bg-transparent text-slate-900 dark:text-white focus:outline-none rupee-num"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {QUICK_BUDGETS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmountStr(String(amt))}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 border border-slate-200 dark:border-slate-700"
                >
                  ₹{(amt / 1000)}k
                </button>
              ))}
            </div>
          </div>

          {/* Rollover checkbox */}
          <div className="pt-1">
            <label
              onClick={() => setRollover(!rollover)}
              className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer select-none transition ${
                rollover
                  ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                  rollover ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {rollover && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="text-xs">
                <span className="font-bold flex items-center gap-1 text-slate-900 dark:text-white">
                  <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                  Enable Unused Balance Rollover
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Any leftover balance at the end of the month rolls over to boost next month&apos;s envelope (ideal for Festivals & Groceries).
                </p>
              </div>
            </label>
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
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-bold shadow-md shadow-teal-600/20"
            >
              {budgetToEdit ? 'Save Budget' : 'Create Envelope'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
