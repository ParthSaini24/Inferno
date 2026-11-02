import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Goal } from '@/types';
import { X, Target, Sparkles, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface AddEditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: Goal | null;
}

const GOAL_PRESETS = [
  { name: 'Diwali Gold & Gifts Fund', category: 'festival', amount: 50000 },
  { name: 'Emergency Household Reserve (6 Mos)', category: 'emergency', amount: 300000 },
  { name: 'Ladakh Family Road Trip', category: 'travel', amount: 80000 },
  { name: 'New Electric Scooter (Ather/Ola)', category: 'gadget', amount: 140000 },
  { name: 'Child Education / Annual Fees', category: 'education', amount: 120000 },
];

export const AddEditGoalModal: React.FC<AddEditGoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
}) => {
  const { addGoal, updateGoal } = useFinance();

  const [name, setName] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [savedAmountStr, setSavedAmountStr] = useState('0');
  const [targetDate, setTargetDate] = useState('2027-03-31');
  const [category, setCategory] = useState<any>('general');

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setName(goalToEdit.name);
        setTargetAmountStr(String(goalToEdit.target_amount));
        setSavedAmountStr(String(goalToEdit.saved_amount));
        setTargetDate(goalToEdit.target_date || '2027-03-31');
        setCategory(goalToEdit.category || 'general');
      } else {
        setName('Diwali Gold & Gifts Fund');
        setTargetAmountStr('50000');
        setSavedAmountStr('10000');
        setTargetDate('2026-11-12');
        setCategory('festival');
      }
    }
  }, [isOpen, goalToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(targetAmountStr);
    const savedAmount = parseFloat(savedAmountStr) || 0;

    if (!name.trim()) {
      toast.error('Please enter a goal name');
      return;
    }
    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    if (goalToEdit) {
      await updateGoal(goalToEdit.id, {
        name: name.trim(),
        target_amount: targetAmount,
        saved_amount: savedAmount,
        target_date: targetDate,
        category,
      });
    } else {
      await addGoal({
        name: name.trim(),
        target_amount: targetAmount,
        saved_amount: savedAmount,
        target_date: targetDate,
        category,
      });
    }
    onClose();
  };

  const applyPreset = (preset: typeof GOAL_PRESETS[0]) => {
    setName(preset.name);
    setTargetAmountStr(String(preset.amount));
    setCategory(preset.category);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {goalToEdit ? 'Edit Savings Goal' : 'New Savings Goal'}
              </h2>
              <p className="text-xs text-slate-400">Target saving milestone</p>
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
          {/* Quick presets */}
          {!goalToEdit && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Popular Indian Goals:
              </span>
              <div className="flex flex-wrap gap-1">
                {GOAL_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="px-2 py-0.5 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 border border-slate-200 dark:border-slate-700"
                  >
                    {p.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Goal Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Goal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diwali Gold & Gifts Fund"
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Target Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Target Amount (₹)
            </label>
            <div className="flex items-center px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xl font-bold text-slate-400 mr-2">₹</span>
              <input
                type="number"
                value={targetAmountStr}
                onChange={(e) => setTargetAmountStr(e.target.value)}
                placeholder="50000"
                className="w-full text-xl font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none rupee-num"
              />
            </div>
          </div>

          {/* Current Saved Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Already Saved (₹)
              </label>
              <input
                type="number"
                value={savedAmountStr}
                onChange={(e) => setSavedAmountStr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
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
              {goalToEdit ? 'Save Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
