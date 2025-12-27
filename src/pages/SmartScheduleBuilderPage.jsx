import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { courseApi, smartScheduleApi } from '../api';
import { PageHeader, Card, Button, Loading, EmptyState, SearchableSelect, Input, Select, Badge } from '../components/common';

const buildDayOptions = (t) => [
  { value: '', label: t('smartScheduleBuilder.days.none') },
  { value: 'Monday', label: t('common.days.monday') },
  { value: 'Tuesday', label: t('common.days.tuesday') },
  { value: 'Wednesday', label: t('common.days.wednesday') },
  { value: 'Thursday', label: t('common.days.thursday') },
  { value: 'Friday', label: t('common.days.friday') },
  { value: 'Saturday', label: t('common.days.saturday') },
  { value: 'Sunday', label: t('common.days.sunday') },
];

const getDayKey = (value) => {
  const v = String(value || '').toLowerCase();
  if (v === 'sunday') return 'sunday';
  if (v === 'monday') return 'monday';
  if (v === 'tuesday') return 'tuesday';
  if (v === 'wednesday') return 'wednesday';
  if (v === 'thursday') return 'thursday';
  if (v === 'friday') return 'friday';
  if (v === 'saturday') return 'saturday';
  return null;
};

export default function SmartScheduleBuilderPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const dayOptions = useMemo(() => buildDayOptions(t), [t]);

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);

  const [earliestStart, setEarliestStart] = useState('09:00');
  const [latestEnd, setLatestEnd] = useState('18:00');
  const [avoidDay, setAvoidDay] = useState('');
  const [preferredDayOff, setPreferredDayOff] = useState('Friday');
  const [preferCompact, setPreferCompact] = useState(true);

  const [isBuilding, setIsBuilding] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadCourses() {
      try {
        setLoadingCourses(true);
        const res = await courseApi.getAll({ page: 1, pageSize: 200 });
        const data = res?.data || res;
        const items = data?.items || (Array.isArray(data) ? data : []);
        if (mounted) setCourses(items);
      } catch (e) {
        console.error(e);
        toast.error(t('smartScheduleBuilder.errors.coursesFetchFailed'));
      } finally {
        if (mounted) setLoadingCourses(false);
      }
    }

    loadCourses();
    return () => {
      mounted = false;
    };
  }, []);

  const courseOptions = useMemo(() => {
    return courses.map((c) => ({
      ...c,
      id: c.courseId || c.id,
      label: `${c.courseCode || ''} ${c.courseName || ''}`.trim(),
      value: c.courseId || c.id,
    }));
  }, [courses]);

  const addCourse = () => {
    if (!selectedCourse) return;
    const id = selectedCourse.courseId || selectedCourse.id;
    if (!id) return;

    if (selectedCourses.some((c) => (c.courseId || c.id) === id)) {
      toast.error(t('smartScheduleBuilder.errors.courseAlreadyAdded'));
      return;
    }

    if (selectedCourses.length >= 8) {
      toast.error(t('smartScheduleBuilder.errors.maxCourses', { max: 8 }));
      return;
    }

    setSelectedCourses((prev) => [...prev, selectedCourse]);
    setSelectedCourse(null);
  };

  const removeCourse = (id) => {
    setSelectedCourses((prev) => prev.filter((c) => (c.courseId || c.id) !== id));
  };

  const build = async () => {
    if (selectedCourses.length === 0) {
      toast.error(t('smartScheduleBuilder.errors.minCourses', { min: 1 }));
      return;
    }

    try {
      setIsBuilding(true);
      setResult(null);

      const payload = {
        courseIds: selectedCourses.map((c) => Number(c.courseId || c.id)).filter(Boolean),
        earliestStart: earliestStart || null,
        latestEnd: latestEnd || null,
        avoidDays: avoidDay ? [avoidDay] : [],
        preferredDaysOff: preferredDayOff ? [preferredDayOff] : [],
        preferCompactSchedule: Boolean(preferCompact),
        ignoreFullSections: true,
        maxSectionsPerCourse: 8,
      };

      const res = await smartScheduleApi.recommend(payload);
      const data = res?.data || res;
      setResult(data);
    } catch (e) {
      console.error(e);
      toast.error(t('smartScheduleBuilder.errors.buildFailed'));
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('nav.smartSchedule')}
        description={t('smartScheduleBuilder.description')}
      />

      <Card>
        <div className="p-6 space-y-6">
          {loadingCourses ? (
            <Loading text={t('smartScheduleBuilder.loading.courses')} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchableSelect
                  name="course"
                  label={t('smartScheduleBuilder.fields.addCourse')}
                  options={courseOptions}
                  value={selectedCourse ? (selectedCourse.courseId || selectedCourse.id) : ''}
                  onChange={(opt) => setSelectedCourse(opt)}
                  getOptionLabel={(opt) => opt.label || `${opt.courseCode || ''} ${opt.courseName || ''}`.trim()}
                  getOptionValue={(opt) => opt.courseId || opt.id}
                  placeholder={t('smartScheduleBuilder.placeholders.searchCourse')}
                />
                <div className="flex items-end gap-2">
                  <Button onClick={addCourse} disabled={!selectedCourse}>
                    {t('common.add')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCourses([]);
                      setResult(null);
                    }}
                    disabled={selectedCourses.length === 0 && !result}
                  >
                    {t('common.reset')}
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('smartScheduleBuilder.sections.selectedCourses')}
                </div>
                {selectedCourses.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('smartScheduleBuilder.empty.selectedCourses')}</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedCourses.map((c) => {
                      const id = c.courseId || c.id;
                      const label = `${c.courseCode || ''} ${c.courseName || ''}`.trim();
                      return (
                        <button
                          key={id}
                          onClick={() => removeCourse(id)}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"
                          title={t('common.remove')}
                        >
                          <span className="text-gray-900 dark:text-white">{label}</span>
                          <span className="text-gray-400">×</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label={t('smartScheduleBuilder.fields.earliestStart')}
                  value={earliestStart}
                  onChange={(e) => setEarliestStart(e.target.value)}
                  placeholder={t('smartScheduleBuilder.placeholders.earliestStart')}
                />
                <Input
                  label={t('smartScheduleBuilder.fields.latestEnd')}
                  value={latestEnd}
                  onChange={(e) => setLatestEnd(e.target.value)}
                  placeholder={t('smartScheduleBuilder.placeholders.latestEnd')}
                />
                <Select
                  label={t('smartScheduleBuilder.fields.avoidDayHard')}
                  value={avoidDay}
                  onChange={(e) => setAvoidDay(e.target.value)}
                  options={dayOptions}
                />
                <Select
                  label={t('smartScheduleBuilder.fields.preferDayOffSoft')}
                  value={preferredDayOff}
                  onChange={(e) => setPreferredDayOff(e.target.value)}
                  options={dayOptions}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="preferCompact"
                  type="checkbox"
                  checked={preferCompact}
                  onChange={(e) => setPreferCompact(e.target.checked)}
                />
                <label htmlFor="preferCompact" className="text-sm text-gray-700 dark:text-gray-200">
                  {t('smartScheduleBuilder.fields.preferCompact')}
                </label>
              </div>

              <div>
                <Button onClick={build} disabled={isBuilding}>
                  {isBuilding ? t('smartScheduleBuilder.actions.building') : t('smartScheduleBuilder.actions.build')}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-6">
          {!result ? (
            <EmptyState
              title={t('smartScheduleBuilder.empty.recommendationTitle')}
              description={t('smartScheduleBuilder.empty.recommendationDescription')}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge variant="info">
                  {t('smartScheduleBuilder.metrics.scheduled', {
                    scheduled: result.metrics?.coursesScheduled ?? 0,
                    requested: result.metrics?.coursesRequested ?? 0,
                  })}
                </Badge>
                <Badge variant="info">{t('smartScheduleBuilder.metrics.days', { count: result.metrics?.distinctClassDays ?? 0 })}</Badge>
                <Badge variant="info">{t('smartScheduleBuilder.metrics.gaps', { minutes: result.metrics?.totalGapMinutes ?? 0 })}</Badge>
                {result.metrics?.earliestClassStart && (
                  <Badge variant="info">{t('smartScheduleBuilder.metrics.earliest', { time: result.metrics.earliestClassStart })}</Badge>
                )}
                {result.metrics?.latestClassEnd && (
                  <Badge variant="info">{t('smartScheduleBuilder.metrics.latest', { time: result.metrics.latestClassEnd })}</Badge>
                )}
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('smartScheduleBuilder.sections.recommended')}</div>
                {result.recommendedSections?.length ? (
                  <div className="space-y-3">
                    {result.recommendedSections.map((r) => (
                      <div key={r.sectionId} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {r.courseCode} {r.courseName} — {r.sectionName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {t('smartScheduleBuilder.labels.seats', { seats: r.availableSeats ?? 0 })}{r.instructorName ? ` • ${r.instructorName}` : ''}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                          {r.slots?.map((s, idx) => (
                            <div key={`${r.sectionId}-${idx}`}>
                              {(() => {
                                const key = getDayKey(s.day);
                                const label = key ? t(`common.days.${key}`) : String(s.day || '');
                                return label;
                              })()}: {s.start}–{s.end} • {s.roomName || t('common.room')} • {s.slotType}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('smartScheduleBuilder.empty.noSectionsScheduled')}</div>
                )}
              </div>

              {result.unscheduledCourses?.length ? (
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('smartScheduleBuilder.sections.couldNotSchedule')}</div>
                  <div className="space-y-2">
                    {result.unscheduledCourses.map((u) => (
                      <div key={u.courseId} className="text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-medium">{u.courseName}</span>: {u.reason}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {result.explanation?.length ? (
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('smartScheduleBuilder.sections.explanation')}</div>
                  <div className="space-y-2">
                    {result.explanation.map((line, idx) => (
                      <div key={idx} className="text-sm text-gray-700 dark:text-gray-200">{line}</div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
