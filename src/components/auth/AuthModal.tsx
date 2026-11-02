import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithEmail, signInWithGoogle, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter email and password');
      return;
    }
    await signInWithEmail(email.trim(), password);
    onClose();
  };

  const handleGoogle = async () => {
    await signInWithGoogle();
    onClose();
  };

  const handleDemoSignIn = async () => {
    await signInWithEmail('parth.saini@paisapilot.in', 'demo123');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
        {/* Header - Fixed */}
        <div className="shrink-0 p-6 text-center border-b border-slate-100 dark:border-slate-800 relative bg-gradient-to-b from-teal-50/50 to-transparent dark:from-teal-950/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white text-xl font-black mb-3 shadow-md shadow-teal-600/30">
            ₹
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isSignUp ? 'Create your PaisaPilot Account' : 'Sign in to PaisaPilot'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Smart money management for Indian households
          </p>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
          {/* Quick Demo Guest Button */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-3 px-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs font-bold border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-2 transition shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Instant Demo Mode (1-Click Test Drive)</span>
          </button>

          <div className="flex items-center gap-2 my-2">
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Or with</span>
            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition"
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

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 transition"
            >
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Toggle between Sign In / Sign Up */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
