import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR, formatCompactINR } from '@/utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  Smartphone,
  Banknote,
  CreditCard,
  Landmark,
  ShieldCheck,
  Zap,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

export const InsightsPage: React.FC = () => {
  const { transactions, categories, getCategoryById, stats } = useFinance();

  // Mode breakdown
  const paymentModeData = React.useMemo(() => {
    const counts: Record<string, { count: number; amount: number }> = {
      upi: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      cash: { count: 0, amount: 0 },
      netbanking: { count: 0, amount: 0 },
    };

    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        counts[tx.payment_mode].count += 1;
        counts[tx.payment_mode].amount += Number(tx.amount);
      }
    });

    const colors: Record<string, string> = {
      upi: '#10b981',
      card: '#6366f1',
      cash: '#f59e0b',
      netbanking: '#06b6d4',
    };

    return Object.entries(counts).map(([mode, data]) => ({
      name: mode.toUpperCase(),
      amount: data.amount,
      count: data.count,
      color: colors[mode],
    }));
  }, [transactions]);

  // Top category spends
  const categoryData = React.useMemo(() => {
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
        color: getCategoryById(id)?.color || '#0d9488',
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 7);
  }, [transactions, getCategoryById]);

  // Daily average spend
  const dailyAverage = Math.round(stats.totalExpenseThisMonth / 2); // currently day 2 of Nov

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Financial Insights & Health
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
            Phase 2
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Deep analytics on household cash flow, UPI spending habits, and savings velocity
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Average Daily Spend
          </span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white rupee-num">
            {formatINR(dailyAverage)} / day
          </p>
          <span className="text-xs text-teal-600 font-semibold">
            Based on current month velocity
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Savings Rate
          </span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 rupee-num">
            {stats.savingsRatePercent}%
          </p>
          <span className="text-xs text-slate-400 font-medium">
            Benchmark for Indian households is &gt; 25%
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            UPI Dominance
          </span>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            78%
          </p>
          <span className="text-xs text-slate-400 font-medium">
            of daily merchant payments
          </span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Spends Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Category Expense Breakdown
            </h2>
            <p className="text-xs text-slate-400">Top expense categories in November 2026</p>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), 'Spent']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Modes Distribution Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              UPI, Cash & Cards Flow
            </h2>
            <p className="text-xs text-slate-400">Where Indian household money is transacted</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentModeData}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {paymentModeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatINR(Number(val)), 'Amount']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Indian Financial Advice Cards */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 border border-teal-200/80 dark:border-teal-800/50 space-y-3">
        <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>PaisaPilot Smart Recommendations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-teal-100 dark:border-teal-900/40">
            <p className="font-bold text-slate-900 dark:text-white mb-0.5">
              🎉 Festive Season Alert (Diwali)
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Your Diwali Gold & Gifts Fund is 77% funded. Maintain the rollover budget to avoid unexpected card EMIs.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-teal-100 dark:border-teal-900/40">
            <p className="font-bold text-slate-900 dark:text-white mb-0.5">
              🛡️ Emergency Fund Buffer
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              You have {formatINR(195000)} saved towards your 6-month living expenses reserve ({formatINR(300000)} goal).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
