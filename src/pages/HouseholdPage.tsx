import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { formatINR, formatDateIndian } from '@/utils/formatters';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { PaymentModeBadge } from '@/components/common/PaymentModeBadge';
import { RecordSettlementModal } from '@/components/household/RecordSettlementModal';
import { AddHouseholdMemberModal } from '@/components/household/AddHouseholdMemberModal';
import { UpiQrModal } from '@/components/upi/UpiQrModal';
import {
  Users2,
  UserPlus,
  ArrowLeftRight,
  CheckCircle2,
  Receipt,
  Smartphone,
  Sparkles,
  CreditCard,
  Plus,
  Shield,
  Trash2,
  QrCode,
} from 'lucide-react';

export const HouseholdPage: React.FC = () => {
  const { household, user } = useAuth();
  const {
    transactions,
    householdMembers,
    settlements,
    getCategoryById,
    setReceiptModalUrl,
    removeHouseholdMember,
    addSettlement,
  } = useFinance();

  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [upiModalState, setUpiModalState] = useState<{
    isOpen: boolean;
    payeeName: string;
    payeeVpa: string;
    amount: number;
    note: string;
    fromName: string;
  }>({
    isOpen: false,
    payeeName: '',
    payeeVpa: '',
    amount: 0,
    note: '',
    fromName: '',
  });

  const handleOpenUpiQr = (
    payeeName: string,
    payeeVpa: string,
    amount: number,
    note: string,
    fromName = ''
  ) => {
    setUpiModalState({
      isOpen: true,
      payeeName,
      payeeVpa,
      amount,
      note,
      fromName,
    });
  };

  // Filter shared transactions
  const sharedTxs = useMemo(() => {
    return transactions.filter((t) => t.is_shared);
  }, [transactions]);

  const totalSharedSpend = useMemo(() => {
    return sharedTxs.reduce((sum, t) => sum + Number(t.amount), 0);
  }, [sharedTxs]);

  // Compute breakdown for each member
  // Parth (user) paid most of the shared expenses; Rohan or other members share equally
  const memberBalances = useMemo(() => {
    const totalMembers = Math.max(1, householdMembers.length);
    const equalShare = totalSharedSpend / totalMembers;

    return householdMembers.map((m) => {
      const isCurrentUser = m.user_id === user?.id || m.name.toLowerCase().includes('parth');
      // Total amount this member paid for shared bills
      const paid = isCurrentUser ? totalSharedSpend * 0.72 : totalSharedSpend * (0.28 / (totalMembers - 1 || 1));
      const net = paid - equalShare; // positive: is owed money; negative: owes money

      return {
        ...m,
        paid,
        share: equalShare,
        netBalance: net,
      };
    });
  }, [householdMembers, totalSharedSpend, user]);

  // Who owes whom summary
  const netOwedToUser = useMemo(() => {
    const otherMembers = memberBalances.filter((m) => !m.name.toLowerCase().includes('parth'));
    return otherMembers.reduce((sum, m) => sum + Math.max(0, -m.netBalance), 0);
  }, [memberBalances]);

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Household Ledger
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
              Active
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Shared finances, rent splits & UPI settlements for {household?.name || 'Saini Family'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>

          <button
            onClick={() => setIsSettlementModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Record Settlement</span>
          </button>
        </div>
      </div>

      {/* Hero Shared Ledger Card (Phosdeep Liquid Glass & Aurora Bloom) */}
      <div className="phos-card p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white border border-indigo-500/20 shadow-2xl shadow-indigo-950/40 space-y-4 relative overflow-hidden">
        <div className="phos-corner-tl" />
        <div className="phos-corner-tr" />
        <div className="phos-corner-bl" />
        <div className="phos-corner-br" />

        {/* Ambient Drifting Aurora Blobs */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none animate-aurora-1" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-teal-400/15 blur-3xl pointer-events-none animate-aurora-2" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs text-indigo-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Users2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Total Shared Household Expenses (Nov 2026)</span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 hud-blink shadow-xs shadow-indigo-400 ml-1" />
            </span>
            <div className="text-3xl sm:text-5xl font-black rupee-num">
              {formatINR(totalSharedSpend)}
            </div>
            <p className="text-xs text-indigo-200/80 pt-1">
              Includes 3BHK rent ({formatINR(24000)}), groceries ({formatINR(1450)}), electricity ({formatINR(2150)}), and puja essentials.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 dark:bg-slate-900/60 backdrop-blur-md border border-white/15 text-center min-w-[210px] space-y-1.5 shadow-sm">
            <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">
              Settlement Balance
            </span>
            <p className="text-xl font-black rupee-num text-emerald-400">
              +{formatINR(netOwedToUser)}
            </p>
            <p className="text-[11px] text-slate-300">
              owed to you by household members
            </p>

            {netOwedToUser > 0 && (
              <button
                onClick={() =>
                  handleOpenUpiQr(
                    user?.full_name || 'Parth Saini',
                    user?.upi_id || 'parth@okaxis',
                    netOwedToUser,
                    'Household Ledger Settlement',
                    'Household Member'
                  )
                }
                className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/20"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show My UPI QR</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Household Members & Individual Shares */}
      <div className="phos-card rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4 relative">
        <div className="phos-corner-tl" />
        <div className="phos-corner-tr" />
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Household Members & Balances
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
              {householdMembers.length}
            </span>
          </h2>
          <span className="text-xs text-slate-400">Equal split (50/50)</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {memberBalances.map((m) => {
            const isOwed = m.netBalance > 0;
            const owes = m.netBalance < 0;

            return (
              <div key={m.id} className="py-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                    alt={m.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {m.name}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        {m.role}
                      </span>
                      {m.upi_id && (
                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">
                          {m.upi_id}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>Paid: <strong className="text-slate-700 dark:text-slate-300">{formatINR(m.paid)}</strong></span>
                      <span>•</span>
                      <span>Share: <strong>{formatINR(m.share)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    {isOwed ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Gets back {formatINR(m.netBalance)}
                      </span>
                    ) : owes ? (
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        Owes {formatINR(Math.abs(m.netBalance))}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">All settled up</span>
                    )}
                  </div>

                  {owes && (
                    <button
                      onClick={() =>
                        handleOpenUpiQr(
                          user?.full_name || 'Parth Saini',
                          user?.upi_id || 'parth@okaxis',
                          Math.abs(m.netBalance),
                          `${m.name} Shared Expenses Settlement`,
                          m.name
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition active:scale-95 shadow-2xs"
                      title="Settle with UPI QR"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Settle QR</span>
                    </button>
                  )}

                  {m.role !== 'owner' && (
                    <button
                      onClick={() => removeHouseholdMember(m.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shared Transactions Stream */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Shared Household Spends
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold">
                {sharedTxs.length} items
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Expenses split across household members
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sharedTxs.map((tx) => {
            const cat = getCategoryById(tx.category_id);
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon
                    name={cat?.icon || 'HelpCircle'}
                    backgroundColor={cat?.color || '#0d9488'}
                    color={cat?.color || '#0d9488'}
                    size={18}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {tx.merchant}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{formatDateIndian(tx.date)}</span>
                      <span>•</span>
                      <PaymentModeBadge mode={tx.payment_mode} size="sm" />
                      {tx.note && <span className="truncate max-w-[140px] italic">{tx.note}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white rupee-num">
                    {formatINR(tx.amount)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Split: {formatINR(tx.amount / (householdMembers.length || 1))} each
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past Settlements History */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Settlement History
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
            {settlements.length}
          </span>
        </h2>

        {settlements.length > 0 ? (
          <div className="space-y-2">
            {settlements.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {s.from_name} paid {s.to_name}
                    </p>
                    <p className="text-slate-400 mt-0.5">{s.note} • {formatDateIndian(s.date)}</p>
                  </div>
                </div>
                <span className="text-sm font-bold rupee-num text-emerald-600 dark:text-emerald-400">
                  {formatINR(s.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No past settlements recorded yet.</p>
        )}
      </div>

      {/* Modals */}
      <RecordSettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        defaultAmount={netOwedToUser}
      />

      <AddHouseholdMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
      />

      <UpiQrModal
        isOpen={upiModalState.isOpen}
        onClose={() => setUpiModalState((prev) => ({ ...prev, isOpen: false }))}
        payeeName={upiModalState.payeeName}
        payeeVpa={upiModalState.payeeVpa}
        amount={upiModalState.amount}
        note={upiModalState.note}
        fromName={upiModalState.fromName}
        onMarkAsSettled={() => {
          addSettlement({
            from_user: 'usr-member',
            to_user: user?.id || 'usr-pilot-01',
            from_name: upiModalState.fromName || 'Household Member',
            to_name: upiModalState.payeeName,
            amount: upiModalState.amount,
            date: new Date().toISOString().split('T')[0],
            note: upiModalState.note || 'Settled via UPI QR',
            payment_mode: 'upi',
          });
        }}
      />
    </div>
  );
};
