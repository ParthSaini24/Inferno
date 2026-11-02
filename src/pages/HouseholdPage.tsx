import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { formatINR, formatDateIndian } from '@/utils/formatters';
import { Users2, UserPlus, ArrowLeftRight, CheckCircle2, Shield, Sparkles } from 'lucide-react';

export const HouseholdPage: React.FC = () => {
  const { household, user } = useAuth();
  const { transactions } = useFinance();

  // Shared transactions
  const sharedTxs = transactions.filter((t) => t.is_shared);
  const totalSharedSpend = sharedTxs.reduce((sum, t) => sum + Number(t.amount), 0);

  const mockMembers = [
    {
      id: 'm1',
      name: user?.full_name || 'Parth Saini',
      role: 'Owner',
      avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      paid: totalSharedSpend * 0.7,
      share: totalSharedSpend * 0.5,
    },
    {
      id: 'm2',
      name: 'Rohan Verma',
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      paid: totalSharedSpend * 0.3,
      share: totalSharedSpend * 0.5,
    },
  ];

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Household Ledger
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
              Phase 2 Preview
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Shared finances for {household?.name || 'Your Household'}
          </p>
        </div>

        <button
          disabled
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600/50 text-white text-xs font-bold cursor-not-allowed opacity-80"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Member (Coming Soon)</span>
        </button>
      </div>

      {/* Household Overview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-indigo-900/60 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-indigo-300 uppercase font-bold tracking-wider">
              Total Shared Expenses This Month
            </span>
            <p className="text-3xl font-black rupee-num mt-1">
              {formatINR(totalSharedSpend)}
            </p>
            <p className="text-xs text-indigo-200/80 mt-1">
              Includes 3BHK flat rent, electricity, grocery deliveries, and housemaid salary.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center min-w-[180px]">
            <span className="text-xs text-emerald-300 font-semibold">Settlement Status</span>
            <p className="text-base font-bold text-white mt-1">
              Rohan owes you <span className="text-emerald-400 font-black">{formatINR(totalSharedSpend * 0.2)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Household Members
          <span className="text-xs text-slate-400 font-normal">({mockMembers.length})</span>
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {mockMembers.map((m) => (
            <div key={m.id} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {m.name}
                    </p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      {m.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Paid: {formatINR(m.paid)}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Fair Share: {formatINR(m.share)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
