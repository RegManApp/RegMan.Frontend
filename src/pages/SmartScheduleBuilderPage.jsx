import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { courseApi, smartScheduleApi } from '../api';
import { PageHeader, Card, Button, Loading, EmptyState, SearchableSelect, Input, Select, Badge } from '../components/common';

const dayOptions = [
  { value: '', label: 'None' },
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
];

export default function SmartScheduleBuilderPage() {
  const { user } = useAuth();

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
        toast.error('Failed to load courses');
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
      toast.error('Course already added');
      return;
    }

    if (selectedCourses.length >= 8) {
      toast.error('Max 8 courses for Smart Builder');
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
      toast.error('Add at least 1 course');
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
      toast.error(e.message || 'Failed to build schedule');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Schedule Builder"
        description="Deterministic recommendations with clear explanations."
      />

      <Card>
        <div className="p-6 space-y-6">
          {loadingCourses ? (
            <Loading text="Loading courses..." />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchableSelect
                  name="course"
                  label="Add course"
                  options={courseOptions}
                  value={selectedCourse ? (selectedCourse.courseId || selectedCourse.id) : ''}
                  onChange={(opt) => setSelectedCourse(opt)}
                  getOptionLabel={(opt) => opt.label || `${opt.courseCode || ''} ${opt.courseName || ''}`.trim()}
                  getOptionValue={(opt) => opt.courseId || opt.id}
                  placeholder="Search course code or name..."
                />
                <div className="flex items-end gap-2">
                  <Button onClick={addCourse} disabled={!selectedCourse}>
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCourses([]);
                      setResult(null);
                    }}
                    disabled={selectedCourses.length === 0 && !result}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Selected courses
                </div>
                {selectedCourses.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No courses selected yet.</div>
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
                          title="Remove"
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
                  label="Earliest start (HH:mm)"
                  value={earliestStart}
                  onChange={(e) => setEarliestStart(e.target.value)}
                  placeholder="09:00"
                />
                <Input
                  label="Latest end (HH:mm)"
                  value={latestEnd}
                  onChange={(e) => setLatestEnd(e.target.value)}
                  placeholder="18:00"
                />
                <Select
                  label="Avoid day (hard)"
                  value={avoidDay}
                  onChange={(e) => setAvoidDay(e.target.value)}
                  options={dayOptions}
                />
                <Select
                  label="Prefer day off (soft)"
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
                  Prefer compact schedule (fewer gaps)
                </label>
              </div>

              <div>
                <Button onClick={build} disabled={isBuilding}>
                  {isBuilding ? 'Building…' : 'Build Schedule'}
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
              title="No recommendation yet"
              description="Select courses and click Build Schedule."
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge variant="info">Scheduled: {result.metrics?.coursesScheduled}/{result.metrics?.coursesRequested}</Badge>
                <Badge variant="info">Days: {result.metrics?.distinctClassDays ?? 0}</Badge>
                <Badge variant="info">Gaps: {result.metrics?.totalGapMinutes ?? 0} min</Badge>
                {result.metrics?.earliestClassStart && <Badge variant="info">Earliest: {result.metrics.earliestClassStart}</Badge>}
                {result.metrics?.latestClassEnd && <Badge variant="info">Latest: {result.metrics.latestClassEnd}</Badge>}
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended sections</div>
                {result.recommendedSections?.length ? (
                  <div className="space-y-3">
                    {result.recommendedSections.map((r) => (
                      <div key={r.sectionId} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {r.courseCode} {r.courseName} — {r.sectionName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Seats: {r.availableSeats}{r.instructorName ? ` • ${r.instructorName}` : ''}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                          {r.slots?.map((s, idx) => (
                            <div key={`${r.sectionId}-${idx}`}>
                              {s.day}: {s.start}–{s.end} • {s.roomName || 'Room'} • {s.slotType}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No sections could be scheduled.</div>
                )}
              </div>

              {result.unscheduledCourses?.length ? (
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Couldn’t schedule</div>
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
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Explanation</div>
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
