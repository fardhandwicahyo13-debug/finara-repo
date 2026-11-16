import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  fetchCurrentUser,
  fetchUserPreferences,
  updateUserPreferences,
} from '@/api/client';
import type { UserPreference } from '@/types';

interface ThemeContextValue {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('finara_theme');
    const prefs = localStorage.getItem('finara_preferences');
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs) as Partial<UserPreference>;
        if (parsed.theme) setTheme(parsed.theme);
      } catch {}
    }
    if (stored) {
      setTheme(stored === 'light' ? 'light' : stored === 'dark' ? 'dark' : 'system');
    }
  }, []);

  useEffect(() => {
    const resolve = () => {
      const t = theme === 'system' ? getSystemTheme() : theme;
      setResolvedTheme(t);
      document.documentElement.classList.toggle('dark', t === 'dark');
      document.documentElement.classList.toggle('light', t === 'light');
      localStorage.setItem('finara_theme', t);
    };
    resolve();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (theme === 'system') resolve();
    };
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light';
      localStorage.setItem('finara_theme', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {mounted ? children : null}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
