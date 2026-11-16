import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function TransactionRow({
  icon,
  label,
  description,
  date,
  amount,
  type,
  wallet,
  negative,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  wallet: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
        type === 'income' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-red-500/15 text-red-500'
      )}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <div className="hidden sm:block text-xs text-muted-foreground w-24 shrink-0">{date}</div>
      <div className="hidden sm:block text-xs text-muted-foreground w-20 shrink-0">{wallet}</div>
      <div className={cn(
        'text-sm font-semibold flex-shrink-0',
        negative ? 'text-red-500' : 'text-emerald-500'
      )}>
        {negative ? '-' : '+'}{amount.toLocaleString('id-ID')}
      </div>
    </div>
  );
}
