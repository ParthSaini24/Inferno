import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { PaymentMode, TransactionType } from '@/types';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { uploadReceiptFile } from '@/lib/supabase';
import { z } from 'zod';
import {
  X,
  Plus,
  Calendar,
  Tag,
  FileText,
  UploadCloud,
  Check,
  Users,
  Smartphone,
  Banknote,
  CreditCard,
  Landmark,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

const transactionSchema = z.object({
  amount: z.number().positive('Please enter a valid amount greater than 0'),
  type: z.enum(['expense', 'income']),
  category_id: z.string().min(1, 'Please select a category'),
  payment_mode: z.enum(['upi', 'cash', 'card', 'netbanking']),
  merchant: z.string().min(1, 'Merchant/Payee name is required'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_shared: z.boolean(),
  receipt_url: z.string().nullable().optional(),
});

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000];
const FREQUENT_INDIAN_MERCHANTS = ['Swiggy', 'Blinkit', 'Zomato', 'Zepto', 'Indian Oil', 'D-Mart', 'Uber', 'Airtel'];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { categories, addTransaction, prefilledTxData, setPrefilledTxData } = useFinance();
  const { household } = useAuth();
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [merchant, setMerchant] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isShared, setIsShared] = useState<boolean>(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter categories by selected type
  const filteredCategories = categories.filter((c) => c.type === type);

  // Initialize or handle prefilled data (e.g. from Smart SMS paste)
  useEffect(() => {
    if (isOpen) {
      if (prefilledTxData) {
        setType(prefilledTxData.type || 'expense');
        setAmountStr(prefilledTxData.amount ? String(prefilledTxData.amount) : '');
        setSelectedCategoryId(prefilledTxData.category_id || '');
        setPaymentMode(prefilledTxData.payment_mode || 'upi');
        setMerchant(prefilledTxData.merchant || '');
        setDate(prefilledTxData.date || new Date().toISOString().split('T')[0]);
        setNote(prefilledTxData.note || '');
        setTags(prefilledTxData.tags || []);
        setIsShared(prefilledTxData.is_shared || false);
        setReceiptUrl(prefilledTxData.receipt_url || null);
      } else {
        // Reset to smart defaults
        setType('expense');
        setAmountStr('');
        setPaymentMode('upi');
        setMerchant('');
        setDate(new Date().toISOString().split('T')[0]);
        setNote('');
        setTags([]);
        setIsShared(false);
        setReceiptUrl(null);
        // Default to first expense category (e.g. Food & Dining)
        const defaultCat = categories.find((c) => c.type === 'expense');
        if (defaultCat) setSelectedCategoryId(defaultCat.id);
      }

      setErrors({});
      // Auto-focus amount for sub-5s speed
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, prefilledTxData, categories]);

  if (!isOpen) return null;

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + addValue));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingReceipt(true);
    try {
      const url = await uploadReceiptFile(file);
      setReceiptUrl(url);
      toast.success('Receipt attached');
    } catch (err: any) {
      toast.error('Failed to attach receipt: ' + err.message);
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const numericAmount = parseFloat(amountStr);

    const formData = {
      amount: numericAmount,
      type,
      category_id: selectedCategoryId || (filteredCategories[0]?.id || ''),
      payment_mode: paymentMode,
      merchant: merchant.trim(),
      date,
      note: note.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      is_shared: isShared,
      receipt_url: receiptUrl,
    };

    const validation = transactionSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[String(issue.path[0])] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    await addTransaction(validation.data);
    setPrefilledTxData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Add Transaction
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fast entry under 5 seconds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Expense / Income Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                const defaultExp = categories.find((c) => c.type === 'expense');
                if (defaultExp) setSelectedCategoryId(defaultExp.id);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Income
            </button>
          </div>

          {/* Large Rupee Amount Input */}
          <div className="space-y-2">
            <div
              className={`flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 transition-all ${
                errors.amount
                  ? 'border-rose-400 bg-rose-50/20'
                  : 'border-slate-200 dark:border-slate-700/60 focus-within:border-teal-500'
              }`}
            >
              <span className="text-3xl font-extrabold text-slate-400 dark:text-slate-500 mr-2">
                ₹
              </span>
              <input
                ref={amountInputRef}
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="0"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full text-center text-4xl font-extrabold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none rupee-num"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-500 font-medium text-center">{errors.amount}</p>
            )}

            {/* Quick Amount Pills */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300 border border-slate-200/60 dark:border-slate-700 transition"
                >
                  +{val}
                </button>
              ))}
              {amountStr && (
                <button
                  type="button"
                  onClick={() => setAmountStr('')}
                  className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-rose-500 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Payment Mode
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'upi', label: 'UPI', icon: Smartphone, color: 'text-emerald-500' },
                { id: 'cash', label: 'Cash', icon: Banknote, color: 'text-amber-500' },
                { id: 'card', label: 'Card', icon: CreditCard, color: 'text-indigo-500' },
                { id: 'netbanking', label: 'NetBank', icon: Landmark, color: 'text-cyan-500' },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = paymentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMode(mode.id as PaymentMode)}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-semibold ring-2 ring-teal-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-600 dark:text-teal-400' : mode.color}`} />
                    <span className="text-xs">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Chips Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Category
              </label>
              <span className="text-xs text-slate-400">
                {filteredCategories.length} categories
              </span>
            </div>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <CategoryIcon
                      name={cat.icon}
                      className="w-3.5 h-3.5"
                      color={isSelected ? '#ffffff' : cat.color}
                    />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
            {errors.category_id && (
              <p className="text-xs text-rose-500 font-medium">{errors.category_id}</p>
            )}
          </div>

          {/* Merchant / Payee with quick suggestions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {type === 'expense' ? 'Merchant / Paid To' : 'Received From / Source'}
            </label>
            <input
              type="text"
              placeholder={type === 'expense' ? 'e.g. Swiggy, Blinkit, Landlord' : 'e.g. Salary, Client retainer'}
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              className={`w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                errors.merchant ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.merchant && (
              <p className="text-xs text-rose-500 font-medium">{errors.merchant}</p>
            )}

            {/* Quick Indian Merchant Chips */}
            {type === 'expense' && !merchant && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {FREQUENT_INDIAN_MERCHANTS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMerchant(m)}
                    className="px-2 py-0.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-teal-600 transition"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Picker & Household Share row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Date (DD/MM/YYYY)
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Household Split Toggle */}
            <div className="flex flex-col justify-end">
              <label
                onClick={() => setIsShared(!isShared)}
                className={`flex items-center gap-2.5 p-2.5 rounded-2xl border cursor-pointer select-none transition ${
                  isShared
                    ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                    isShared ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isShared && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>Split with Household</span>
                </div>
              </label>
            </div>
          </div>

          {/* Note & Tags */}
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <input
                type="text"
                placeholder="Add a quick note... (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Tags Input */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add tag (e.g. #diwali, #dinner)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Add Tag
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Receipt Upload to Supabase Storage */}
            <div className="pt-2">
              <label className="flex items-center justify-between p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer hover:bg-slate-100/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {receiptUrl ? 'Receipt attached (Click to change)' : 'Attach Bill / Receipt'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      PNG, JPG or PDF up to 5MB (Supabase Storage)
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
                {isUploadingReceipt && (
                  <span className="text-xs text-teal-600 animate-pulse font-medium">Uploading...</span>
                )}
              </label>

              {receiptUrl && (
                <div className="mt-2 relative inline-block">
                  <img
                    src={receiptUrl}
                    alt="Receipt preview"
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setReceiptUrl(null)}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shadow"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-sm font-bold shadow-lg shadow-teal-600/25 transition active:scale-[0.98]"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
