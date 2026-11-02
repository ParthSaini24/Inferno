import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ArrowLeftRight, PieChart, Users2, MoreHorizontal } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: PieChart },
  { to: '/household', label: 'Household', icon: Users2 },
  { to: '/more', label: 'More', icon: MoreHorizontal },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-14 py-1 gap-1 text-[11px] font-semibold transition-all select-none ${
                  isActive
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-teal-50 dark:bg-teal-950/60' : ''}`}>
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-teal-600 dark:bg-teal-400 -mt-0.5"></span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
