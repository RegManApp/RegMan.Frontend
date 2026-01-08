import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { announcementsApi } from '../api/announcementsApi';
import { useAuth } from '../contexts/AuthContext';
import { useAnnouncementsUnread } from '../contexts/AnnouncementsUnreadContext';
import {
  startNotificationsConnection,
  stopNotificationsConnection,
  onAnnouncementSent,
  offAnnouncementSent,
  onAnnouncementRead,
  offAnnouncementRead,
} from '../api/notificationSignalrClient';
import { ROLES } from '../utils/constants';
import { PageHeader, Card, EmptyState, Loading, Button, Input, Textarea, Select } from '../components/common';

const ANNOUNCEMENT_CONVO_NAME = 'Announcements';

const toTargetTypeOptions = (t, role) => {
  const opts = [];

  if (role === ROLES.ADMIN) {
    opts.push({ value: 'AllUsers', label: t('announcementsPage.compose.targets.allUsers') });
    opts.push({ value: 'Roles', label: t('announcementsPage.compose.targets.roles') });
  }

  if (role === ROLES.ADMIN || role === ROLES.INSTRUCTOR) {
    opts.push({ value: 'Course', label: t('announcementsPage.compose.targets.course') });
    opts.push({ value: 'Section', label: t('announcementsPage.compose.targets.section') });
  }

  return opts;
};

export default function AnnouncementsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refresh: refreshUnread } = useAnnouncementsUnread();

  const role = user?.role;
  const canCompose = role === ROLES.ADMIN || role === ROLES.INSTRUCTOR;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [scopes, setScopes] = useState(null);
  const [scopesLoading, setScopesLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('');
  const [targetRoles, setTargetRoles] = useState(() => new Set());
  const [courseId, setCourseId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const locale = i18n.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en-US';

  const loadMine = useCallback(async () => {
    try {
      setLoadError(false);
      setLoading(true);
      const res = await announcementsApi.getMine({ includeArchived: false });
      const arr = Array.isArray(res.data) ? res.data : [];
      setItems(arr);
      refreshUnread();
    } catch (e) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [refreshUnread]);

  const loadScopes = useCallback(async () => {
    if (!canCompose) return;
    try {
      setScopesLoading(true);
      const res = await announcementsApi.getScopes();
      setScopes(res.data || { courses: [], sections: [] });
    } catch {
      // ignore; compose form will just have empty selects
      setScopes({ courses: [], sections: [] });
    } finally {
      setScopesLoading(false);
    }
  }, [canCompose]);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  useEffect(() => {
    if (!user) return;

    const handler = () => {
      loadMine();
    };

    startNotificationsConnection()
      .then(() => {
        onAnnouncementSent(handler);
        onAnnouncementRead(handler);
      })
      .catch(() => {
        // ignore
      });

    return () => {
      try {
        offAnnouncementSent(handler);
        offAnnouncementRead(handler);
        stopNotificationsConnection();
      } catch {
        // ignore
      }
    };
  }, [user, loadMine]);

  useEffect(() => {
    loadScopes();
  }, [loadScopes]);

  const targetTypeOptions = useMemo(() => {
    return [{ value: '', label: t('common.select') }, ...toTargetTypeOptions(t, role)];
  }, [role, t]);

  const courseOptions = useMemo(() => {
    const courses = scopes?.courses || [];
    return [
      { value: '', label: t('common.select') },
      ...courses.map((c) => ({
        value: String(c.courseId),
        label: `${c.courseCode} - ${c.courseName}`,
      })),
    ];
  }, [scopes, t]);

  const sectionOptions = useMemo(() => {
    const sections = scopes?.sections || [];
    return [
      { value: '', label: t('common.select') },
      ...sections.map((s) => ({
        value: String(s.sectionId),
        label: `${s.courseCode} - ${s.courseName}${s.sectionName ? ` / ${s.sectionName}` : ''}`,
      })),
    ];
  }, [scopes, t]);

  const toggleRole = (r) => {
    setTargetRoles((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  };

  const submit = async () => {
    if (!canCompose) return;

    const payload = {
      title: title.trim(),
      content: content.trim(),
      targetType,
      targetRoles: targetType === 'Roles' ? Array.from(targetRoles) : null,
      courseId: targetType === 'Course' ? Number(courseId) : null,
      sectionId: targetType === 'Section' ? Number(sectionId) : null,
    };

    try {
      setSubmitting(true);
      await announcementsApi.create(payload);

      setTitle('');
      setContent('');
      setTargetType('');
      setTargetRoles(new Set());
      setCourseId('');
      setSectionId('');

      await loadMine();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.announcements')}
        description={t('announcementsPage.description')}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/chat?openAnnouncements=1&name=${encodeURIComponent(ANNOUNCEMENT_CONVO_NAME)}`)}
            >
              {t('announcementsPage.actions.openChat')}
            </Button>
            <Button variant="outline" onClick={loadMine}>
              {t('common.refresh')}
            </Button>
          </div>
        }
      />

      {canCompose ? (
        <Card>
          <div className="p-6 space-y-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {t('announcementsPage.compose.title')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t('announcementsPage.compose.fields.title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('announcementsPage.compose.placeholders.title')}
              />

              <Select
                label={t('announcementsPage.compose.fields.target')}
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                options={targetTypeOptions}
                disabled={scopesLoading}
              />
            </div>

            <Textarea
              label={t('announcementsPage.compose.fields.content')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('announcementsPage.compose.placeholders.content')}
              rows={4}
            />

            {targetType === 'Roles' ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {t('announcementsPage.compose.fields.roles')}
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={targetRoles.has(ROLES.STUDENT)}
                    onChange={() => toggleRole(ROLES.STUDENT)}
                  />
                  {t('announcementsPage.compose.roles.students')}
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={targetRoles.has(ROLES.INSTRUCTOR)}
                    onChange={() => toggleRole(ROLES.INSTRUCTOR)}
                  />
                  {t('announcementsPage.compose.roles.instructors')}
                </label>
              </div>
            ) : null}

            {targetType === 'Course' ? (
              <Select
                label={t('announcementsPage.compose.fields.course')}
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                options={courseOptions}
              />
            ) : null}

            {targetType === 'Section' ? (
              <Select
                label={t('announcementsPage.compose.fields.section')}
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                options={sectionOptions}
              />
            ) : null}

            <div className="flex justify-end">
              <Button onClick={submit} loading={submitting} disabled={submitting}>
                {t('announcementsPage.compose.actions.send')}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        {loading ? (
          <div className="p-6">
            <Loading text={t('announcementsPage.loading')} />
          </div>
        ) : loadError ? (
          <div className="p-6">
            <EmptyState
              title={t('announcementsPage.errors.loadFailedTitle')}
              description={t('common.tryAgain')}
              action={<Button onClick={loadMine}>{t('common.retry')}</Button>}
            />
          </div>
        ) : items.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={t('announcementsPage.empty.title')}
              description={t('announcementsPage.empty.description')}
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {items.map((a) => (
              <div
                key={a.announcementId}
                className={`p-4 ${!a.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {a.title}
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {a.content}
                    </div>
                    <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                      {a.createdByName ? `${a.createdByName} • ` : ''}
                      {a.createdAt ? new Date(a.createdAt).toLocaleString(locale) : ''}
                    </div>
                  </div>

                  {!a.isRead ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await announcementsApi.markRead(a.announcementId);
                          setItems((prev) =>
                            prev.map((x) =>
                              x.announcementId === a.announcementId
                                ? { ...x, readAt: new Date().toISOString(), isRead: true }
                                : x
                            )
                          );
                          refreshUnread();
                        } catch {
                          // errors are toasted by axios interceptor
                        }
                      }}
                    >
                      {t('announcementsPage.actions.markRead')}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {role === ROLES.ADMIN ? (
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => navigate('/announcements/audit')}>
            {t('announcementsPage.actions.adminAudit')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
