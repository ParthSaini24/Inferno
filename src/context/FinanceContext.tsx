import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Transaction, Category, PaymentMode, TransactionType, ParsedSmsResult } from '@/types';
import { INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from '@/lib/mockData';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  isAddTxOpen: boolean;
  setIsAddTxOpen: (open: boolean) => void;
  isSmartPasteOpen: boolean;
  setIsSmartPasteOpen: (open: boolean) => void;
  isCsvImportOpen: boolean;
  setIsCsvImportOpen: (open: boolean) => void;
  receiptModalUrl: string | null;
  setReceiptModalUrl: (url: string | null) => void;
  prefilledTxData: Partial<Transaction> | null;
  setPrefilledTxData: (data: Partial<Transaction> | null) => void;
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  batchAddTransactions: (newTxs: Omit<Transaction, 'id' | 'created_at' | 'user_id'>[]) => Promise<number>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  resetToDemoData: () => void;

  // Computed Metrics
  stats: {
    totalIncomeThisMonth: number;
    totalExpenseThisMonth: number;
    remainingThisMonth: number;
    savingsRatePercent: number;
    transactionCount: number;
  };
  recentTransactions: Transaction[];
  getCategoryById: (id: string) => Category | undefined;
  getCategoryByName: (name: string) => Category | undefined;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, household } = useAuth();

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('paisapilot_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('paisapilot_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  // Modal dialog states
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isSmartPasteOpen, setIsSmartPasteOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);
  const [prefilledTxData, setPrefilledTxData] = useState<Partial<Transaction> | null>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('paisapilot_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('paisapilot_categories', JSON.stringify(categories));
  }, [categories]);

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);
  const getCategoryByName = (name: string) =>
    categories.find((c) => c.name.toLowerCase() === name.toLowerCase());

  // Add a new transaction
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_id: user?.id || 'usr-pilot-01',
      household_id: txData.is_shared ? household?.id || 'hh-01' : null,
      created_at: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    toast.success(
      `${newTx.type === 'expense' ? 'Spent' : 'Received'} ₹${newTx.amount.toLocaleString('en-IN')} at ${newTx.merchant}`,
      {
        description: `${getCategoryById(newTx.category_id)?.name || 'General'} via ${newTx.payment_mode.toUpperCase()}`,
      }
    );
    return newTx;
  };

  // Update existing transaction
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    toast.success('Transaction updated');
  };

  // Delete transaction with UNDO toast
  const deleteTransaction = async (id: string) => {
    const deletedTx = transactions.find((t) => t.id === id);
    if (!deletedTx) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    toast('Transaction removed', {
      description: `₹${deletedTx.amount.toLocaleString('en-IN')} - ${deletedTx.merchant}`,
      action: {
        label: 'Undo',
        onClick: () => {
          setTransactions((prev) => [deletedTx, ...prev]);
          toast.success('Transaction restored');
        },
      },
    });
  };

  // Batch import transactions (e.g. from bank statement CSV)
  const batchAddTransactions = async (
    newTxs: Omit<Transaction, 'id' | 'created_at' | 'user_id'>[]
  ) => {
    const timestamp = Date.now();
    const created: Transaction[] = newTxs.map((t, idx) => ({
      ...t,
      id: `tx-csv-${timestamp}-${idx}`,
      user_id: user?.id || 'usr-pilot-01',
      household_id: t.is_shared ? household?.id || 'hh-01' : null,
      created_at: new Date(Date.now() - idx * 1000).toISOString(),
    }));

    setTransactions((prev) => [...created, ...prev]);
    toast.success(`Imported ${created.length} bank transactions successfully!`);
    return created.length;
  };

  // Add custom category
  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    toast.success(`Category "${newCat.name}" added`);
    return newCat;
  };

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(INITIAL_CATEGORIES);
    toast.info('Restored realistic demo Indian transactions & categories');
  };

  // Compute Current Month Stats
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    let totalExpense = 0;
    let totalIncome = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      // Check if transaction is in the current month & year
      if (
        txDate.getFullYear() === currentYear &&
        txDate.getMonth() === currentMonth
      ) {
        if (tx.type === 'expense') {
          totalExpense += Number(tx.amount);
        } else if (tx.type === 'income') {
          totalIncome += Number(tx.amount);
        }
      }
    });

    const remaining = totalIncome - totalExpense;
    const savingsRate =
      totalIncome > 0
        ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
        : 0;

    return {
      totalIncomeThisMonth: totalIncome,
      totalExpenseThisMonth: totalExpense,
      remainingThisMonth: remaining,
      savingsRatePercent: savingsRate,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  // Top 5 recent transactions sorted by date descending
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 5);
  }, [transactions]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        categories,
        isAddTxOpen,
        setIsAddTxOpen,
        isSmartPasteOpen,
        setIsSmartPasteOpen,
        isCsvImportOpen,
        setIsCsvImportOpen,
        receiptModalUrl,
        setReceiptModalUrl,
        prefilledTxData,
        setPrefilledTxData,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        batchAddTransactions,
        addCategory,
        resetToDemoData,
        stats,
        recentTransactions,
        getCategoryById,
        getCategoryByName,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
