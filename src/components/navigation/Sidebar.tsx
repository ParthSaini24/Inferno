import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  ArrowLeftRight,
  PieChart,
  Users2,
  Target,
  Repeat,
  BarChart3,
  MoreHorizontal,
  Plus,
  Sparkles,
  FileSpreadsheet,
  Wallet,
  LogOut,
  Landmark,
} from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/utils/formatters';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, badge: '' },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, badge: '' },
  { to: '/budgets', label: 'Budgets', icon: PieChart, badge: '' },
  { to: '/accounts', label: 'Accounts & Cards', icon: Landmark, badge: '' },
  { to: '/household', label: 'Household', icon: Users2, badge: '' },
  { to: '/goals', label: 'Goals & Chits', icon: Target, badge: 'New' },
  { to: '/recurring', label: 'EMIs & Bills', icon: Repeat, badge: '' },
  { to: '/insights', label: 'Insights', icon: BarChart3, badge: '' },
  { to: '/more', label: 'More', icon: MoreHorizontal, badge: '' },
];

export const Sidebar: React.FC = () => {
  const {
    setIsAddTxOpen,
    setIsSmartPasteOpen,
    setIsCsvImportOpen,
    stats,
    setPrefilledTxData,
  } = useFinance();
  const { user, household, signOut } = useAuth();

  const handleOpenAdd = () => {
    setPrefilledTxData(null);
    setIsAddTxOpen(true);
  };

  return (
    <aside className="hidden sm:flex flex-col w-64 h-screen sticky top-0 phos-glass border-r border-slate-200/80 dark:border-slate-800/80 px-4 py-5 z-30 select-none overflow-y-auto transition-colors duration-200">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-5">
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
          <div className="absolute -inset-1 rounded-2xl border border-teal-500/40 animate-phos-orbit pointer-events-none" />
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-600/30 font-black text-xl">
            ₹
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              PaisaPilot
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
              India
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">
            {household?.name || 'Smart Money'}
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="space-y-2 mb-5">
        <button
          onClick={handleOpenAdd}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Transaction</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsSmartPasteOpen(true)}
            className="p-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-teal-200/60 dark:border-teal-800/50 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SMS</span>
          </button>
          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `phos-nav-lens flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold border-l-2 border-teal-500 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Mini Financial Summary Card */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 mb-3">
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
          <span>Remaining Cash Flow</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {stats.savingsRatePercent}% saved
          </span>
        </div>
        <p className="text-base font-black text-slate-900 dark:text-white rupee-num">
          {formatINR(stats.remainingThisMonth)}
        </p>
      </div>

      {/* User / Profile Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="Profile avatar"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.full_name || 'Pilot User'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">INR ₹ Account</p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
