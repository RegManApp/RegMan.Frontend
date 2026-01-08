import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { announcementsApi } from '../api/announcementsApi';
import { PageHeader, Card, EmptyState, Loading, Button, Input, Select } from '../components/common';

export default function AnnouncementsAuditPage() {
  const { t, i18n } = useTranslation();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [createdByUserId, setCreatedByUserId] = useState('');
  const [isArchived, setIsArchived] = useState('');
  const [targetRole, setTargetRole] = useState('');

  const locale = i18n.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en-US';

  const archivedOptions = useMemo(
    () => [
      { value: '', label: t('announcementsAudit.filters.all') },
      { value: 'false', label: t('announcementsAudit.filters.active') },
      { value: 'true', label: t('announcementsAudit.filters.archived') },
    ],
    [t]
  );

  const load = useCallback(async () => {
    try {
      setLoadError(false);
      setLoading(true);

      const params = {
        createdByUserId: createdByUserId.trim() || undefined,
        isArchived: isArchived === '' ? undefined : isArchived === 'true',
        targetRole: targetRole.trim() || undefined,
      };

      const res = await announcementsApi.adminAudit(params);
      const arr = Array.isArray(res.data) ? res.data : [];
      setItems(arr);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [createdByUserId, isArchived, targetRole]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('announcementsAudit.title')}
        description={t('announcementsAudit.description')}
        action={
          <Button variant="outline" onClick={load}>
            {t('common.refresh')}
          </Button>
        }
      />

      <Card>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('announcementsAudit.filters.createdByUserId')}
              value={createdByUserId}
              onChange={(e) => setCreatedByUserId(e.target.value)}
              placeholder={t('announcementsAudit.filters.createdByUserIdPlaceholder')}
            />

            <Select
              label={t('announcementsAudit.filters.status')}
              value={isArchived}
              onChange={(e) => setIsArchived(e.target.value)}
              options={archivedOptions}
            />

            <Input
              label={t('announcementsAudit.filters.targetRole')}
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder={t('announcementsAudit.filters.targetRolePlaceholder')}
            />
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={load}>
              {t('common.search')}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6">
            <Loading text={t('announcementsAudit.loading')} />
          </div>
        ) : loadError ? (
          <div className="p-6">
            <EmptyState
              title={t('announcementsAudit.errors.loadFailedTitle')}
              description={t('common.tryAgain')}
              action={<Button onClick={load}>{t('common.retry')}</Button>}
            />
          </div>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={t('announcementsAudit.empty.title')}
              description={t('announcementsAudit.empty.description')}
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.map((a) => (
              <div key={a.announcementId} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {a.title}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {a.createdByName ? `${a.createdByName} • ` : ''}
                      {a.createdAt ? new Date(a.createdAt).toLocaleString(locale) : ''}
                      {typeof a.recipientCount === 'number'
                        ? ` • ${t('announcementsAudit.counts.recipients', { count: a.recipientCount })}`
                        : ''}
                      {typeof a.readCount === 'number'
                        ? ` • ${t('announcementsAudit.counts.read', { count: a.readCount })}`
                        : ''}
                    </div>

                    {a.isArchived ? (
                      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        {t('announcementsAudit.archived')}
                      </div>
                    ) : null}
                  </div>

                  {!a.isArchived ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await announcementsApi.archive(a.announcementId);
                          setItems((prev) =>
                            prev.map((x) =>
                              x.announcementId === a.announcementId
                                ? { ...x, isArchived: true, archivedAt: new Date().toISOString() }
                                : x
                            )
                          );
                        } catch {
                          // toasted
                        }
                      }}
                    >
                      {t('announcementsAudit.actions.archive')}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
