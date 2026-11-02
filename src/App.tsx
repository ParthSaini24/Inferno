import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { FinanceProvider, useFinance } from '@/context/FinanceContext';
import { Header } from '@/components/navigation/Header';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { FloatingActionButton } from '@/components/navigation/FloatingActionButton';
import { DashboardPage } from '@/pages/DashboardPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { BudgetsPage } from '@/pages/BudgetsPage';
import { HouseholdPage } from '@/pages/HouseholdPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { RecurringPage } from '@/pages/RecurringPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { AccountsPage } from '@/pages/AccountsPage';
import { MorePage } from '@/pages/MorePage';
import { AuthPage } from '@/pages/AuthPage';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { SmartPasteModal } from '@/components/transactions/SmartPasteModal';
import { CsvImportModal } from '@/components/transactions/CsvImportModal';
import { ReceiptModal } from '@/components/transactions/ReceiptModal';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { Toaster } from 'sonner';

const AppContent: React.FC<{ darkMode: boolean; setDarkMode: (v: boolean) => void }> = ({
  darkMode,
  setDarkMode,
}) => {
  const { user, isOnboarded } = useAuth();
  const {
    isAddTxOpen,
    setIsAddTxOpen,
    isSmartPasteOpen,
    setIsSmartPasteOpen,
    isCsvImportOpen,
    setIsCsvImportOpen,
    receiptModalUrl,
    setReceiptModalUrl,
  } = useFinance();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    if (user && !isOnboarded) {
      setIsOnboardingOpen(true);
    }
  }, [user, isOnboarded]);

  // If user is not authenticated or logged out, show Login / Signup page
  if (!user) {
    return (
      <>
        <AuthPage darkMode={darkMode} setDarkMode={setDarkMode} />
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme={darkMode ? 'dark' : 'light'}
          toastOptions={{
            style: {
              borderRadius: '1.25rem',
              padding: '0.85rem 1.15rem',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            },
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col sm:flex-row font-sans transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/household" element={<HouseholdPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/recurring" element={<RecurringPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route
              path="/more"
              element={<MorePage darkMode={darkMode} setDarkMode={setDarkMode} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Navigation */}
      <BottomNav />

      {/* One-Tap Floating "+" Button on Every Main Screen */}
      <FloatingActionButton />

      {/* Modals & Sheets */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
      />

      <SmartPasteModal
        isOpen={isSmartPasteOpen}
        onClose={() => setIsSmartPasteOpen(false)}
      />

      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
      />

      <ReceiptModal
        url={receiptModalUrl}
        onClose={() => setReceiptModalUrl(null)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Notifications Toast */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme={darkMode ? 'dark' : 'light'}
        toastOptions={{
          style: {
            borderRadius: '1.25rem',
            padding: '0.85rem 1.15rem',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          },
        }}
      />
    </div>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('paisapilot_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('paisapilot_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('paisapilot_theme', 'light');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <FinanceProvider>
          <AppContent darkMode={darkMode} setDarkMode={setDarkMode} />
        </FinanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
