import { type ReactNode } from 'react';

export function MetricCard({
  label,
  value,
  sublabel,
  icon,
  iconBg,
  action,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon?: ReactNode;
  iconBg?: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 card-hover">
      {action}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="font-heading text-2xl font-semibold tracking-tight mt-1 text-balance">{value}</p>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg || 'bg-primary/10 text-primary'}`}>
            {icon}
          </div>
        )}
      </div>
      {sublabel && <p className="text-xs text-muted-foreground mt-3">{sublabel}</p>}
    </div>
  );
}
