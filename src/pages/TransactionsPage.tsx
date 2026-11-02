import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { Transaction, PaymentMode, TransactionType } from '@/types';
import { formatINR, formatDateIndian, formatRelativeDate } from '@/utils/formatters';
import { CategoryIcon } from '@/components/common/CategoryIcon';
import { PaymentModeBadge } from '@/components/common/PaymentModeBadge';
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal';
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  FileSpreadsheet,
  Receipt,
  Trash2,
  Edit2,
  Calendar,
  X,
  Users,
  Tag,
  ArrowUpDown,
  Smartphone,
  Banknote,
  CreditCard,
  Landmark,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    categories,
    getCategoryById,
    setIsAddTxOpen,
    setIsSmartPasteOpen,
    setIsCsvImportOpen,
    setReceiptModalUrl,
    setPrefilledTxData,
    deleteTransaction,
  } = useFinance();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedMode, setSelectedMode] = useState<'all' | PaymentMode>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    transactions.forEach((tx) => {
      tx.tags?.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type filter
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // Payment mode filter
      if (selectedMode !== 'all' && tx.payment_mode !== selectedMode) return false;

      // Category filter
      if (selectedCategoryId !== 'all' && tx.category_id !== selectedCategoryId)
        return false;

      // Tag filter
      if (selectedTag !== 'all' && (!tx.tags || !tx.tags.includes(selectedTag)))
        return false;

      // Search query filter (merchant, note, amount, tags)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesMerchant = tx.merchant.toLowerCase().includes(q);
        const matchesNote = tx.note?.toLowerCase().includes(q) || false;
        const matchesAmount = String(tx.amount).includes(q);
        const matchesTags = tx.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        const catName = getCategoryById(tx.category_id)?.name.toLowerCase() || '';
        const matchesCategory = catName.includes(q);

        if (
          !matchesMerchant &&
          !matchesNote &&
          !matchesAmount &&
          !matchesTags &&
          !matchesCategory
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    transactions,
    selectedType,
    selectedMode,
    selectedCategoryId,
    selectedTag,
    searchQuery,
    getCategoryById,
  ]);

  // Group transactions by date descending
  const groupedByDate = useMemo(() => {
    const groups: Record<string, { date: string; items: Transaction[]; dayTotal: number }> =
      {};

    const sorted = [...filteredTransactions].sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (diff !== 0) return diff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    sorted.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = { date: tx.date, items: [], dayTotal: 0 };
      }
      groups[tx.date].items.push(tx);
      if (tx.type === 'expense') {
        groups[tx.date].dayTotal += Number(tx.amount);
      }
    });

    return Object.values(groups);
  }, [filteredTransactions]);

  const handleOpenAdd = () => {
    setPrefilledTxData(null);
    setIsAddTxOpen(true);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedMode('all');
    setSelectedCategoryId('all');
    setSelectedTag('all');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedType !== 'all' ||
    selectedMode !== 'all' ||
    selectedCategoryId !== 'all' ||
    selectedTag !== 'all';

  return (
    <div className="space-y-6 pb-24 sm:pb-12 animate-in fade-in duration-300">
      {/* Top Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {filteredTransactions.length} of {transactions.length} records shown
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsSmartPasteOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200/80 dark:border-teal-800/60 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>SMS Paste</span>
          </button>

          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search merchant, tag, amount, note... (e.g. Swiggy, UPI, ₹1450)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Expense/Income filter */}
          <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            {(['all', 'expense', 'income'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition ${
                  selectedType === t
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Payment Mode Pills */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Modes' },
              { id: 'upi', label: 'UPI' },
              { id: 'cash', label: 'Cash' },
              { id: 'card', label: 'Card' },
              { id: 'netbanking', label: 'NetBank' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id as any)}
                className={`px-3 py-1.5 rounded-xl font-medium border transition ${
                  selectedMode === m.id
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Tag Dropdown */}
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:outline-none"
            >
              <option value="all">All Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-2.5 py-1 text-slate-400 hover:text-rose-500 font-medium transition ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grouped Transactions List */}
      <div className="space-y-4">
        {groupedByDate.length > 0 ? (
          groupedByDate.map((group) => (
            <div
              key={group.date}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden"
            >
              {/* Group Date Header with subtotal */}
              <div className="flex items-center justify-between px-6 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="font-bold text-slate-900 dark:text-slate-200">
                    {formatRelativeDate(group.date)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    ({formatDateIndian(group.date)})
                  </span>
                </div>

                {group.dayTotal > 0 && (
                  <span>
                    Spent: <span className="font-bold rupee-num text-slate-700 dark:text-slate-300">{formatINR(group.dayTotal)}</span>
                  </span>
                )}
              </div>

              {/* Items in this date group */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {group.items.map((tx) => {
                  const cat = getCategoryById(tx.category_id);
                  const isExpense = tx.type === 'expense';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => setEditingTransaction(tx)}
                      className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <CategoryIcon
                          name={cat?.icon || 'HelpCircle'}
                          backgroundColor={cat?.color || '#0d9488'}
                          color={cat?.color || '#0d9488'}
                          size={20}
                        />

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {tx.merchant}
                            </p>
                            {tx.is_shared && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>Shared</span>
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
                                title="Click to view attached receipt"
                              >
                                <Receipt className="w-3 h-3" />
                                <span>Receipt</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                            <span className="font-medium text-slate-600 dark:text-slate-400">
                              {cat?.name || 'Expense'}
                            </span>
                            <span>•</span>
                            <PaymentModeBadge mode={tx.payment_mode} size="sm" />
                            {tx.note && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[140px] text-slate-400 italic">
                                  {tx.note}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Tags */}
                          {tx.tags && tx.tags.length > 0 && (
                            <div className="flex items-center gap-1 pt-1">
                              {tx.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Amount & Quick Hover Actions */}
                      <div className="flex items-center gap-3">
                        <div className="text-right shrink-0">
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
                        </div>

                        {/* Action buttons (Edit & Delete with Undo) */}
                        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTransaction(tx);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTransaction(tx.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No transactions found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                We couldn&apos;t find any records matching your active filters. Try adjusting the
                search or reset your filters.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Clear Filters
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-sm"
              >
                Add Transaction
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
      />
    </div>
  );
};
