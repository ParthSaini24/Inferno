import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/utils/formatters';
import { X, ArrowRight, ArrowLeftRight, Landmark, CreditCard, Banknote, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface TransferAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFromId?: string;
  defaultToId?: string;
}

export const TransferAccountModal: React.FC<TransferAccountModalProps> = ({
  isOpen,
  onClose,
  defaultFromId,
  defaultToId,
}) => {
  const { accounts, transferBetweenAccounts } = useFinance();

  const [fromId, setFromId] = useState(
    defaultFromId || accounts.find((a) => a.type === 'bank')?.id || accounts[0]?.id || ''
  );
  const [toId, setToId] = useState(
    defaultToId ||
      accounts.find((a) => a.id !== fromId && (a.type === 'cash' || a.type === 'credit_card'))?.id ||
      accounts[1]?.id ||
      ''
  );
  const [amountStr, setAmountStr] = useState('5000');
  const [note, setNote] = useState('Inter-account liquidity transfer');

  if (!isOpen) return null;

  const fromAcc = accounts.find((a) => a.id === fromId);
  const toAcc = accounts.find((a) => a.id === toId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid transfer amount');
      return;
    }
    if (fromId === toId) {
      toast.error('Source and destination accounts must be different');
      return;
    }

    await transferBetweenAccounts(fromId, toId, amount, note);
    onClose();
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return CreditCard;
      case 'cash':
        return Banknote;
      case 'wallet':
        return Wallet;
      case 'bank':
      default:
        return Landmark;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
        {/* Header - Fixed */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Inter-Account Transfer
              </h2>
              <p className="text-xs text-slate-400">ATM withdrawal, CC bill pay, or wallet load</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {/* Quick presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 font-bold uppercase text-[10px] mr-1">Quick:</span>
            {[
              { label: 'ATM ₹5k', amt: '5000', note: 'ATM Cash Withdrawal' },
              { label: 'ATM ₹10k', amt: '10000', note: 'ATM Cash Withdrawal' },
              { label: 'Pay CC ₹14.2k', amt: '14200', note: 'Amazon Pay ICICI CC Bill Payment' },
              { label: 'Load Paytm ₹2k', amt: '2000', note: 'Fastag & Wallet Topup' },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setAmountStr(p.amt);
                  setNote(p.note);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap transition"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* From -> To Grid */}
          <div className="grid grid-cols-2 gap-3 items-center relative">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                From (Source)
              </label>
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatINR(a.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                To (Destination)
              </label>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({formatINR(a.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Transfer Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 rupee-num"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Transfer Note
            </label>
            <input
              type="text"
              placeholder="e.g. ATM withdrawal or Card Bill"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Summary Preview */}
          {fromAcc && toAcc && fromAcc.id !== toAcc.id && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Transfer Summary
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                Debit <strong className="text-slate-900 dark:text-white">{fromAcc.name}</strong>{' '}
                and credit{' '}
                <strong className="text-slate-900 dark:text-white">{toAcc.name}</strong> without
                counting as double spending.
              </p>
            </div>
          )}

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
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              Transfer Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
