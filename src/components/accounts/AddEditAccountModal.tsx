import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Account, AccountType } from '@/types';
import { X, Landmark, CreditCard, Wallet, Banknote, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface AddEditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAccount?: Account | null;
}

const INDIAN_BANKS = [
  'HDFC Bank',
  'State Bank of India',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'IndusInd Bank',
  'Paytm Payments Bank',
  'Other',
];

export const AddEditAccountModal: React.FC<AddEditAccountModalProps> = ({
  isOpen,
  onClose,
  editAccount,
}) => {
  const { addAccount, updateAccount } = useFinance();

  const [name, setName] = useState(editAccount?.name || '');
  const [type, setType] = useState<AccountType>(editAccount?.type || 'bank');
  const [bankName, setBankName] = useState(editAccount?.bank_name || 'HDFC Bank');
  const [last4, setLast4] = useState(editAccount?.account_number_last4 || '');
  const [balance, setBalance] = useState(editAccount ? String(editAccount.balance) : '');
  const [creditLimit, setCreditLimit] = useState(
    editAccount?.credit_limit ? String(editAccount.credit_limit) : ''
  );
  const [billingDate, setBillingDate] = useState(
    editAccount?.billing_cycle_date ? String(editAccount.billing_cycle_date) : '15'
  );
  const [dueDate, setDueDate] = useState(
    editAccount?.payment_due_date ? String(editAccount.payment_due_date) : '5'
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter account name');
      return;
    }

    const balNum = parseFloat(balance) || 0;
    const limitNum = parseFloat(creditLimit) || 0;

    if (editAccount) {
      await updateAccount(editAccount.id, {
        name: name.trim(),
        type,
        bank_name: type === 'cash' ? undefined : bankName,
        account_number_last4: last4.trim() || undefined,
        balance: balNum,
        credit_limit: type === 'credit_card' ? limitNum : undefined,
        billing_cycle_date: type === 'credit_card' ? parseInt(billingDate) || 15 : undefined,
        payment_due_date: type === 'credit_card' ? parseInt(dueDate) || 5 : undefined,
      });
    } else {
      await addAccount({
        user_id: 'usr-pilot-01',
        name: name.trim(),
        type,
        bank_name: type === 'cash' ? undefined : bankName,
        account_number_last4: last4.trim() || undefined,
        balance: balNum,
        credit_limit: type === 'credit_card' ? limitNum : undefined,
        billing_cycle_date: type === 'credit_card' ? parseInt(billingDate) || 15 : undefined,
        payment_due_date: type === 'credit_card' ? parseInt(dueDate) || 5 : undefined,
        color:
          type === 'credit_card'
            ? '#b8860b'
            : type === 'bank'
            ? '#004c8f'
            : type === 'wallet'
            ? '#00b9f1'
            : '#059669',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
        {/* Header - Fixed */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editAccount ? 'Edit Account / Card' : 'Add Account or Card'}
              </h2>
              <p className="text-xs text-slate-400">Track liquid balances and credit cards</p>
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
          {/* Account Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Account Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'bank', label: 'Bank A/c', icon: Landmark },
                { id: 'credit_card', label: 'Card', icon: CreditCard },
                { id: 'wallet', label: 'Wallet', icon: Wallet },
                { id: 'cash', label: 'Cash', icon: Banknote },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as AccountType)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Account Name / Label
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HDFC Salary A/c or Amazon Pay ICICI Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Bank Selection (if not cash) */}
          {type !== 'cash' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Bank / Issuer
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {INDIAN_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Last 4 Digits
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4592"
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Balance / Outstanding */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {type === 'credit_card' ? 'Current Outstanding Balance (₹)' : 'Current Balance (₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Credit Card Specific Fields */}
          {type === 'credit_card' && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Billing Cycle & Limit Details
              </span>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Total Credit Limit (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="e.g. 200000"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500">Statement Date</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="15"
                    value={billingDate}
                    onChange={(e) => setBillingDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white mt-0.5"
                  />
                  <span className="text-[10px] text-slate-400">Day of month</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500">Payment Due Date</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="5"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white mt-0.5"
                  />
                  <span className="text-[10px] text-slate-400">Day of next month</span>
                </div>
              </div>
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
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-bold shadow-md shadow-teal-600/20 transition active:scale-95"
            >
              {editAccount ? 'Save Changes' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
