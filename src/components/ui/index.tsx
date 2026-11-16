import * as ReactNS from 'react';
import { twMerge } from 'tailwind-merge';
import { cn } from '@/lib/utils';

type InputProps = ReactNS.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = ReactNS.TextareaHTMLAttributes<HTMLTextAreaElement>;
type LabelProps = ReactNS.LabelHTMLAttributes<HTMLLabelElement>;
type CardProps = ReactNS.HTMLAttributes<HTMLDivElement>;

export function Button(props: any) {
  const variant = props.variant ?? 'default';
  const size = props.size ?? 'default';
  return (
    <button
      className={'test-button'}
      {...props}
    />
  );
}

export function Input(props: ReactNS.InputHTMLAttributes<HTMLInputElement>) {
  const { className, type, ...restProps } = props;
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...restProps}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('text-sm font-medium text-foreground', className)}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>
  );
}

export function CardTitle({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <h3 className={cn('font-heading text-xl font-semibold leading-[34px]', className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>;
}

export function CardContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>;
}

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'neutral' }) {
  const tones = {
    default: 'bg-muted/15 text-muted-foreground',
    primary: 'bg-primary/10 text-primary-foreground',
    success: 'bg-emerald-500/10 text-emerald-500',
    warning: 'bg-amber-500/10 text-amber-500',
    destructive: 'bg-red-500/10 text-red-500',
    neutral: 'bg-muted/15 text-muted-foreground',
  };
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`w-full overflow-hidden rounded-full ${className ?? ''}`}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Switch({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', className)}>
      <input
        type="checkbox"
        className="sr-only peer"
        {...props}
      />
      <span className="peer h-5 w-5 rounded-full bg-muted shadow inner rounded-full transition-transform peer-checked:translate-x-5 peer-focus:outline peer-focus:outline-2 peer-focus:outline-offset-2 peer-focus:outline-primary" />
    </label>
  );
}

export function Dialog({ ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} />;
}

export function Separator({ className, ...props }: React.ComponentProps<'hr'>) {
  return (
    <hr
      className={cn('border-border/50 h-0.5 bg-border', className)}
      {...props}
    />
  );
}
