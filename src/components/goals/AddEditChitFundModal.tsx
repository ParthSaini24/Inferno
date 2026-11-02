import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { X, Sparkles, Building, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface AddEditChitFundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEditChitFundModal: React.FC<AddEditChitFundModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addChitFund } = useFinance();

  const [name, setName] = useState('Shree Balaji 1-Lakh Chit Fund');
  const [monthlyContribStr, setMonthlyContribStr] = useState('5000');
  const [totalMonthsStr, setTotalMonthsStr] = useState('20');
  const [totalChitAmountStr, setTotalChitAmountStr] = useState('100000');
  const [currentMonthStr, setCurrentMonthStr] = useState('1');
  const [nextDueDate, setNextDueDate] = useState('2026-11-15');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyContrib = parseFloat(monthlyContribStr);
    const totalMonths = parseInt(totalMonthsStr);
    const totalChit = parseFloat(totalChitAmountStr);
    const currentMonth = parseInt(currentMonthStr) || 1;

    if (!name.trim()) {
      toast.error('Please enter the chit fund / kameti name');
      return;
    }
    if (isNaN(monthlyContrib) || monthlyContrib <= 0) {
      toast.error('Please enter valid monthly installment');
      return;
    }

    await addChitFund({
      name: name.trim(),
      monthly_contribution: monthlyContrib,
      total_months: totalMonths || 20,
      current_month: currentMonth,
      total_chit_amount: totalChit || monthlyContrib * totalMonths,
      dividend_earned: 0,
      taken_in_month: null,
      payout_received: null,
      status: 'active',
      next_due_date: nextDueDate,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
        {/* Header - Fixed */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Enroll Indian Chit Fund / Kameti
              </h2>
              <p className="text-xs text-slate-400">Monthly pool & auction dividend tracker</p>
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
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Chit Fund / Kameti Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shree Balaji 1-Lakh Chit Fund"
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Monthly Contribution (₹)
              </label>
              <input
                type="number"
                value={monthlyContribStr}
                onChange={(e) => setMonthlyContribStr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Chit Pool (₹)
              </label>
              <input
                type="number"
                value={totalChitAmountStr}
                onChange={(e) => setTotalChitAmountStr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Duration (Months)
              </label>
              <input
                type="number"
                value={totalMonthsStr}
                onChange={(e) => setTotalMonthsStr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Current Installment #
              </label>
              <input
                type="number"
                value={currentMonthStr}
                onChange={(e) => setCurrentMonthStr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Next Due Date
            </label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            />
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
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-sm font-bold shadow-md shadow-amber-600/20"
            >
              Enroll Chit Fund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
