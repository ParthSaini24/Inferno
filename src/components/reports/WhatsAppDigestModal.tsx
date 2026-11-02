import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/utils/formatters';
import {
  X,
  Share2,
  Copy,
  Check,
  Printer,
  Sparkles,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppDigestModal: React.FC<WhatsAppDigestModalProps> = ({ isOpen, onClose }) => {
  const { stats, transactions, householdMembers, goals, getCategoryById, accounts } = useFinance();
  const { household, user } = useAuth();

  const [copied, setCopied] = useState(false);

  // Top 3 expense categories
  const topCategories = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        map[tx.category_id] = (map[tx.category_id] || 0) + Number(tx.amount);
      }
    });
    return Object.entries(map)
      .map(([id, amount]) => ({
        name: getCategoryById(id)?.name || 'General',
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [transactions, getCategoryById]);

  // Shared spending and who owes whom
  const digestText = useMemo(() => {
    const totalSpent = formatINR(stats.totalExpenseThisMonth);
    const topList = topCategories
      .map((c) => `  • ${c.name}: ${formatINR(c.amount)}`)
      .join('\n');

    const totalLiquid = accounts
      .filter((a) => a.type !== 'credit_card')
      .reduce((sum, a) => sum + Number(a.balance), 0);

    const goalStatus = goals[0]
      ? `🎯 ${goals[0].name}: ${Math.round(
          (goals[0].saved_amount / goals[0].target_amount) * 100
        )}% Achieved (${formatINR(goals[0].saved_amount)} / ${formatINR(goals[0].target_amount)})`
      : '🎯 Savings goals on track!';

    return `🏠 *PaisaPilot Family Digest — November 2026*
Family: *${household?.name || 'Saini Household'}*
━━━━━━━━━━━━━━━━━━━━━━
💰 *Total Spent This Month:* ${totalSpent}
🛒 *Top Spends:*
${topList}

⚖️ *Household Ledger:*
  • Shared Bills: ${formatINR(stats.totalSharedSpendThisMonth)}
  • Settlement Balance: Rohan owes Parth ₹4,200

${goalStatus}
🏦 *Liquid Reserves:* ${formatINR(totalLiquid)} in Banks & Cash
━━━━━━━━━━━━━━━━━━━━━━
_Logged via PaisaPilot 🇮🇳 • Smart Money Manager_`;
  }, [stats, topCategories, household, goals, accounts]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(digestText);
    setCopied(true);
    toast.success('WhatsApp digest copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(digestText)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-md max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto">
        {/* Header - Fixed */}
        <div className="shrink-0 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Share2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">WhatsApp Family Digest</h2>
              <p className="text-[11px] text-emerald-100">Monthly summary ready to share</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formatted Message Preview - Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
            {digestText}
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Tap below to open WhatsApp with this pre-formatted message for your family group.
          </p>
        </div>

        {/* Footer Actions - Fixed */}
        <div className="shrink-0 p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <button
            onClick={handleSendWhatsApp}
            className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            <span>Share directly on WhatsApp</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Statement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
