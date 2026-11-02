import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Users2,
  PieChart,
  Moon,
  Sun,
} from 'lucide-react';
import { toast } from 'sonner';

interface AuthPageProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ darkMode, setDarkMode }) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsDemo, loading } =
    useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (mode === 'signup' && !fullName.trim()) {
      errs.fullName = 'Please enter your name';
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password || password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'signup') {
      await signUpWithEmail(fullName, email, password);
    } else {
      await signInWithEmail(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-teal-600/30">
            ₹
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
              PaisaPilot
            </span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400">
              India
            </span>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-2xs"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left column: Brand Narrative & Indian Finance Highlights */}
        <div className="flex-1 space-y-6 text-center lg:text-left max-w-lg lg:max-w-none">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 text-xs font-bold text-teal-800 dark:text-teal-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Built for Indian Households & UPI</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Master your daily spending, family splits & savings goals.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            PaisaPilot reflects how money moves in India: seamless UPI logging, bank SMS auto-parsing,
            shared household rent & grocery ledger, Diwali festival envelopes, and Kameti chit fund tracking.
          </p>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <Smartphone className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">Under 5s Entry</p>
              <p className="text-[11px] text-slate-400 mt-0.5">UPI, Cash & SMS parse</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <Users2 className="w-5 h-5 text-indigo-500 mb-2" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">Household Split</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Who owes whom ledger</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <PieChart className="w-5 h-5 text-teal-500 mb-2" />
              <p className="text-xs font-bold text-slate-900 dark:text-white">Rollover Envelopes</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Festivals & groceries</p>
            </div>
          </div>
        </div>

        {/* Right column: Auth Card */}
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            {/* Header / Tabs */}
            <div className="space-y-4">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrors({});
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'signin'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrors({});
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    mode === 'signup'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {mode === 'signin' ? 'Welcome Back!' : 'Start Your Money Pilot'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {mode === 'signin'
                    ? 'Enter your credentials to access your household ledger'
                    : 'Create a free account to track Indian expenses and goals'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Parth Saini"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none ${
                        errors.fullName ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none ${
                      errors.email ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none ${
                      errors.password ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
              >
                <span>{mode === 'signin' ? 'Sign In to PaisaPilot' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[10px] text-slate-400 font-bold uppercase">Or Instant Access</span>
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Quick Demo Access Button */}
            <button
              type="button"
              onClick={signInAsDemo}
              className="w-full py-2.5 px-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-bold border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-2 transition shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Continue as Demo Guest (Parth Saini)</span>
            </button>

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2.5 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 dark:border-slate-800">
        PaisaPilot 🇮🇳 • Smart Money Manager for Indian Households
      </footer>
    </div>
  );
};
