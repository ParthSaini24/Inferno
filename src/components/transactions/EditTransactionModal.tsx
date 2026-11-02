import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Transaction, PaymentMode, TransactionType } from '@/types';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { uploadReceiptFile } from '@/lib/supabase';
import { z } from 'zod';
import {
  X,
  Trash2,
  Calendar,
  Check,
  Users,
  Smartphone,
  Banknote,
  CreditCard,
  Landmark,
  UploadCloud,
} from 'lucide-react';
import { toast } from 'sonner';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const editSchema = z.object({
  amount: z.number().positive('Please enter a valid amount'),
  type: z.enum(['expense', 'income']),
  category_id: z.string().min(1, 'Please select a category'),
  payment_mode: z.enum(['upi', 'cash', 'card', 'netbanking']),
  merchant: z.string().min(1, 'Merchant/Payee is required'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_shared: z.boolean(),
  receipt_url: z.string().nullable().optional(),
});

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { categories, updateTransaction, deleteTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmountStr(String(transaction.amount));
      setSelectedCategoryId(transaction.category_id);
      setPaymentMode(transaction.payment_mode);
      setMerchant(transaction.merchant);
      setDate(transaction.date);
      setNote(transaction.note || '');
      setIsShared(transaction.is_shared);
      setReceiptUrl(transaction.receipt_url || null);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amountStr);

    const formData = {
      amount: numericAmount,
      type,
      category_id: selectedCategoryId,
      payment_mode: paymentMode,
      merchant: merchant.trim(),
      date,
      note: note.trim() || undefined,
      is_shared: isShared,
      receipt_url: receiptUrl,
    };

    const val = editSchema.safeParse(formData);
    if (!val.success) {
      toast.error(val.error.issues[0]?.message || 'Validation error');
      return;
    }

    await updateTransaction(transaction.id, val.data);
    onClose();
  };

  const handleDelete = async () => {
    await deleteTransaction(transaction.id);
    onClose();
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadReceiptFile(file);
      setReceiptUrl(url);
      toast.success('New receipt attached');
    } catch (err: any) {
      toast.error('Failed to attach receipt: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header - Fixed */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Transaction
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Delete transaction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Expense/Income Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const defaultExp = categories.find((c) => c.type === 'expense');
                if (defaultExp) setSelectedCategoryId(defaultExp.id);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                const defaultInc = categories.find((c) => c.type === 'income');
                if (defaultInc) setSelectedCategoryId(defaultInc.id);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Amount (₹)
            </label>
            <div className="flex items-center px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-2xl font-black text-slate-400 mr-2">₹</span>
              <input
                type="number"
                step="any"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full text-2xl font-black bg-transparent text-slate-900 dark:text-white focus:outline-none rupee-num"
              />
            </div>
          </div>

          {/* Merchant */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Merchant / Payee
            </label>
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Payment Mode */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payment Mode
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'upi', label: 'UPI', icon: Smartphone },
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'netbanking', label: 'NetBank', icon: Landmark },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMode(m.id as PaymentMode)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
              {filteredCategories.map((c) => {
                const isSelected = selectedCategoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CategoryIcon name={c.icon} className="w-3 h-3" color={isSelected ? '#fff' : c.color} />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Split */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label
                onClick={() => setIsShared(!isShared)}
                className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer select-none text-xs font-semibold ${
                  isShared
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    isShared ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-400'
                  }`}
                >
                  {isShared && <Check className="w-3 h-3" />}
                </div>
                <span>Shared Household</span>
              </label>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Receipt */}
          <div className="pt-1">
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-teal-500" />
                {receiptUrl ? 'Change attached receipt' : 'Attach receipt file'}
              </span>
              <input type="file" accept="image/*,.pdf" onChange={handleReceiptUpload} className="hidden" />
              {isUploading && <span className="text-teal-600 animate-pulse">Uploading...</span>}
            </label>
            {receiptUrl && (
              <img
                src={receiptUrl}
                alt="Receipt"
                className="w-14 h-14 object-cover rounded-xl mt-2 border border-slate-200 dark:border-slate-700"
              />
            )}
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
              Update Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
