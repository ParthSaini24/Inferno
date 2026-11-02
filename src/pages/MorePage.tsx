import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_GOALS, INITIAL_RECURRING } from '@/lib/mockData';
import { formatINR, formatDateIndian } from '@/utils/formatters';
import {
  Settings,
  Database,
  Moon,
  Sun,
  RotateCcw,
  Download,
  Target,
  Repeat,
  Sparkles,
  ShieldCheck,
  User,
  LogOut,
  ExternalLink,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface MorePageProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const MorePage: React.FC<MorePageProps> = ({ darkMode, setDarkMode }) => {
  const { user, household, signOut } = useAuth();
  const { resetToDemoData, transactions } = useFinance();

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['Date', 'Merchant', 'Type', 'Amount', 'Payment Mode', 'Category', 'Note', 'Shared'];
    const rows = transactions.map((t) => [
      t.date,
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      t.payment_mode,
      t.category_id,
      `"${(t.note || '').replace(/"/g, '""')}"`,
      t.is_shared,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PaisaPilot_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transactions CSV exported');
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings & More
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          PaisaPilot preferences, Supabase database, and upcoming features
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="Profile"
            className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500"
          />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {user?.full_name || 'Pilot User'}
            </h2>
            <p className="text-xs text-slate-400">
              Household: <span className="font-semibold text-slate-700 dark:text-slate-300">{household?.name || 'Saini Family'}</span>
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
              INR ₹ Currency Format
            </span>
          </div>
        </div>

        <button
          onClick={signOut}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Backend & Supabase Status Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Supabase & PostgreSQL Connection
              </h3>
              <p className="text-xs text-slate-400">
                {isSupabaseConfigured
                  ? 'Connected to live Supabase instance with RLS enabled'
                  : 'Running in Local/Demo Mode (Persistent LocalStorage + Realistic Mock)'}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isSupabaseConfigured
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
            }`}
          >
            {isSupabaseConfigured ? 'Live Supabase' : 'Offline / Demo Ready'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2 text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Info className="w-4 h-4 text-teal-500" />
            Full SQL Schema Ready
          </p>
          <p>
            The entire Supabase PostgreSQL script with Row Level Security (RLS) on all 9 tables
            (profiles, households, household_members, categories, transactions, budgets,
            recurring_items, goals, settlements) and edge functions is created in{' '}
            <code className="text-teal-600 dark:text-teal-400 font-mono">supabase/schema.sql</code>.
          </p>
        </div>
      </div>

      {/* Phase 2 Sneak Peeks: Goals & EMIs / Recurring Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goals preview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Indian Savings Goals
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
              Phase 2
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {INITIAL_GOALS.map((g) => {
              const pct = Math.round((g.saved_amount / g.target_amount) * 100);
              return (
                <div key={g.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{g.name}</span>
                    <span className="rupee-num text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatINR(g.saved_amount)} / {formatINR(g.target_amount)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recurring EMIs & SIPs preview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-teal-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Upcoming EMIs & SIPs
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
              Phase 2
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {INITIAL_RECURRING.map((r) => (
              <div
                key={r.id}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                  <p className="text-[10px] text-slate-400">
                    Due: {formatDateIndian(r.next_due_date)} • {r.type.toUpperCase()}
                  </p>
                </div>
                <span className="font-bold rupee-num text-rose-500">
                  {formatINR(r.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preferences & Data Actions */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          Preferences & Actions
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
          {/* Theme switcher */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-slate-500" />}
              <span className="font-medium text-slate-700 dark:text-slate-300">Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              {darkMode ? 'Dark' : 'Light'}
            </button>
          </div>

          {/* Export CSV */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Export All Transactions</span>
            </div>
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800"
            >
              Export CSV
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Reset Demo Transactions</span>
            </div>
            <button
              onClick={resetToDemoData}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800"
            >
              Restore Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
