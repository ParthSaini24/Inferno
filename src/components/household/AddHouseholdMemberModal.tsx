import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { X, UserPlus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AddHouseholdMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddHouseholdMemberModal: React.FC<AddHouseholdMemberModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addHouseholdMember } = useFinance();
  const [name, setName] = useState('');
  const [sharePercent, setSharePercent] = useState(50);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter the member name');
      return;
    }
    await addHouseholdMember(name.trim(), sharePercent);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Household Member
              </h2>
              <p className="text-xs text-slate-400">Share rent, groceries & bills</p>
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
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Member Name
            </label>
            <input
              type="text"
              placeholder="e.g. Priya Saini or Roommate Rahul"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold uppercase tracking-wider text-slate-500">
                Fair Share Percentage
              </label>
              <span className="font-bold text-teal-600 dark:text-teal-400">{sharePercent}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={sharePercent}
              onChange={(e) => setSharePercent(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Equal split (50%)</span>
              <span>Proportional</span>
            </div>
          </div>

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
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
