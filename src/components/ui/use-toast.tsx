import React from 'react';

interface ToastProps {
  id: string;
  variant?: 'default' | 'destructive';
  title?: string;
  description?: string;
}

interface ToastState {
  id: string;
  variant?: 'default' | 'destructive';
  title?: string;
  description?: string;
}

let toastId = 0;
const toasts: ToastState[] = [];

interface ToastAction {
  id: string;
  dismiss: () => void;
}

export function toast({
  variant = 'default',
  title,
  description,
}: Omit<ToastProps, 'id'>): ToastAction {
  const id = `toast_${++toastId}`;
  const entry: ToastState = { id, variant, title, description };
  toasts.push(entry);

  const el = document.createElement('div');
  el.className =
    `toast toast-${variant} fade-in fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium`;
  if (variant === 'destructive') {
    el.classList.add('border-red-500');
  }
  if (title) {
    el.innerHTML = `<div class="font-semibold">${title}</div>`;
  }
  if (description) {
    el.innerHTML += `<div class="text-muted-foreground text-xs mt-0.5">${description}</div>`;
  }
  document.body.appendChild(el);

  toasts.forEach((t, i) => {
    const node = document.querySelector(`[data-toast-id="${t.id}"]`);
    if (node) node.replaceWith(el);
  });

  const timer = setTimeout(() => {
    el.remove();
    toasts.splice(toasts.findIndex((t) => t.id === id), 1);
  }, 4000);

  return {
    id,
    dismiss: () => { clearTimeout(timer); el.remove(); toasts.splice(toasts.findIndex((t) => t.id === id), 1); }
  };
}

export function ToastContainer() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          data-toast-id={t.id}
          className={`toast toast-${t.variant} fade-in flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm max-w-sm`}
        >
          <div className="flex-1 min-w-0">
            {t.title && (
              <div className="font-semibold text-foreground truncate">{t.title}</div>
            )}
            {t.description && (
              <div className="text-muted-foreground text-xs mt-0.5">{t.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
