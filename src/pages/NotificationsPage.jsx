import { useEffect, useState, useCallback } from 'react';
import { notificationApi } from '../api/notificationApi';
import { PageHeader, Card, EmptyState, Loading, Button } from '../components/common';
import { useTranslation } from 'react-i18next';

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const locale = i18n.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en-US';

  const load = useCallback(async () => {
    try {
      setLoadError(false);
      setLoading(true);
      const list = await notificationApi.getNotifications({ pageSize: 50 });
      setNotifications(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
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
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.notifications')}
        description={t('notificationsPage.description')}
        action={
          <Button variant="outline" onClick={markAllAsRead}>
            {t('notifications.actions.markAllRead')}
          </Button>
        }
      />

      <Card>
        {loading ? (
          <div className="p-6">
            <Loading text={t('notificationsPage.loading')} />
          </div>
        ) : loadError ? (
          <div className="p-6">
            <EmptyState
              title={t('notificationsPage.errors.loadFailedTitle')}
              description={t('common.tryAgain')}
              action={<Button onClick={load}>{t('common.retry')}</Button>}
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={t('notifications.empty')}
              description={t('notificationsPage.emptyDescription')}
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
                      {n.createdAt ? new Date(n.createdAt).toLocaleString(locale) : ''}
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
                          console.error(e);
                        }
                      }}
                    >
                      {t('notifications.actions.markRead')}
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
