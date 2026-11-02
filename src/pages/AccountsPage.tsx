import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { formatINR } from '@/utils/formatters';
import { Account, GoldAsset } from '@/types';
import { AddEditAccountModal } from '@/components/accounts/AddEditAccountModal';
import { TransferAccountModal } from '@/components/accounts/TransferAccountModal';
import { AddGoldAssetModal } from '@/components/accounts/AddGoldAssetModal';
import {
  Landmark,
  CreditCard,
  Banknote,
  Wallet,
  ArrowLeftRight,
  Plus,
  Coins,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Edit2,
  Trash2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export const AccountsPage: React.FC = () => {
  const { accounts, goldAssets, deleteAccount, deleteGoldAsset } = useFinance();

  const [activeTab, setActiveTab] = useState<'all' | 'banks' | 'cards' | 'gold'>('all');
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferTargetCardId, setTransferTargetCardId] = useState<string | undefined>(undefined);
  const [isAddGoldOpen, setIsAddGoldOpen] = useState(false);

  // Bank & Cash Liquidity vs Credit Card Debt
  const liquidBalance = useMemo(() => {
    return accounts
      .filter((a) => a.type !== 'credit_card')
      .reduce((sum, a) => sum + Number(a.balance), 0);
  }, [accounts]);

  const creditCardOutstanding = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'credit_card')
      .reduce((sum, a) => sum + Number(a.balance), 0);
  }, [accounts]);

  const totalCreditLimit = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'credit_card')
      .reduce((sum, a) => sum + Number(a.credit_limit || 0), 0);
  }, [accounts]);

  const totalGoldWeight = useMemo(() => {
    return goldAssets.reduce((sum, g) => sum + Number(g.weight_grams), 0);
  }, [goldAssets]);

  const totalGoldValuation = useMemo(() => {
    // Current Indian gold market benchmark ~ ₹7,450/gram for 24K
    const currentPricePerGram = 7450;
    return totalGoldWeight * currentPricePerGram;
  }, [totalGoldWeight]);

  const creditUtilizationPercent = useMemo(() => {
    if (totalCreditLimit === 0) return 0;
    return Math.min(100, Math.round((creditCardOutstanding / totalCreditLimit) * 100));
  }, [creditCardOutstanding, totalCreditLimit]);

  const bankAccounts = useMemo(() => accounts.filter((a) => a.type === 'bank' || a.type === 'wallet' || a.type === 'cash'), [accounts]);
  const creditCards = useMemo(() => accounts.filter((a) => a.type === 'credit_card'), [accounts]);

  const handleOpenTransferForCard = (cardId: string) => {
    setTransferTargetCardId(cardId);
    setIsTransferOpen(true);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return CreditCard;
      case 'cash':
        return Banknote;
      case 'wallet':
        return Wallet;
      case 'bank':
      default:
        return Landmark;
    }
  };

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Accounts & Cards
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              Liquidity Hub
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Bank balances, credit card billing cycles, ATM cash & Sovereign Gold Bonds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTransferTargetCardId(undefined);
              setIsTransferOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Transfer Funds</span>
          </button>

          <button
            onClick={() => {
              setEditingAccount(null);
              setIsAddAccountOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Liquid Balance */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Liquid Balance (Banks & Cash)</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white rupee-num">
            {formatINR(liquidBalance)}
          </div>
          <p className="text-xs text-slate-400">
            Across {bankAccounts.length} accounts & cash reserves
          </p>
        </div>

        {/* Credit Card Spends */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Credit Card Outstanding</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 rupee-num">
            {formatINR(creditCardOutstanding)}
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{creditUtilizationPercent}% limit used</span>
              <span>Limit: {formatINR(totalCreditLimit)}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  creditUtilizationPercent > 50
                    ? 'bg-rose-500'
                    : creditUtilizationPercent > 30
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${creditUtilizationPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gold & SGB Valuation */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Gold & SGB Holdings</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300 rupee-num">
            {formatINR(totalGoldValuation)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>{totalGoldWeight.toFixed(1)} grams total</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              @ ₹7,450/g (24K)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl max-w-md">
        {[
          { id: 'all', label: 'All Accounts' },
          { id: 'banks', label: `Banks & Cash (${bankAccounts.length})` },
          { id: 'cards', label: `Credit Cards (${creditCards.length})` },
          { id: 'gold', label: `Gold & SGB (${goldAssets.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Credit Cards Section (if tab is all or cards) */}
      {(activeTab === 'all' || activeTab === 'cards') && creditCards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>Credit Cards & Billing Cycles</span>
            </h2>
            <span className="text-xs text-slate-400">RBI 30% limit utilization guide</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creditCards.map((card) => {
              const util = card.credit_limit
                ? Math.round((card.balance / card.credit_limit) * 100)
                : 0;

              return (
                <div
                  key={card.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {card.name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {card.bank_name} •••• {card.account_number_last4 || 'Card'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingAccount(card);
                          setIsAddAccountOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAccount(card.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Outstanding and Limit */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Unbilled Spends
                      </span>
                      <p className="text-2xl font-black text-rose-600 dark:text-rose-400 rupee-num">
                        {formatINR(card.balance)}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Total Limit
                      </span>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 rupee-num">
                        {formatINR(card.credit_limit || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Utilization Meter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Credit Utilization: <strong>{util}%</strong></span>
                      <span className={util > 30 ? 'text-amber-500 font-bold' : 'text-emerald-500 font-bold'}>
                        {util > 30 ? 'High Usage' : 'Healthy (<30%)'}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          util > 50 ? 'bg-rose-500' : util > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, util)}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates & Pay Action */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 text-slate-400">
                      <p>
                        Statement: <strong className="text-slate-700 dark:text-slate-300">{card.billing_cycle_date || 15}th</strong> of month
                      </p>
                      <p>
                        Due Date: <strong className="text-rose-500">{card.payment_due_date || 5}th</strong> of next month
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenTransferForCard(card.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 transition active:scale-95"
                    >
                      Pay Bill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bank Accounts & Cash Grid (if tab is all or banks) */}
      {(activeTab === 'all' || activeTab === 'banks') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-teal-500" />
              <span>Savings Accounts, Wallets & Cash</span>
            </h2>
            <span className="text-xs text-slate-400">{bankAccounts.length} liquid sources</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bankAccounts.map((acc) => {
              const Icon = getAccountIcon(acc.type);
              return (
                <div
                  key={acc.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingAccount(acc);
                          setIsAddAccountOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAccount(acc.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {acc.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {acc.bank_name ? `${acc.bank_name} •••• ${acc.account_number_last4 || ''}` : 'Cash in Hand'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                    <span className="text-lg font-black text-slate-900 dark:text-white rupee-num">
                      {formatINR(acc.balance)}
                    </span>
                    {acc.is_primary && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gold & Sovereign Gold Bonds Section (if tab is all or gold) */}
      {(activeTab === 'all' || activeTab === 'gold') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Physical Gold & Sovereign Gold Bonds (SGB)
              </h2>
            </div>

            <button
              onClick={() => setIsAddGoldOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Gold</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goldAssets.map((gold) => {
              const currentVal = gold.weight_grams * 7450;
              const purchaseVal = gold.weight_grams * gold.purchase_price_per_gram;
              const profit = currentVal - purchaseVal;

              return (
                <div
                  key={gold.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {gold.name}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          {gold.type === 'sgb' ? 'RBI SGB (2.5% p.a.)' : '24K Physical Bullion'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteGoldAsset(gold.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Weight</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{gold.weight_grams} grams</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Bought At</span>
                      <strong className="text-slate-700 dark:text-slate-300">{formatINR(gold.purchase_price_per_gram)}/g</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Current Value</span>
                      <strong className="text-amber-600 dark:text-amber-300 font-extrabold rupee-num">
                        {formatINR(currentVal)}
                      </strong>
                    </div>
                  </div>

                  {gold.notes && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                      {gold.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEditAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => {
          setIsAddAccountOpen(false);
          setEditingAccount(null);
        }}
        editAccount={editingAccount}
      />

      <TransferAccountModal
        isOpen={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          setTransferTargetCardId(undefined);
        }}
        defaultToId={transferTargetCardId}
      />

      <AddGoldAssetModal
        isOpen={isAddGoldOpen}
        onClose={() => setIsAddGoldOpen(false)}
      />
    </div>
  );
};
