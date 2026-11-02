import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Fuel,
  Zap,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Tv,
  Sparkles,
  CreditCard,
  TrendingUp,
  Plane,
  MoreHorizontal,
  Wallet,
  Briefcase,
  Gift,
  Building,
  Coffee,
  HelpCircle,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Fuel,
  Zap,
  ShoppingBag,
  HeartPulse,
  GraduationCap,
  Tv,
  Sparkles,
  CreditCard,
  TrendingUp,
  Plane,
  MoreHorizontal,
  Wallet,
  Briefcase,
  Gift,
  Building,
  Coffee,
};

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
  backgroundColor?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  color,
  backgroundColor,
  size,
}) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;

  if (backgroundColor) {
    return (
      <div
        className="flex items-center justify-center rounded-xl transition-transform"
        style={{
          backgroundColor: backgroundColor + '20', // 20 hex is ~12% opacity
          width: size ? `${size * 2}px` : '40px',
          height: size ? `${size * 2}px` : '40px',
        }}
      >
        <IconComponent
          className={className}
          style={{ color: color || backgroundColor }}
          size={size}
        />
      </div>
    );
  }

  return <IconComponent className={className} style={{ color }} size={size} />;
};
