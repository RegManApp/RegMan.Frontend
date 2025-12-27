import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  AcademicCapIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, EmptyState } from '../common';
import StatsCard from './StatsCard';
import { formatDate, getStatusColor, calculateGPA } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../../hooks/useDirection';

const StudentDashboard = ({
  student,
  enrollments = [],
  availableCourses = [],
  isLoading,
  timeline,
}) => {
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];

  // Backend enum: Pending=0, Enrolled=1, Dropped=2, Completed=3, Declined=4
  const activeEnrollments = safeEnrollments.filter((e) => e?.status === 0 || e?.status === 1);
  const completedEnrollments = safeEnrollments.filter((e) => e?.status === 3);
  const gpa = calculateGPA(safeEnrollments);
  const { t } = useTranslation();
  const { isRtl } = useDirection();

  const getEnrollmentStatusKey = (value) => {
    if (typeof value === 'number') {
      if (value === 0) return 'pending';
      if (value === 1) return 'enrolled';
      if (value === 2) return 'dropped';
      if (value === 3) return 'completed';
      if (value === 4) return 'declined';
      return null;
    }
    const v = String(value || '').toLowerCase();
    if (v.includes('pending')) return 'pending';
    if (v.includes('enrolled')) return 'enrolled';
    if (v.includes('dropped')) return 'dropped';
    if (v.includes('completed')) return 'completed';
    if (v.includes('declined')) return 'declined';
    return null;
  };

  const renderEnrollmentStatus = (value) => {
    const key = getEnrollmentStatusKey(value);
    if (!key) return String(value ?? t('common.notAvailable'));
    return t(`enums.enrollmentStatus.${key}`);
  };

  const firstName =
    student?.user?.firstName ||
    student?.firstName ||
    (student?.fullName ? student.fullName.split(' ')[0] : '') ||
    t('dashboard.student.fallbackStudent');

  const countdownTarget = timeline?.status?.countdownTargetUtc ? new Date(timeline.status.countdownTargetUtc) : null;
  const phase = timeline?.status?.phase || 'Closed';
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const countdownText = useMemo(() => {
    if (!countdownTarget || Number.isNaN(countdownTarget.getTime())) return '';
    const diffMs = countdownTarget.getTime() - now.getTime();
    if (diffMs <= 0) return '0s';
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours || days) parts.push(`${hours}h`);
    if (minutes || hours || days) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  }, [countdownTarget?.getTime(), now]);

  const normalizedPhase = String(phase || '').toLowerCase();
  const phaseKey = normalizedPhase === 'open'
    ? 'dashboard.timeline.phase.open'
    : normalizedPhase === 'withdraw period'
      ? 'dashboard.timeline.phase.withdraw'
      : 'dashboard.timeline.phase.closed';
  const phaseLabel = t(phaseKey);
  const phaseVariant = normalizedPhase === 'open'
    ? 'success'
    : normalizedPhase === 'withdraw period'
      ? 'warning'
      : 'default';

  const na = t('common.notAvailable');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          {t('dashboard.student.welcomeBack', { name: firstName })}
        </h1>
        <p className="mt-2 text-primary-100">
          {t('dashboard.student.overview')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('dashboard.student.stats.enrolledCourses')}
          value={activeEnrollments.length}
          icon={BookOpenIcon}
          iconClassName="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title={t('dashboard.student.stats.completedCourses')}
          value={completedEnrollments.length}
          icon={ClipboardDocumentListIcon}
          iconClassName="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        />
        <StatsCard
          title={t('dashboard.student.stats.currentGpa')}
          value={gpa || na}
          icon={AcademicCapIcon}
          iconClassName="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
        <StatsCard
          title={t('dashboard.student.stats.totalCredits')}
          value={safeEnrollments.reduce((sum, e) => {
            const credits = e?.course?.creditHours ?? e?.creditHours ?? 0;
            return sum + (Number(credits) || 0);
          }, 0)}
          icon={CalendarIcon}
          iconClassName="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Registration Timeline */}
      <Card title={t('dashboard.timeline.title')} subtitle={t('dashboard.timeline.subtitle')}>
        <div className="flex flex-col gap-2">
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.timeline.statusLabel')}</span>
            <Badge variant={phaseVariant}>{phaseLabel}</Badge>
            {countdownText && (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {normalizedPhase === 'open'
                  ? t('dashboard.timeline.closesIn', { time: countdownText })
                  : normalizedPhase === 'withdraw period'
                    ? t('dashboard.timeline.endsIn', { time: countdownText })
                    : t('dashboard.timeline.nextChangeIn', { time: countdownText })}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div>
              {t('dashboard.timeline.registrationRange', {
                start: timeline?.registrationStartDate || na,
                end: timeline?.registrationEndDate || na,
              })}
            </div>
            <div>
              {t('dashboard.timeline.withdrawRange', {
                start: timeline?.withdrawStartDate || na,
                end: timeline?.withdrawEndDate || na,
              })}
            </div>
          </div>
          {normalizedPhase !== 'open' && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('dashboard.timeline.actionsBlocked')}
            </div>
          )}
        </div>
      </Card>

      {/* Current Enrollments */}
      <Card
        title={t('dashboard.student.myCourses.title')}
        subtitle={t('dashboard.student.myCourses.subtitle', { count: activeEnrollments.length })}
        actions={
          <Link to="/courses">
            <Button variant="outline" size="sm">
              {t('dashboard.student.actions.browseCourses')}
            </Button>
          </Link>
        }
      >
        {activeEnrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEnrollments.map((enrollment) => (
              <div
                key={enrollment.enrollmentId || enrollment.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="primary" size="sm">
                    {enrollment.course?.courseCode || enrollment.courseCode || na}
                  </Badge>
                  <Badge className={getStatusColor(enrollment.status)} size="sm">
                    {renderEnrollmentStatus(enrollment.status)}
                  </Badge>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {enrollment.course?.courseName || enrollment.courseName || na}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {t('dashboard.student.courseMeta', {
                    credits: enrollment.course?.creditHours ?? enrollment.creditHours ?? 0,
                    semester: enrollment.semester || t('dashboard.student.currentSemester'),
                  })}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('dashboard.student.gradeLabel', {
                      grade: enrollment.grade || t('dashboard.student.inProgress'),
                    })}
                  </span>
                  <Link
                    to={`/courses/${enrollment.courseId || enrollment.course?.courseId || enrollment.course?.id}`}
                    className="text-primary-600 hover:text-primary-500"
                  >
                    {t('courses.viewDetails')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={t('dashboard.student.emptyActive.title')}
            description={t('dashboard.student.emptyActive.description')}
            action={
              <Link to="/courses">
                <Button>{t('dashboard.student.actions.browseCourses')}</Button>
              </Link>
            }
          />
        )}
      </Card>

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <Card
          title={t('dashboard.student.recommended.title')}
          subtitle={t('dashboard.student.recommended.subtitle')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableCourses.slice(0, 6).map((course) => (
              <div
                key={course.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <Badge variant="primary" size="sm" className="mb-2">
                  {course.courseCode}
                </Badge>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {course.courseName}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {t('courses.creditsWithValue', { count: course.creditHours })}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {t('courses.enrolledWithValue', { count: course.enrollmentCount || 0 })}
                  </span>
                  <Link
                    to={`/courses/${course.id}`}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    {t('courses.viewDetails')} {isRtl ? '←' : '→'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Completed Courses */}
      {completedEnrollments.length > 0 && (
        <Card title={t('dashboard.student.completed.title')} subtitle={t('dashboard.student.completed.subtitle')}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className={`px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase ${isRtl ? 'text-right' : 'text-left'}`}>
                    {t('dashboard.student.completed.headers.course')}
                  </th>
                  <th className={`px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase ${isRtl ? 'text-right' : 'text-left'}`}>
                    {t('dashboard.student.completed.headers.credits')}
                  </th>
                  <th className={`px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase ${isRtl ? 'text-right' : 'text-left'}`}>
                    {t('dashboard.student.completed.headers.grade')}
                  </th>
                  <th className={`px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase ${isRtl ? 'text-right' : 'text-left'}`}>
                    {t('dashboard.student.completed.headers.completed')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {completedEnrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {enrollment.course?.courseName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {enrollment.course?.courseCode}
                        </p>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-gray-900 dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}>
                      {enrollment.course?.creditHours}
                    </td>
                    <td className={`px-4 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {enrollment.grade || t('common.notAvailable')}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-gray-500 dark:text-gray-400 ${isRtl ? 'text-right' : 'text-left'}`}>
                      {formatDate(enrollment.completedDate || enrollment.enrollmentDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentDashboard;
