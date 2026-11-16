import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-xl',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;

  const handleEscape = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onKeyDown={handleEscape}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl border border-border bg-card shadow-2xl fade-scale`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">{footer}</div>}
      </div>
    </div>
  );
}

export function DropdownMenu({
  children,
  align = 'right',
  onOpenChange,
}: {
  children: ReactNode;
  align?: 'left' | 'right';
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const isOpen = open || onOpenChange !== undefined;

  const itemClasses =
    'flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer';

  return (
    <div className="relative">
      <button
        onClick={() => {
          const next = !open;
          setOpen(next);
          onOpenChange?.(next);
        }}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Open menu"
      >
        {children}
      </button>
    </div>
  );
}

export function DropdownMenuItem({
  children,
  active,
  icon,
  onClick,
  itemClasses = '',
}: {
  children: ReactNode;
  active?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  itemClasses?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`${itemClasses} ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <hr className="mx-3 border-border/50" />;
}
