import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'fiscal' | 'non-fiscal' | 'card-payment' | 'wire-transfer' | 'associates';
}

const variantStyles = {
  default: 'bg-primary/10 text-primary',
  fiscal: 'bg-fiscal-light text-fiscal',
  'non-fiscal': 'bg-non-fiscal-light text-non-fiscal',
  'card-payment': 'bg-card-payment-light text-card-payment',
  'wire-transfer': 'bg-wire-transfer-light text-wire-transfer',
  associates: 'bg-associates-light text-associates',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs lg:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-lg lg:text-2xl font-bold truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        <div className={cn('w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-2', variantStyles[variant])}>
          <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 lg:mt-3 flex items-center gap-1">
          <span className={cn(
            'text-xs font-medium',
            trend.isPositive ? 'text-success' : 'text-destructive'
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">od prošle sedmice</span>
        </div>
      )}
    </div>
  );
}
