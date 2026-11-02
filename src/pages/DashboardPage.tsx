import React, { useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { RecurringItem } from '@/types';
import { formatINR, formatDateIndian, formatRelativeDate } from '@/utils/formatters';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { PaymentModeBadge } from '@/components/common/PaymentModeBadge';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  Plus,
  FileSpreadsheet,
  ArrowRight,
  Receipt,
  Users,
  ShieldCheck,
  Calendar,
  CreditCard,
  ChevronRight,
  Flame,
  Target,
  Repeat,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    stats,
    recentTransactions,
    getCategoryById,
    setIsAddTxOpen,
    setIsSmartPasteOpen,
    setIsCsvImportOpen,
    setReceiptModalUrl,
    setPrefilledTxData,
    transactions,
    goals,
    recurringItems,
    markRecurringAsPaid,
  } = useFinance();

  const handleOpenAdd = () => {
    setPrefilledTxData(null);
    setIsAddTxOpen(true);
  };

  // Payment mode distribution data for Recharts
  const paymentModeData = React.useMemo(() => {
    const counts: Record<string, number> = { upi: 0, card: 0, cash: 0, netbanking: 0 };
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        counts[tx.payment_mode] = (counts[tx.payment_mode] || 0) + Number(tx.amount);
      }
    });

    const colors: Record<string, string> = {
      upi: '#10b981',
      card: '#6366f1',
      cash: '#f59e0b',
      netbanking: '#06b6d4',
    };

    return Object.entries(counts)
      .filter(([_, val]) => val > 0)
      .map(([mode, value]) => ({
        name: mode.toUpperCase(),
        value,
        color: colors[mode] || '#10b981',
      }));
  }, [transactions]);

  // Top 4 categories spend
  const categorySpendData = React.useMemo(() => {
    const catMap: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        catMap[tx.category_id] = (catMap[tx.category_id] || 0) + Number(tx.amount);
      }
    });

    return Object.entries(catMap)
      .map(([catId, amount]) => {
        const cat = getCategoryById(catId);
        return {
          name: cat?.name || 'Other',
          amount,
          color: cat?.color || '#0d9488',
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [transactions, getCategoryById]);

  // Next 2 upcoming recurring items
  const upcomingBills = useMemo(() => {
    return [...recurringItems]
      .filter((r) => r.active)
      .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())
      .slice(0, 3);
  }, [recurringItems]);

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Welcome Banner / Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Household Finances
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Overview of your daily UPI, cash and family expenses for November 2026
          </p>
        </div>

        {/* Quick Header Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSmartPasteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200/80 dark:border-teal-800/60 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Smart SMS Paste</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Hero Financial Health Card (Calm Teal/Emerald Fintech Style) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white p-6 sm:p-8 shadow-xl shadow-teal-950/30">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-teal-200/90 text-xs font-semibold uppercase tracking-wider">
              <span>This Month Remaining Cashflow</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-3xl sm:text-5xl font-black tracking-tight rupee-num">
              {formatINR(stats.remainingThisMonth)}
            </div>
            <p className="text-xs text-teal-200/80 pt-1">
              ₹ Savings rate is{' '}
              <span className="font-bold text-emerald-300">
                {stats.savingsRatePercent}%
              </span>{' '}
              of income this month.
            </p>
          </div>

          {/* Spent vs Income breakdown pills */}
          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-rose-300 font-semibold mb-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Total Spent</span>
              </div>
              <div className="text-xl sm:text-2xl font-black rupee-num text-white">
                {formatINR(stats.totalExpenseThisMonth)}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Total Income</span>
              </div>
              <div className="text-xl sm:text-2xl font-black rupee-num text-white">
                {formatINR(stats.totalIncomeThisMonth)}
              </div>
            </div>
          </div>
        </div>

        {/* Cashflow visual meter */}
        <div className="mt-6 pt-5 border-t border-white/15">
          <div className="flex items-center justify-between text-xs text-teal-200/90 font-medium mb-2">
            <span>Monthly Cashflow Budget Utilization</span>
            <span>
              {stats.totalIncomeThisMonth > 0
                ? Math.min(
                    100,
                    Math.round(
                      (stats.totalExpenseThisMonth / stats.totalIncomeThisMonth) * 100
                    )
                  )
                : 0}
              % used
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500"
              style={{
                width: `${
                  stats.totalIncomeThisMonth > 0
                    ? Math.min(
                        100,
                        (stats.totalExpenseThisMonth / stats.totalIncomeThisMonth) * 100
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setIsSmartPasteOpen(true)}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 transition shadow-sm text-left group"
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Smart SMS Paste
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Parse bank alerts & UPI</p>
        </button>

        <button
          onClick={handleOpenAdd}
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition shadow-sm text-left group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            One-Tap Expense
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Log in under 5 seconds</p>
        </button>

        <Link
          to="/goals"
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition shadow-sm text-left group block"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Goals & Chits
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Diwali gold & Kametis</p>
        </Link>

        <Link
          to="/household"
          className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition shadow-sm text-left group block"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
            Household Money
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Shared family splits</p>
        </Link>
      </div>

      {/* Phase 2 Spotlight: Upcoming EMIs & Bills */}
      {upcomingBills.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Upcoming EMIs & Fixed Bills
              </h2>
            </div>
            <Link
              to="/recurring"
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>View all recurring</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {upcomingBills.map((bill: RecurringItem) => (
              <div
                key={bill.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {bill.type.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      Due: {formatDateIndian(bill.next_due_date)}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 truncate">
                    {bill.name}
                  </p>
                  <p className="text-base font-black rupee-num text-slate-900 dark:text-white mt-0.5">
                    {formatINR(bill.amount)}
                  </p>
                </div>

                <button
                  onClick={() => markRecurringAsPaid(bill)}
                  className="w-full py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Paid</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Analytics Row: Payment Modes & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Modes Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Payment Modes
              </h2>
              <p className="text-xs text-slate-400">Where money moves (UPI vs Cards)</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              UPI Dominant
            </span>
          </div>

          <div className="h-44 flex items-center justify-center">
            {paymentModeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                  >
                    {paymentModeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
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
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No expenses logged yet</p>
            )}
          </div>

          {/* Mode Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {paymentModeData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {d.name}
                  </span>
                </div>
                <span className="font-bold rupee-num text-slate-900 dark:text-white">
                  {formatINR(d.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Spend Categories */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Top Spending Categories
                </h2>
                <p className="text-xs text-slate-400">Rent, Groceries, Food & Utilities</p>
              </div>
              <Link
                to="/transactions"
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {categorySpendData.map((cat, idx) => {
                const percent =
                  stats.totalExpenseThisMonth > 0
                    ? Math.round((cat.amount / stats.totalExpenseThisMonth) * 100)
                    : 0;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-normal">{percent}%</span>
                        <span className="font-bold rupee-num text-slate-900 dark:text-white">
                          {formatINR(cat.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Reflects all household and personal transactions</span>
            <span className="font-medium text-teal-600 dark:text-teal-400">
              {stats.transactionCount} entries recorded
            </span>
          </div>
        </div>
      </div>

      {/* Recent 5 Transactions */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Recent Transactions
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Latest 5
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant expense and income stream
            </p>
          </div>

          <Link
            to="/transactions"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
          >
            <span>See All Transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => {
              const cat = getCategoryById(tx.category_id);
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <CategoryIcon
                      name={cat?.icon || 'HelpCircle'}
                      backgroundColor={cat?.color || '#0d9488'}
                      color={cat?.color || '#0d9488'}
                      size={20}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {tx.merchant}
                        </p>
                        {tx.is_shared && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                            title="Shared Household Expense"
                          >
                            Family
                          </span>
                        )}
                        {tx.receipt_url && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReceiptModalUrl(tx.receipt_url || null);
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1 hover:bg-teal-100"
                            title="View receipt"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Bill</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span>{formatRelativeDate(tx.date)}</span>
                        <span>•</span>
                        <span>{cat?.name || 'Expense'}</span>
                        <span>•</span>
                        <PaymentModeBadge mode={tx.payment_mode} size="sm" />
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <p
                      className={`text-base font-extrabold rupee-num ${
                        isExpense
                          ? 'text-slate-900 dark:text-white'
                          : 'text-emerald-600 dark:text-emerald-400 font-black'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatINR(tx.amount)}
                    </p>
                    <p className="text-[11px] text-slate-400">{formatDateIndian(tx.date)}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <p className="text-sm font-medium">No transactions recorded yet</p>
              <button
                onClick={handleOpenAdd}
                className="text-xs text-teal-600 font-semibold hover:underline"
              >
                Log your first expense
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
