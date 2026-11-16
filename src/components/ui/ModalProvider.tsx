import { createContext, useContext, useState, type ReactNode } from 'react';

interface ModalContextValue {
  openDialog: <T extends Record<string, unknown>>(content: ReactNode, title?: string, props?: T) => void;
  closeDialog: () => void;
  dialogContent: ReactNode | null;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [dialogContent, setDialogContent] = useState<ReactNode | null>(null);
  const [dialogTitle, setDialogTitle] = useState<string>('');

  const openDialog = (content: ReactNode, title = 'Dialog', props?: Record<string, unknown>) => {
    setDialogTitle(title);
    setDialogContent(content);
  };

  const closeDialog = () => setDialogContent(null);

  return (
    <ModalContext.Provider value={{ openDialog, closeDialog, dialogContent }}>
      {children}
      {dialogContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl fade-scale">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              {dialogTitle && <h2 className="font-heading text-xl font-semibold">{dialogTitle}</h2>}
              <button onClick={closeDialog} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-4">{dialogContent}</div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
