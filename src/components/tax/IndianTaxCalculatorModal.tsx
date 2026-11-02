import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/utils/formatters';
import {
  X,
  Calculator,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Info,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

interface IndianTaxCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IndianTaxCalculatorModal: React.FC<IndianTaxCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { transactions } = useFinance();

  // Annual Gross Salary estimate (default ₹15,00,000)
  const [annualGrossIncome, setAnnualGrossIncome] = useState<string>('1500000');
  const [deduction80C, setDeduction80C] = useState<string>('150000'); // max 1.5L
  const [deduction80D, setDeduction80D] = useState<string>('25000'); // health insurance
  const [deductionNps, setDeductionNps] = useState<string>('50000'); // 80CCD(1B)
  const [homeLoanInterest, setHomeLoanInterest] = useState<string>('0'); // Section 24b up to 2L
  const [hraExemption, setHraExemption] = useState<string>('120000'); // HRA rent exemption

  // Auto-detect logged investment transactions in category 'Investments & SIP' (cat-13)
  const loggedInvestments = useMemo(() => {
    return transactions
      .filter((t) => t.category_id === 'cat-13' && t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  if (!isOpen) return null;

  const gross = parseFloat(annualGrossIncome) || 0;
  const c80 = Math.min(150000, parseFloat(deduction80C) || 0);
  const d80 = Math.min(75000, parseFloat(deduction80D) || 0);
  const nps = Math.min(50000, parseFloat(deductionNps) || 0);
  const homeLoan = Math.min(200000, parseFloat(homeLoanInterest) || 0);
  const hra = parseFloat(hraExemption) || 0;

  // 1. Calculate Tax under NEW REGIME (FY 2024-25 / FY 2025-26 Budget)
  // Standard Deduction: ₹75,000
  const standardDeductionNew = 75000;
  const taxableIncomeNew = Math.max(0, gross - standardDeductionNew);

  const calculateNewRegimeTax = (inc: number): number => {
    if (inc <= 700000) return 0; // Section 87A rebate up to 7 Lakhs (Nil tax)
    let tax = 0;
    if (inc > 1500000) {
      tax += (inc - 1500000) * 0.3;
      inc = 1500000;
    }
    if (inc > 1200000) {
      tax += (inc - 1200000) * 0.2;
      inc = 1200000;
    }
    if (inc > 1000000) {
      tax += (inc - 1000000) * 0.15;
      inc = 1000000;
    }
    if (inc > 700000) {
      tax += (inc - 700000) * 0.1;
      inc = 700000;
    }
    if (inc > 300000) {
      tax += (inc - 300000) * 0.05;
    }
    // 4% Health & Education Cess
    return Math.round(tax * 1.04);
  };

  const taxNew = calculateNewRegimeTax(taxableIncomeNew);

  // 2. Calculate Tax under OLD REGIME
  // Standard Deduction: ₹50,000
  const standardDeductionOld = 50000;
  const totalOldDeductions = standardDeductionOld + c80 + d80 + nps + homeLoan + hra;
  const taxableIncomeOld = Math.max(0, gross - totalOldDeductions);

  const calculateOldRegimeTax = (inc: number): number => {
    if (inc <= 500000) return 0; // Section 87A rebate up to 5 Lakhs (Nil tax)
    let tax = 0;
    if (inc > 1000000) {
      tax += (inc - 1000000) * 0.3;
      inc = 1000000;
    }
    if (inc > 500000) {
      tax += (inc - 500000) * 0.2;
      inc = 500000;
    }
    if (inc > 250000) {
      tax += (inc - 250000) * 0.05;
    }
    // 4% Cess
    return Math.round(tax * 1.04);
  };

  const taxOld = calculateOldRegimeTax(taxableIncomeOld);

  const savings = Math.abs(taxOld - taxNew);
  const recommendedRegime = taxNew <= taxOld ? 'New Tax Regime' : 'Old Tax Regime';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Indian Tax Regime Estimator</h2>
              <p className="text-[11px] text-emerald-100">FY 2024-25 / FY 2025-26 Budget Slabs</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Winner Recommendation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Recommended Tax Strategy
              </span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                Choose the <span className="text-emerald-600 dark:text-emerald-400">{recommendedRegime}</span>
              </p>
              <p className="text-xs text-slate-500">
                You save approx <strong className="text-slate-900 dark:text-white rupee-num">{formatINR(savings)}</strong> in annual taxes!
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Annual Tax</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 rupee-num">
                {formatINR(Math.min(taxNew, taxOld))}
              </span>
            </div>
          </div>

          {/* Income Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gross Annual Salary / Income (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="10000"
                value={annualGrossIncome}
                onChange={(e) => setAnnualGrossIncome(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Comparison Cards: New vs Old */}
          <div className="grid grid-cols-2 gap-3">
            {/* New Regime */}
            <div
              className={`p-4 rounded-2xl border text-center space-y-1.5 transition ${
                taxNew <= taxOld
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                New Tax Regime
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white rupee-num">
                {formatINR(taxNew)}
              </p>
              <p className="text-[10px] text-slate-400">
                Standard ded: ₹75,000. Zero tax up to ₹7L income.
              </p>
            </div>

            {/* Old Regime */}
            <div
              className={`p-4 rounded-2xl border text-center space-y-1.5 transition ${
                taxOld < taxNew
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Old Tax Regime
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white rupee-num">
                {formatINR(taxOld)}
              </p>
              <p className="text-[10px] text-slate-400">
                With 80C, 80D, HRA & NPS total {formatINR(totalOldDeductions)} deductions.
              </p>
            </div>
          </div>

          {/* Old Regime Deductions Customizer */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Old Regime Deductions
              </span>
              {loggedInvestments > 0 && (
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                  Detected {formatINR(loggedInvestments)} SIPs logged!
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Section 80C (Max ₹1.5L)
                </label>
                <input
                  type="number"
                  value={deduction80C}
                  onChange={(e) => setDeduction80C(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  Section 80D Health Ins.
                </label>
                <input
                  type="number"
                  value={deduction80D}
                  onChange={(e) => setDeduction80D(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  NPS 80CCD(1B) (Max ₹50k)
                </label>
                <input
                  type="number"
                  value={deductionNps}
                  onChange={(e) => setDeductionNps(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">
                  HRA Rent Exemption
                </label>
                <input
                  type="number"
                  value={hraExemption}
                  onChange={(e) => setHraExemption(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
