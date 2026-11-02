import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { GoldAsset } from '@/types';
import { formatINR } from '@/utils/formatters';
import { X, Sparkles, Shield, Coins, Award } from 'lucide-react';
import { toast } from 'sonner';

interface AddGoldAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddGoldAssetModal: React.FC<AddGoldAssetModalProps> = ({ isOpen, onClose }) => {
  const { addGoldAsset } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<'physical' | 'digital' | 'sgb'>('physical');
  const [weight, setWeight] = useState('10');
  const [pricePerGram, setPricePerGram] = useState('7400');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const totalValue = (parseFloat(weight) || 0) * (parseFloat(pricePerGram) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter gold asset name');
      return;
    }
    const w = parseFloat(weight);
    const p = parseFloat(pricePerGram);
    if (isNaN(w) || w <= 0 || isNaN(p) || p <= 0) {
      toast.error('Please enter valid weight and purchase price');
      return;
    }

    await addGoldAsset({
      user_id: 'usr-pilot-01',
      name: name.trim(),
      type,
      weight_grams: w,
      purchase_price_per_gram: p,
      purchase_date: date,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Add Gold Holding
              </h2>
              <p className="text-xs text-slate-400">Physical bullion, Digital Gold & SGBs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Gold Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gold Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'physical', label: 'Physical Bar/Coin' },
                { id: 'sgb', label: 'RBI SGB Bond' },
                { id: 'digital', label: 'Digital Gold' },
              ].map((t) => {
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id as any)}
                    className={`py-2 px-1 rounded-xl border text-xs font-semibold transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asset Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Asset Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tanishq 24K 10g Bar or SGB 2024-25 Series I"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Weight & Price per Gram */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Weight (Grams)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="10"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Price/Gram (₹)
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="7400"
                value={pricePerGram}
                onChange={(e) => setPricePerGram(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Auto-Calculated Value Preview */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200">Total Purchase Value</span>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                {weight || 0}g @ {formatINR(parseFloat(pricePerGram) || 0)}/g
              </p>
            </div>
            <span className="text-base font-black text-amber-900 dark:text-amber-200 rupee-num">
              {formatINR(totalValue)}
            </span>
          </div>

          {/* Date & Locker Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Locker / Note
              </label>
              <input
                type="text"
                placeholder="e.g. Locker #42"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
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
              className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-sm font-bold shadow-md shadow-amber-600/20 transition active:scale-95"
            >
              Add Gold Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
