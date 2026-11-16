import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useNotifications } from '@/contexts/NotificationsProvider';
import { fetchNotifications } from '@/api/client';
import { formatDateLong, formatTime } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/index';
import { Button } from '@/components/ui/index';
import { Skeleton } from '@/components/ui/empty-state';
import { Bell, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, clearAll } = useNotifications();

  useEffect(() => {
    fetchNotifications().catch(() => {});
  }, []);

  const unread = notifications.filter((n) => !n.readAt);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unread.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => { unread.forEach((n) => markAsRead(n.id)); }}>
            <CheckCheck className="w-4 h-4 mr-2" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading text-lg font-semibold">No notifications</p>
            <p className="text-sm text-muted-foreground mt-1">When you receive notifications, they will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`cursor-pointer transition-colors ${!n.readAt ? 'border-border bg-muted/5' : ''}`}
              onClick={() => markAsRead(n.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !n.readAt ? 'bg-primary/10 text-primary' : 'bg-muted/30 text-muted-foreground'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${!n.readAt ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateLong(n.createdAt)}</p>
                  </div>
                  {!n.readAt && <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" onClick={clearAll}>Clear all notifications</Button>
      </div>
    </div>
  );
}
