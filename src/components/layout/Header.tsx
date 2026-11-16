import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { useTheme } from '@/contexts/ThemeProvider';
import { useNotifications } from '@/contexts/NotificationsProvider';
import { formatDateLong, formatTime } from '@/lib/utils';
import { Button } from '@/components/ui/index';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);

  const breadcrumb = (
    <nav className="text-sm text-muted-foreground">
      <span className="truncate">{location.pathname.replace('/', '') || 'Dashboard'}</span>
    </nav>
  );

  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-sm">
            F
          </div>
          <span className="font-heading text-lg font-semibold hidden sm:block">Finara</span>
        </div>
        {breadcrumb}
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1 md:flex-none">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>

        <button className="relative p-2 rounded-xl border border-border hover:bg-muted transition-colors" aria-label="Notifications">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground truncate max-w-[120px]">{user?.displayName}</span>
            <svg className="w-4 h-4 text-muted-foreground hidden sm:flex" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-lg py-1 animate-slide-up">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{formatDateLong(user?.createdAt || '')}, {formatTime(user?.createdAt || '')}</p>
              </div>
              <div className="px-3 py-1">
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Profile</button>
              </div>
              <div className="px-3 py-1">
                <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Settings</button>
              </div>
              <div className="px-3 py-1 border-t border-border mt-1">
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
