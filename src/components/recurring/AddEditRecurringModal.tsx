import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { RecurringItem, PaymentMode } from '@/types';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { X, Repeat, Check, Users, Smartphone, Banknote, CreditCard, Landmark } from 'lucide-react';
import { toast } from 'sonner';

interface AddEditRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: RecurringItem | null;
}

export const AddEditRecurringModal: React.FC<AddEditRecurringModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { categories, addRecurringItem, updateRecurringItem } = useFinance();

  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [type, setType] = useState<RecurringItem['type']>('emi');
  const [frequency, setFrequency] = useState<RecurringItem['frequency']>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [remindDaysBefore, setRemindDaysBefore] = useState(3);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('netbanking');
  const [categoryId, setCategoryId] = useState('');
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setName(itemToEdit.name);
        setAmountStr(String(itemToEdit.amount));
        setType(itemToEdit.type);
        setFrequency(itemToEdit.frequency);
        setNextDueDate(itemToEdit.next_due_date);
        setRemindDaysBefore(itemToEdit.remind_days_before);
        setPaymentMode(itemToEdit.payment_mode || 'netbanking');
        setCategoryId(itemToEdit.category_id || categories[0]?.id || '');
        setIsShared(Boolean(itemToEdit.household_id));
      } else {
        setName('');
        setAmountStr('');
        setType('emi');
        setFrequency('monthly');
        const d = new Date();
        d.setDate(d.getDate() + 7);
        setNextDueDate(d.toISOString().split('T')[0]);
        setRemindDaysBefore(3);
        setPaymentMode('netbanking');
        setCategoryId(categories.find((c) => c.name.includes('EMI'))?.id || categories[0]?.id || '');
        setIsShared(false);
      }
    }
  }, [isOpen, itemToEdit, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!name.trim()) {
      toast.error('Please enter a name for this recurring bill or EMI');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (itemToEdit) {
      await updateRecurringItem(itemToEdit.id, {
        name: name.trim(),
        amount,
        type,
        frequency,
        next_due_date: nextDueDate,
        remind_days_before: remindDaysBefore,
        payment_mode: paymentMode,
        category_id: categoryId,
        household_id: isShared ? 'hh-01' : null,
      });
    } else {
      await addRecurringItem({
        name: name.trim(),
        amount,
        type,
        frequency,
        next_due_date: nextDueDate,
        remind_days_before: remindDaysBefore,
        active: true,
        payment_mode: paymentMode,
        category_id: categoryId,
        household_id: isShared ? 'hh-01' : null,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {itemToEdit ? 'Edit Recurring Bill' : 'Schedule Recurring Bill / EMI'}
              </h2>
              <p className="text-xs text-slate-400">Rent, SIP, EMI & utility reminders</p>
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
          {/* Bill Type Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Item Type
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'emi', label: 'EMI / Loan' },
                { id: 'sip', label: 'Mutual Fund SIP' },
                { id: 'rent', label: 'House Rent' },
                { id: 'subscription', label: 'Subscription' },
                { id: 'insurance', label: 'Insurance' },
                { id: 'other', label: 'Other Bill' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition ${
                    type === t.id
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Name / Description
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HDFC Home Loan or Tata Power Electricity"
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Amount (₹)
            </label>
            <div className="flex items-center px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xl font-bold text-slate-400 mr-2">₹</span>
              <input
                type="number"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="24000"
                className="w-full text-xl font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none rupee-num"
              />
            </div>
          </div>

          {/* Due date & Reminder */}
          <div className="grid grid-cols-2 gap-3">
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

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Remind (Days Before)
              </label>
              <select
                value={remindDaysBefore}
                onChange={(e) => setRemindDaysBefore(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value={1}>1 Day before</option>
                <option value={2}>2 Days before</option>
                <option value={3}>3 Days before</option>
                <option value={5}>5 Days before</option>
                <option value={7}>1 Week before</option>
              </select>
            </div>
          </div>

          {/* Shared with household toggle */}
          <div className="pt-1">
            <label
              onClick={() => setIsShared(!isShared)}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer select-none transition ${
                isShared
                  ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                  isShared ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                }`}
              >
                {isShared && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Shared Household Expense (e.g. Rent / Electricity)</span>
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
              className="flex-1 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/20"
            >
              {itemToEdit ? 'Save Changes' : 'Schedule Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
