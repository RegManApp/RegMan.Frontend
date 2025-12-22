import { useEffect, useState, useCallback } from 'react';
import { notificationApi } from '../api/notificationApi';
import { PageHeader, Card, EmptyState, Loading, Button } from '../components/common';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoadError(false);
      setLoading(true);
      const list = await notificationApi.getNotifications({ pageSize: 50 });
      setNotifications(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Failed to load notifications', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Your recent updates and alerts."
        action={
          <Button variant="outline" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        }
      />

      <Card>
        {loading ? (
          <div className="p-6">
            <Loading text="Loading notifications..." />
          </div>
        ) : loadError ? (
          <div className="p-6">
            <EmptyState
              title="Couldn't load notifications"
              description="Please try again."
              action={<Button onClick={load}>Retry</Button>}
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No notifications"
              description="You're all caught up."
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((n) => (
              <div
                key={n.notificationId}
                className={`p-4 ${!n.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {n.title}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {n.message}
                    </div>
                    <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await notificationApi.markAsRead(n.notificationId);
                          setNotifications((prev) =>
                            prev.map((x) => (x.notificationId === n.notificationId ? { ...x, isRead: true } : x))
                          );
                        } catch (e) {
                          console.error('Failed to mark as read', e);
                        }
                      }}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
