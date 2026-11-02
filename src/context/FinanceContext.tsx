import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  Category,
  PaymentMode,
  TransactionType,
  ParsedSmsResult,
  Budget,
  HouseholdMember,
  Settlement,
  Goal,
  RecurringItem,
  ChitFund,
  Account,
  GoldAsset,
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_HOUSEHOLD_MEMBERS,
  INITIAL_SETTLEMENTS,
  INITIAL_GOALS,
  INITIAL_RECURRING,
  INITIAL_CHIT_FUNDS,
  INITIAL_ACCOUNTS,
  INITIAL_GOLD_ASSETS,
} from '@/lib/mockData';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  householdMembers: HouseholdMember[];
  settlements: Settlement[];
  goals: Goal[];
  recurringItems: RecurringItem[];
  chitFunds: ChitFund[];
  accounts: Account[];
  goldAssets: GoldAsset[];

  // Modal dialog states
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

  // Accounts CRUD
  addAccount: (account: Omit<Account, 'id'>) => Promise<Account>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  transferBetweenAccounts: (fromId: string, toId: string, amount: number, note?: string) => Promise<void>;

  // Gold Assets
  addGoldAsset: (asset: Omit<GoldAsset, 'id'>) => Promise<GoldAsset>;
  deleteGoldAsset: (id: string) => Promise<void>;

  // Transactions CRUD
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  batchAddTransactions: (newTxs: Omit<Transaction, 'id' | 'created_at' | 'user_id'>[]) => Promise<number>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;

  // Budgets CRUD
  addBudget: (budget: Omit<Budget, 'id' | 'user_id'>) => Promise<Budget>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  // Goals CRUD
  addGoal: (goal: Omit<Goal, 'id' | 'user_id'>) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;

  // Recurring & EMIs CRUD
  addRecurringItem: (item: Omit<RecurringItem, 'id' | 'user_id'>) => Promise<RecurringItem>;
  updateRecurringItem: (id: string, updates: Partial<RecurringItem>) => Promise<void>;
  deleteRecurringItem: (id: string) => Promise<void>;
  markRecurringAsPaid: (item: RecurringItem) => Promise<void>;

  // Chit Funds CRUD
  addChitFund: (chit: Omit<ChitFund, 'id' | 'user_id'>) => Promise<ChitFund>;
  updateChitFund: (id: string, updates: Partial<ChitFund>) => Promise<void>;
  payChitInstallment: (chitId: string) => Promise<void>;
  claimChitFund: (chitId: string, payoutAmount: number) => Promise<void>;

  // Household & Settlements
  addHouseholdMember: (name: string, sharePercent: number) => Promise<HouseholdMember>;
  removeHouseholdMember: (id: string) => Promise<void>;
  addSettlement: (settlement: Omit<Settlement, 'id' | 'household_id' | 'created_at'>) => Promise<Settlement>;

  resetToDemoData: () => void;

  // Computed Metrics
  stats: {
    totalIncomeThisMonth: number;
    totalExpenseThisMonth: number;
    remainingThisMonth: number;
    savingsRatePercent: number;
    transactionCount: number;
    totalSharedSpendThisMonth: number;
    totalUpcomingBills: number;
  };
  recentTransactions: Transaction[];
  getCategoryById: (id: string) => Category | undefined;
  getCategoryByName: (name: string) => Category | undefined;
  getBudgetForCategory: (catId: string, month?: string) => Budget | undefined;
  getSpentForCategoryMonth: (catId: string, month?: string) => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, household } = useAuth();

  // Core collections persisted to localStorage
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('paisapilot_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('paisapilot_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('paisapilot_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>(() => {
    const saved = localStorage.getItem('paisapilot_members');
    return saved ? JSON.parse(saved) : INITIAL_HOUSEHOLD_MEMBERS;
  });

  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    const saved = localStorage.getItem('paisapilot_settlements');
    return saved ? JSON.parse(saved) : INITIAL_SETTLEMENTS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('paisapilot_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [recurringItems, setRecurringItems] = useState<RecurringItem[]>(() => {
    const saved = localStorage.getItem('paisapilot_recurring');
    return saved ? JSON.parse(saved) : INITIAL_RECURRING;
  });

  const [chitFunds, setChitFunds] = useState<ChitFund[]>(() => {
    const saved = localStorage.getItem('paisapilot_chits');
    return saved ? JSON.parse(saved) : INITIAL_CHIT_FUNDS;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('paisapilot_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [goldAssets, setGoldAssets] = useState<GoldAsset[]>(() => {
    const saved = localStorage.getItem('paisapilot_gold');
    return saved ? JSON.parse(saved) : INITIAL_GOLD_ASSETS;
  });

  // Modal dialog states
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isSmartPasteOpen, setIsSmartPasteOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);
  const [prefilledTxData, setPrefilledTxData] = useState<Partial<Transaction> | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('paisapilot_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('paisapilot_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('paisapilot_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('paisapilot_members', JSON.stringify(householdMembers));
  }, [householdMembers]);

  useEffect(() => {
    localStorage.setItem('paisapilot_settlements', JSON.stringify(settlements));
  }, [settlements]);

  useEffect(() => {
    localStorage.setItem('paisapilot_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('paisapilot_recurring', JSON.stringify(recurringItems));
  }, [recurringItems]);

  useEffect(() => {
    localStorage.setItem('paisapilot_chits', JSON.stringify(chitFunds));
  }, [chitFunds]);

  useEffect(() => {
    localStorage.setItem('paisapilot_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('paisapilot_gold', JSON.stringify(goldAssets));
  }, [goldAssets]);

  const getCategoryById = (id: string) => categories.find((c) => c.id === id);
  const getCategoryByName = (name: string) =>
    categories.find((c) => c.name.toLowerCase() === name.toLowerCase());

  // Transactions CRUD
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

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    toast.success('Transaction updated');
  };

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

  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    toast.success(`Category "${newCat.name}" added`);
    return newCat;
  };

  // Budgets CRUD
  const addBudget = async (bData: Omit<Budget, 'id' | 'user_id'>) => {
    const newBudget: Budget = {
      ...bData,
      id: `b-${Date.now()}`,
      user_id: user?.id || 'usr-pilot-01',
      created_at: new Date().toISOString(),
    };
    // Replace if exists for same category and month
    setBudgets((prev) => [
      ...prev.filter(
        (b) => !(b.category_id === newBudget.category_id && b.month === newBudget.month)
      ),
      newBudget,
    ]);
    toast.success('Budget envelope created');
    return newBudget;
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    toast.success('Budget updated');
  };

  const deleteBudget = async (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    toast.info('Budget removed');
  };

  const getBudgetForCategory = (catId: string, month = '2026-11') => {
    return budgets.find((b) => b.category_id === catId && b.month === month);
  };

  const getSpentForCategoryMonth = (catId: string, month = '2026-11') => {
    return transactions
      .filter((t) => {
        if (t.type !== 'expense' || t.category_id !== catId) return false;
        return t.date.startsWith(month);
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  // Goals CRUD
  const addGoal = async (gData: Omit<Goal, 'id' | 'user_id'>) => {
    const newGoal: Goal = {
      ...gData,
      id: `goal-${Date.now()}`,
      user_id: user?.id || 'usr-pilot-01',
      created_at: new Date().toISOString(),
    };
    setGoals((prev) => [newGoal, ...prev]);
    toast.success(`Savings goal "${newGoal.name}" created!`);
    return newGoal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    toast.success('Goal updated');
  };

  const deleteGoal = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.info('Goal deleted');
  };

  const contributeToGoal = async (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newSaved = Math.max(0, g.saved_amount + amount);
          return { ...g, saved_amount: newSaved };
        }
        return g;
      })
    );
    toast.success(`Added ₹${amount.toLocaleString('en-IN')} to savings goal!`);
  };

  // Recurring & EMIs CRUD
  const addRecurringItem = async (rData: Omit<RecurringItem, 'id' | 'user_id'>) => {
    const newItem: RecurringItem = {
      ...rData,
      id: `rec-${Date.now()}`,
      user_id: user?.id || 'usr-pilot-01',
      created_at: new Date().toISOString(),
    };
    setRecurringItems((prev) => [...prev, newItem]);
    toast.success(`Recurring item "${newItem.name}" scheduled`);
    return newItem;
  };

  const updateRecurringItem = async (id: string, updates: Partial<RecurringItem>) => {
    setRecurringItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    toast.success('Recurring item updated');
  };

  const deleteRecurringItem = async (id: string) => {
    setRecurringItems((prev) => prev.filter((r) => r.id !== id));
    toast.info('Recurring reminder deleted');
  };

  // Mark recurring item as paid: logs transaction & updates next due date
  const markRecurringAsPaid = async (item: RecurringItem) => {
    // 1. Create a transaction automatically
    const today = new Date().toISOString().split('T')[0];
    await addTransaction({
      amount: item.amount,
      type: 'expense',
      category_id: item.category_id || categories[0]?.id || 'cat-1',
      payment_mode: item.payment_mode || 'netbanking',
      merchant: item.name,
      note: `Paid recurring ${item.type.toUpperCase()}`,
      tags: ['recurring', item.type],
      date: today,
      is_shared: Boolean(item.household_id),
    });

    // 2. Bump next due date by 1 month
    const nextDate = new Date(item.next_due_date);
    nextDate.setMonth(nextDate.getMonth() + 1);
    const updatedDateStr = nextDate.toISOString().split('T')[0];

    setRecurringItems((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, next_due_date: updatedDateStr } : r))
    );
    toast.success(`Marked "${item.name}" as paid and advanced due date.`);
  };

  // Chit Funds CRUD
  const addChitFund = async (cData: Omit<ChitFund, 'id' | 'user_id'>) => {
    const newChit: ChitFund = {
      ...cData,
      id: `chit-${Date.now()}`,
      user_id: user?.id || 'usr-pilot-01',
      created_at: new Date().toISOString(),
    };
    setChitFunds((prev) => [newChit, ...prev]);
    toast.success(`Chit fund "${newChit.name}" enrolled`);
    return newChit;
  };

  const updateChitFund = async (id: string, updates: Partial<ChitFund>) => {
    setChitFunds((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    toast.success('Chit fund updated');
  };

  const payChitInstallment = async (chitId: string) => {
    const chit = chitFunds.find((c) => c.id === chitId);
    if (!chit) return;

    // Log transaction
    const today = new Date().toISOString().split('T')[0];
    const cat = getCategoryByName('Investments & SIP') || categories[0];
    await addTransaction({
      amount: chit.monthly_contribution,
      type: 'expense',
      category_id: cat?.id || 'cat-13',
      payment_mode: 'upi',
      merchant: chit.name,
      note: `Month ${chit.current_month + 1} installment for ${chit.name}`,
      tags: ['chit-fund', 'kameti'],
      date: today,
      is_shared: false,
    });

    // Advance month
    setChitFunds((prev) =>
      prev.map((c) => {
        if (c.id === chitId) {
          const nextMonth = c.current_month + 1;
          const isDone = nextMonth >= c.total_months;
          return {
            ...c,
            current_month: nextMonth,
            status: isDone ? 'completed' : c.status,
          };
        }
        return c;
      })
    );
    toast.success(`Installment logged for ${chit.name}`);
  };

  const claimChitFund = async (chitId: string, payoutAmount: number) => {
    const chit = chitFunds.find((c) => c.id === chitId);
    if (!chit) return;

    // Add income transaction for the payout
    const today = new Date().toISOString().split('T')[0];
    const incomeCat = getCategoryByName('Investments Returns') || categories[0];
    await addTransaction({
      amount: payoutAmount,
      type: 'income',
      category_id: incomeCat?.id || 'cat-18',
      payment_mode: 'netbanking',
      merchant: `${chit.name} - Auction Payout`,
      note: `Claimed Chit Fund payout of ₹${payoutAmount.toLocaleString('en-IN')}`,
      tags: ['chit-fund', 'payout'],
      date: today,
      is_shared: false,
    });

    setChitFunds((prev) =>
      prev.map((c) =>
        c.id === chitId
          ? {
              ...c,
              status: 'claimed',
              taken_in_month: c.current_month,
              payout_received: payoutAmount,
            }
          : c
      )
    );
    toast.success(`Chit payout received & logged as income!`);
  };

  // Household & Settlements
  const addHouseholdMember = async (name: string, sharePercent: number) => {
    const newMember: HouseholdMember = {
      id: `hm-${Date.now()}`,
      household_id: household?.id || 'hh-01',
      user_id: `usr-gen-${Date.now()}`,
      name,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role: 'member',
      share_percent: sharePercent,
      created_at: new Date().toISOString(),
    };
    setHouseholdMembers((prev) => [...prev, newMember]);
    toast.success(`${name} added to household`);
    return newMember;
  };

  const removeHouseholdMember = async (id: string) => {
    setHouseholdMembers((prev) => prev.filter((m) => m.id !== id));
    toast.info('Member removed');
  };

  const addSettlement = async (
    sData: Omit<Settlement, 'id' | 'household_id' | 'created_at'>
  ) => {
    const newSettlement: Settlement = {
      ...sData,
      id: `stl-${Date.now()}`,
      household_id: household?.id || 'hh-01',
      created_at: new Date().toISOString(),
    };
    setSettlements((prev) => [newSettlement, ...prev]);
    toast.success(
      `Settlement of ₹${sData.amount.toLocaleString('en-IN')} recorded from ${sData.from_name} to ${sData.to_name}`
    );
    return newSettlement;
  };

  // Accounts CRUD
  const addAccount = async (accData: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...accData,
      id: `acc-${Date.now()}`,
      user_id: user?.id || 'usr-pilot-01',
      created_at: new Date().toISOString(),
    };
    setAccounts((prev) => [newAccount, ...prev]);
    toast.success(`Account "${accData.name}" added`);
    return newAccount;
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
    toast.success('Account updated');
  };

  const deleteAccount = async (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    toast.info('Account removed');
  };

  const transferBetweenAccounts = async (
    fromId: string,
    toId: string,
    amount: number,
    note?: string
  ) => {
    if (amount <= 0) {
      toast.error('Please enter a valid transfer amount');
      return;
    }
    const fromAcc = accounts.find((a) => a.id === fromId);
    const toAcc = accounts.find((a) => a.id === toId);
    if (!fromAcc || !toAcc) {
      toast.error('Invalid source or destination account');
      return;
    }

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === fromId) {
          return { ...acc, balance: acc.balance - amount };
        }
        if (acc.id === toId) {
          return {
            ...acc,
            balance: acc.type === 'credit_card' ? Math.max(0, acc.balance - amount) : acc.balance + amount,
          };
        }
        return acc;
      })
    );

    toast.success(
      `Transferred ₹${amount.toLocaleString('en-IN')} from ${fromAcc.name} to ${toAcc.name}`
    );
  };

  // Gold Assets
  const addGoldAsset = async (assetData: Omit<GoldAsset, 'id'>) => {
    const newGold: GoldAsset = {
      ...assetData,
      id: `gold-${Date.now()}`,
      user_id: user?.id || 'usr-pilot-01',
    };
    setGoldAssets((prev) => [newGold, ...prev]);
    toast.success(`Gold holding "${assetData.name}" added`);
    return newGold;
  };

  const deleteGoldAsset = async (id: string) => {
    setGoldAssets((prev) => prev.filter((g) => g.id !== id));
    toast.info('Gold asset removed');
  };

  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setCategories(INITIAL_CATEGORIES);
    setBudgets(INITIAL_BUDGETS);
    setHouseholdMembers(INITIAL_HOUSEHOLD_MEMBERS);
    setSettlements(INITIAL_SETTLEMENTS);
    setGoals(INITIAL_GOALS);
    setRecurringItems(INITIAL_RECURRING);
    setChitFunds(INITIAL_CHIT_FUNDS);
    setAccounts(INITIAL_ACCOUNTS);
    setGoldAssets(INITIAL_GOLD_ASSETS);
    toast.info('Restored realistic demo Indian transactions & data');
  };

  // Computed Metrics
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let totalExpense = 0;
    let totalIncome = 0;
    let totalShared = 0;

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (
        txDate.getFullYear() === currentYear &&
        txDate.getMonth() === currentMonth
      ) {
        if (tx.type === 'expense') {
          totalExpense += Number(tx.amount);
          if (tx.is_shared) totalShared += Number(tx.amount);
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

    const upcomingBills = recurringItems
      .filter((r) => r.active)
      .reduce((sum, r) => sum + Number(r.amount), 0);

    return {
      totalIncomeThisMonth: totalIncome,
      totalExpenseThisMonth: totalExpense,
      remainingThisMonth: remaining,
      savingsRatePercent: savingsRate,
      transactionCount: transactions.length,
      totalSharedSpendThisMonth: totalShared,
      totalUpcomingBills: upcomingBills,
    };
  }, [transactions, recurringItems]);

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
        budgets,
        householdMembers,
        settlements,
        goals,
        recurringItems,
        chitFunds,
        accounts,
        goldAssets,
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
        addAccount,
        updateAccount,
        deleteAccount,
        transferBetweenAccounts,
        addGoldAsset,
        deleteGoldAsset,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        batchAddTransactions,
        addCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        addRecurringItem,
        updateRecurringItem,
        deleteRecurringItem,
        markRecurringAsPaid,
        addChitFund,
        updateChitFund,
        payChitInstallment,
        claimChitFund,
        addHouseholdMember,
        removeHouseholdMember,
        addSettlement,
        resetToDemoData,
        stats,
        recentTransactions,
        getCategoryById,
        getCategoryByName,
        getBudgetForCategory,
        getSpentForCategoryMonth,
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
