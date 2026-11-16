import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  fetchCurrentUser,
  fetchNotifications,
  markNotificationRead,
  clearNotifications,
} from '@/api/client';
import type { NotificationItem } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface NotificationProviderValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationProviderValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchNotifications()
      .then((ns) => {
        if (cancelled) return;
        setNotifications(ns);
        setUnreadCount(ns.filter((n) => !n.readAt).length);
      })
      .catch((err) => {
        if (!cancelled) toast({ variant: 'destructive', title: 'Error', description: err instanceof Error ? err.message : 'Failed to load notifications' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    markNotificationRead(id).catch(() => {});
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    clearNotifications().catch(() => {});
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, loading, markAsRead, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
