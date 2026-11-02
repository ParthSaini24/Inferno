import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR, formatDateIndian } from '@/utils/formatters';
import { AddEditRecurringModal } from '@/components/recurring/AddEditRecurringModal';
import { RecurringItem } from '@/types';
import {
  Repeat,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  Home,
  Tv,
  Bell,
  Edit2,
  Trash2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

export const RecurringPage: React.FC = () => {
  const {
    recurringItems,
    markRecurringAsPaid,
    deleteRecurringItem,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<RecurringItem | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'emi' | 'sip' | 'rent' | 'subscription'>('all');

  // Filter items by type
  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return recurringItems;
    return recurringItems.filter((r) => r.type === activeTab);
  }, [recurringItems, activeTab]);

  // Aggregates
  const totalMonthlyCommitment = recurringItems.reduce((sum, r) => sum + Number(r.amount), 0);

  // Split into upcoming vs later
  const sortedItems = [...filteredItems].sort(
    (a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime()
  );

  const handleCreate = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: RecurringItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const getTypeIcon = (type: RecurringItem['type']) => {
    switch (type) {
      case 'emi':
        return <CreditCard className="w-4 h-4 text-rose-500" />;
      case 'sip':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'rent':
        return <Home className="w-4 h-4 text-indigo-500" />;
      case 'subscription':
        return <Tv className="w-4 h-4 text-purple-500" />;
      default:
        return <Repeat className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              EMIs, SIPs & Recurring Bills
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              Active
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Fixed Indian monthly commitments: Home loans, Mutual fund SIPs, Rent & utilities
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Schedule Bill</span>
        </button>
      </div>

      {/* Hero Monthly Commitment Card (Phosdeep Liquid Glass & Aurora Bloom) */}
      <div className="phos-card p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 text-white border border-teal-500/20 shadow-2xl shadow-teal-950/40 space-y-4 relative overflow-hidden">
        <div className="phos-corner-tl" />
        <div className="phos-corner-tr" />
        <div className="phos-corner-bl" />
        <div className="phos-corner-br" />

        {/* Ambient Drifting Aurora Blobs */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-teal-500/15 blur-3xl pointer-events-none animate-aurora-1" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none animate-aurora-2" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs text-teal-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Total Monthly Fixed Outflow</span>
              <span className="w-2 h-2 rounded-full bg-teal-400 hud-blink shadow-xs shadow-teal-400 ml-1" />
            </span>
            <div className="text-3xl sm:text-5xl font-black rupee-num">
              {formatINR(totalMonthlyCommitment)}
              <span className="text-xl font-normal text-teal-200/80"> / month</span>
            </div>
            <p className="text-xs text-teal-200/80 pt-1">
              Includes Home Loan EMI ({formatINR(28500)}), Flat Rent ({formatINR(24000)}), and Automated SIPs ({formatINR(10000)}).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 dark:bg-slate-900/60 backdrop-blur-md border border-white/15 text-center min-w-[180px] shadow-sm">
            <span className="text-xs text-teal-300 font-semibold">Active Schedules</span>
            <p className="text-2xl font-black text-white mt-1">
              {recurringItems.length} items
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'emi', label: 'EMIs & Loans' },
          { id: 'sip', label: 'Mutual Fund SIPs' },
          { id: 'rent', label: 'Flat Rent' },
          { id: 'subscription', label: 'Utilities & Subs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-2xl border transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recurring Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedItems.map((r) => {
          const daysLeft = Math.ceil(
            (new Date(r.next_due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          const isUrgent = daysLeft >= 0 && daysLeft <= 3;

          return (
            <div
              key={r.id}
              className={`phos-card p-5 rounded-3xl bg-white dark:bg-slate-900 border transition shadow-sm space-y-4 group relative ${
                isUrgent
                  ? 'border-amber-300 dark:border-amber-900/60 ring-1 ring-amber-500/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="phos-corner-tl" />
              <div className="phos-corner-br" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {getTypeIcon(r.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {r.name}
                      </h3>
                      {r.household_id && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-0.5">
                          <Users className="w-3 h-3" />
                          <span>Household</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">
                      {r.frequency} • {r.type.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(r)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteRecurringItem(r.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Amount and due date */}
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white rupee-num">
                    {formatINR(r.amount)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium"> / {r.frequency}</span>
                </div>

                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isUrgent
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {daysLeft === 0
                    ? 'Due Today!'
                    : daysLeft > 0
                    ? `Due in ${daysLeft} days`
                    : 'Overdue'}
                </span>
              </div>

              {/* Action row */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateIndian(r.next_due_date)}
                </span>

                <button
                  onClick={() => markRecurringAsPaid(r)}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Mark as Paid</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <AddEditRecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemToEdit={itemToEdit}
      />
    </div>
  );
};
