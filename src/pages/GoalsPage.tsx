import React, { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR, formatDateIndian } from '@/utils/formatters';
import { AddEditGoalModal } from '@/components/goals/AddEditGoalModal';
import { ContributeGoalModal } from '@/components/goals/ContributeGoalModal';
import { AddEditChitFundModal } from '@/components/goals/AddEditChitFundModal';
import { Goal, ChitFund } from '@/types';
import {
  Target,
  Plus,
  Sparkles,
  TrendingUp,
  Building,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Edit2,
  Trash2,
  Flame,
  Coins,
} from 'lucide-react';
import { toast } from 'sonner';

export const GoalsPage: React.FC = () => {
  const {
    goals,
    chitFunds,
    deleteGoal,
    payChitInstallment,
    claimChitFund,
  } = useFinance();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);
  const [isChitModalOpen, setIsChitModalOpen] = useState(false);
  const [claimingChitId, setClaimingChitId] = useState<string | null>(null);
  const [claimPayoutStr, setClaimPayoutStr] = useState('175000');

  // Aggregates
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.saved_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const overallPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const totalChitDividends = chitFunds.reduce((sum, c) => sum + Number(c.dividend_earned), 0);
  const monthlyChitOutflow = chitFunds
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + Number(c.monthly_contribution), 0);

  const handleCreateGoal = () => {
    setGoalToEdit(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (g: Goal) => {
    setGoalToEdit(g);
    setIsGoalModalOpen(true);
  };

  const handleConfirmClaim = async (chitId: string) => {
    const amount = parseFloat(claimPayoutStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }
    await claimChitFund(chitId, amount);
    setClaimingChitId(null);
  };

  return (
    <div className="space-y-8 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Savings Goals & Chit Funds
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Active
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Diwali gold funds, family emergency reserves, and community Kameti pools
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChitModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-200 text-xs font-bold border border-amber-200 dark:border-amber-800 transition"
          >
            <Building className="w-3.5 h-3.5 text-amber-600" />
            <span>Enroll Chit Fund</span>
          </button>

          <button
            onClick={handleCreateGoal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Savings Goal</span>
          </button>
        </div>
      </div>

      {/* Hero Savings Milestone Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Total Accumulated Savings Across Goals
            </span>
            <div className="text-3xl sm:text-5xl font-black rupee-num">
              {formatINR(totalSaved)}
              <span className="text-xl font-normal text-emerald-200/80"> / {formatINR(totalTarget)}</span>
            </div>
            <p className="text-xs text-emerald-200/80 pt-1">
              You have achieved <strong className="text-white">{overallPercent}%</strong> of your household financial targets!
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
            <span className="text-3xl font-extrabold text-emerald-300 rupee-num">
              {overallPercent}%
            </span>
            <span className="text-xs text-emerald-200">Overall Milestone</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/15">
          <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: Active Savings Goals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Active Savings Goals
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
              {goals.length}
            </span>
          </h2>
          <span className="text-xs text-slate-400">Target milestone tracker</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = Math.round((g.saved_amount / g.target_amount) * 100);
            const remaining = g.target_amount - g.saved_amount;

            return (
              <div
                key={g.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 group hover:border-emerald-400 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {g.name}
                      </h3>
                      {g.category === 'festival' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" />
                          <span>Festival</span>
                        </span>
                      )}
                    </div>
                    {g.target_date && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Target: {formatDateIndian(g.target_date)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditGoal(g)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 transition"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Numbers */}
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white rupee-num">
                      {formatINR(g.saved_amount)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {' '}
                      of {formatINR(g.target_amount)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {pct}% saved
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                {/* Footer action */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400">
                    {remaining > 0 ? `${formatINR(remaining)} to go` : 'Goal achieved! 🎉'}
                  </span>

                  <button
                    onClick={() => setContributingGoal(g)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Money</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Indian Chit Funds & Kameti Tracker */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-500" />
              Indian Chit Funds & Kameti Tracker
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                {chitFunds.length} Active
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Traditional Indian revolving committee pools, monthly dividends & auction payouts
            </p>
          </div>

          <button
            onClick={() => setIsChitModalOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Chit Fund</span>
          </button>
        </div>

        {/* Chit summary banner */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Monthly Contribution</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white rupee-num">
                {formatINR(monthlyChitOutflow)} / mo
              </p>
            </div>
            <div className="h-6 w-[1px] bg-amber-200 dark:bg-amber-800" />
            <div>
              <span className="text-slate-500 dark:text-slate-400">Total Dividends Earned</span>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 rupee-num">
                +{formatINR(totalChitDividends)}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            Installments automatically update your ledger when logged.
          </p>
        </div>

        {/* Chit Funds Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chitFunds.map((c) => {
            const installmentProgress = Math.round((c.current_month / c.total_months) * 100);
            const totalContributed = c.monthly_contribution * c.current_month;

            return (
              <div
                key={c.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pool: <strong className="text-slate-700 dark:text-slate-300">{formatINR(c.total_chit_amount)}</strong> • {c.total_months} Months
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      c.status === 'claimed'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                        : c.status === 'completed'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Progress stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block">Paid So Far</span>
                    <span className="font-bold text-slate-900 dark:text-white rupee-num">
                      {formatINR(totalContributed)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      (Month {c.current_month} of {c.total_months})
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block">Dividends Earned</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 rupee-num">
                      +{formatINR(c.dividend_earned)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Auction discount</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Installment progress</span>
                    <span className="font-semibold">{installmentProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${installmentProgress}%` }}
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400">
                    Next: {formatDateIndian(c.next_due_date)}
                  </span>

                  <div className="flex items-center gap-2">
                    {c.status === 'active' && (
                      <button
                        onClick={() => setClaimingChitId(c.id)}
                        className="px-2.5 py-1 text-xs rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-100"
                      >
                        Claim Payout
                      </button>
                    )}

                    <button
                      onClick={() => payChitInstallment(c.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition shadow-xs"
                    >
                      Pay Installment ({formatINR(c.monthly_contribution)})
                    </button>
                  </div>
                </div>

                {/* Claim Payout inline dialog */}
                {claimingChitId === c.id && (
                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2 text-xs">
                    <p className="font-bold text-purple-900 dark:text-purple-200">
                      Record Auction Claim / Payout Amount
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={claimPayoutStr}
                        onChange={(e) => setClaimPayoutStr(e.target.value)}
                        placeholder="e.g. 175000"
                        className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 font-bold rupee-num"
                      />
                      <button
                        onClick={() => handleConfirmClaim(c.id)}
                        className="px-3 py-2 rounded-xl bg-purple-600 text-white font-bold"
                      >
                        Claim & Deposit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <AddEditGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
      />

      <ContributeGoalModal
        isOpen={Boolean(contributingGoal)}
        onClose={() => setContributingGoal(null)}
        goal={contributingGoal}
      />

      <AddEditChitFundModal
        isOpen={isChitModalOpen}
        onClose={() => setIsChitModalOpen(false)}
      />
    </div>
  );
};
