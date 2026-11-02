import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Sparkles, Users, Calendar, LogOut } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
  const { setIsSmartPasteOpen } = useFinance();
  const { household, user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Branding / Desktop Title */}
      <div className="flex items-center gap-3">
        <div className="sm:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            ₹
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
            PaisaPilot
          </span>
        </div>

        {/* Household Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 text-xs font-semibold text-teal-800 dark:text-teal-300">
          <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>{household?.name || 'Indian Household'}</span>
        </div>

        {/* Current Month Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Nov 2026</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Quick SMS Paste shortcut on mobile */}
        <button
          onClick={() => setIsSmartPasteOpen(true)}
          className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200/80 dark:border-teal-800/60 transition active:scale-95"
          title="Paste SMS"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-500" />
          <span>SMS</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
          aria-label="Toggle theme"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User avatar on mobile */}
        <Link to="/more" className="sm:hidden" title="View profile & settings">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
        </Link>

        {/* Quick Sign Out Button */}
        <button
          onClick={signOut}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-95"
          aria-label="Sign out"
          title="Sign out of PaisaPilot"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
