import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { Sparkles, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { user, completeOnboarding } = useAuth();
  const { categories } = useFinance();

  const [fullName, setFullName] = useState(user?.full_name || 'Parth Saini');
  const [householdName, setHouseholdName] = useState('Saini Family Household');
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const handleFinish = () => {
    if (!fullName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    completeOnboarding(fullName.trim(), householdName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 my-auto">
        {/* Banner with gradient - Fixed */}
        <div className="shrink-0 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-black mb-3 shadow-inner">
            ₹
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Welcome to PaisaPilot
          </h2>
          <p className="text-xs text-teal-100 mt-1 max-w-xs mx-auto">
            Smart money manager tailored for Indian households & daily UPI expenses.
          </p>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 overscroll-contain">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Parth Saini"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Household / Family Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saini Family Household"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <p className="text-[11px] text-slate-400">
                  You can invite household members to split rent, groceries and EMIs.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition"
                >
                  <span>Continue to Default Categories</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Seeded Indian Categories
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-configured with UPI, EMIs, Festivals, and Indian essentials:
                </p>
              </div>

              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
                {categories.slice(0, 14).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <CategoryIcon name={c.icon} className="w-3.5 h-3.5" color={c.color} />
                    <span>{c.name}</span>
                  </div>
                ))}
                <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold self-center pl-1">
                  + {categories.length - 14} more
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition"
                >
                  <span>Launch PaisaPilot</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
