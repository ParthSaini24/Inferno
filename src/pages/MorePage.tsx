import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatINR, formatDateIndian } from '@/utils/formatters';
import { Link } from 'react-router-dom';
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
  ChevronRight,
  BarChart3,
  Users2,
  Landmark,
  Calculator,
  Share2,
} from 'lucide-react';
import { IndianTaxCalculatorModal } from '@/components/tax/IndianTaxCalculatorModal';
import { WhatsAppDigestModal } from '@/components/reports/WhatsAppDigestModal';
import { toast } from 'sonner';

interface MorePageProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const MorePage: React.FC<MorePageProps> = ({ darkMode, setDarkMode }) => {
  const { user, household, signOut } = useAuth();
  const { resetToDemoData, transactions, goals, recurringItems } = useFinance();

  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

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
          PaisaPilot preferences, Supabase database, and Phase 2 features
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

      {/* Feature Navigation Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/accounts"
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 transition shadow-sm group"
        >
          <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2">
            <Landmark className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Accounts & Cards</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Banks, Cards & Gold</p>
        </Link>

        <Link
          to="/goals"
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 transition shadow-sm group"
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Goals & Chits</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Kametis & Savings</p>
        </Link>

        <Link
          to="/recurring"
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 transition shadow-sm group"
        >
          <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2">
            <Repeat className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>EMIs & SIPs</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Fixed Commitments</p>
        </Link>

        <Link
          to="/insights"
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 transition shadow-sm group"
        >
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
            <BarChart3 className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Insights</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Analytics & Cash Flow</p>
        </Link>
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

          {/* Indian Tax Regime Calculator */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300 block">
                  Indian Tax Estimator (Old vs New Slabs)
                </span>
                <span className="text-[11px] text-slate-400">
                  Compare 80C, 80D, HRA & NPS deductions
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsTaxModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800"
            >
              Calculate
            </button>
          </div>

          {/* WhatsApp Household Digest */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300 block">
                  WhatsApp Family Digest & Statement
                </span>
                <span className="text-[11px] text-slate-400">
                  Generate shareable monthly family statement
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800"
            >
              Share Digest
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
              <span className="font-medium text-slate-700 dark:text-slate-300">Reset Demo Data</span>
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

      {/* Modals */}
      <IndianTaxCalculatorModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
      />

      <WhatsAppDigestModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
    </div>
  );
};
