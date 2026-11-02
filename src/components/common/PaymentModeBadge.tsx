import React from 'react';
import { PaymentMode } from '@/types';
import { Smartphone, Banknote, CreditCard, Landmark } from 'lucide-react';

interface PaymentModeBadgeProps {
  mode: PaymentMode;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const PaymentModeBadge: React.FC<PaymentModeBadgeProps> = ({
  mode,
  showIcon = true,
  className = '',
  size = 'sm',
}) => {
  const configs: Record<
    PaymentMode,
    { label: string; icon: React.ReactNode; bg: string; text: string; border: string }
  > = {
    upi: {
      label: 'UPI',
      icon: <Smartphone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200/80 dark:border-emerald-800/50',
    },
    cash: {
      label: 'Cash',
      icon: <Banknote className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200/80 dark:border-amber-800/50',
    },
    card: {
      label: 'Card',
      icon: <CreditCard className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50 dark:bg-indigo-950/60',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200/80 dark:border-indigo-800/50',
    },
    netbanking: {
      label: 'NetBanking',
      icon: <Landmark className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />,
      bg: 'bg-cyan-50 dark:bg-cyan-950/60',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-200/80 dark:border-cyan-800/50',
    },
  };

  const current = configs[mode] || configs.upi;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${padding} ${className}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};
