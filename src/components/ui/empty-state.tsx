import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-muted/20', className)} />;
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted/15 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="font-heading text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
