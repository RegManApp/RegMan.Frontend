import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, EmptyState } from '../common';
import StatsCard from './StatsCard';
import { formatDate } from '../../utils/helpers';
import { useTranslation } from 'react-i18next';
import { useDirection } from '../../hooks/useDirection';

const InstructorDashboard = ({
  instructor,
  schedules = [],
  isLoading,
  user,
  timeline,
}) => {
  const { t } = useTranslation();
  const { isRtl } = useDirection();
  const dayKeys = useMemo(() => ([
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]), []);

  const getDayLabel = (dayIndex) => {
    const key = dayKeys[Number(dayIndex)] || 'sunday';
    return t(`common.days.${key}`);
  };
  // Calculate unique courses from schedules
  const uniqueCourses = [...new Set(schedules.map(s => s.courseId))];
  
  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    const day = schedule.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {});

  // Get today's schedules
  const today = new Date().getDay();
  const todaySchedules = schedulesByDay[today] || [];

  // Determine instructor degree level
  const degree = instructor?.degree || user?.instructorTitle || 'TeachingAssistant';
  const isTA = degree === 'TeachingAssistant' || degree === 0;
  const isProfessorLevel = ['Professor', 'AssociateProfessor', 'AssistantProfessor', 3, 4, 5].includes(degree);
  const isLecturerLevel = ['Lecturer', 'AssistantLecturer', 1, 2].includes(degree);

  // Get gradient color based on degree
  const getGradientColor = () => {
    if (isProfessorLevel) return 'from-purple-600 to-purple-700';
    if (isLecturerLevel) return 'from-blue-600 to-blue-700';
    return 'from-green-600 to-green-700'; // TA
  };

  const getDegreeLabel = () => {
    const normalized = typeof degree === 'number' ? degree : String(degree);
    const map = {
      0: 'teachingAssistant',
      1: 'assistantLecturer',
      2: 'lecturer',
      3: 'assistantProfessor',
      4: 'associateProfessor',
      5: 'professor',
      TeachingAssistant: 'teachingAssistant',
      AssistantLecturer: 'assistantLecturer',
      Lecturer: 'lecturer',
      AssistantProfessor: 'assistantProfessor',
      AssociateProfessor: 'associateProfessor',
      Professor: 'professor',
    };
    const key = map[normalized] || map[degree] || 'instructor';
    return t(`dashboard.instructor.degree.${key}`);
  };

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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`bg-gradient-to-r ${getGradientColor()} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {t('dashboard.instructor.welcomeBack', {
                name: instructor?.user?.firstName || user?.firstName || t('dashboard.instructor.fallbackInstructor'),
              })}
            </h1>
            <p className="mt-2 text-white/80">
              {instructor?.department
                ? t('dashboard.instructor.department', { department: instructor.department })
                : ''}
            </p>
          </div>
          <div className={isRtl ? 'text-left' : 'text-right'}>
            <Badge className="bg-white/20 text-white border-white/30">
              <AcademicCapIcon className={`w-4 h-4 inline ${isRtl ? 'ml-1' : 'mr-1'}`} />
              {getDegreeLabel()}
            </Badge>
          </div>
        </div>
        <p className="mt-2 text-white/70">
          {isProfessorLevel
            ? t('dashboard.instructor.blurb.professor')
            : isLecturerLevel
              ? t('dashboard.instructor.blurb.lecturer')
              : t('dashboard.instructor.blurb.ta')}
        </p>
      </div>

      {/* Registration Timeline (read-only) */}
      <Card title={t('dashboard.timeline.title')} subtitle={t('dashboard.instructor.timelineSubtitle')}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.timeline.statusLabel')}</span>
            <Badge variant={phase === 'Open' ? 'success' : phase === 'Withdraw period' ? 'warning' : 'default'}>
              {phaseLabel}
            </Badge>
            {countdownText && (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {phase === 'Open'
                  ? t('dashboard.timeline.closesIn', { time: countdownText })
                  : phase === 'Withdraw period'
                    ? t('dashboard.timeline.endsIn', { time: countdownText })
                    : t('dashboard.timeline.nextChangeIn', { time: countdownText })}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div>{t('dashboard.timeline.registrationRange', { start: timeline?.registrationStartDate || '—', end: timeline?.registrationEndDate || '—' })}</div>
            <div>{t('dashboard.timeline.withdrawRange', { start: timeline?.withdrawStartDate || '—', end: timeline?.withdrawEndDate || '—' })}</div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('dashboard.instructor.stats.coursesTeaching')}
          value={uniqueCourses.length}
          icon={BookOpenIcon}
          iconClassName="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title={t('dashboard.instructor.stats.weeklyClasses')}
          value={schedules.length}
          icon={CalendarDaysIcon}
          iconClassName="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        />
        <StatsCard
          title={t('dashboard.instructor.stats.todaysClasses')}
          value={todaySchedules.length}
          icon={ClockIcon}
          iconClassName="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
        <StatsCard
          title={t('dashboard.instructor.stats.teachingDays')}
          value={Object.keys(schedulesByDay).length}
          icon={UserGroupIcon}
          iconClassName="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Quick Actions based on role */}
      <Card title={t('dashboard.instructor.quickActions.title')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/schedules">
            <Button variant="outline" className="w-full justify-start" icon={CalendarDaysIcon}>
              {t('dashboard.instructor.quickActions.mySchedule')}
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="outline" className="w-full justify-start" icon={BookOpenIcon}>
              {t('dashboard.instructor.quickActions.myCourses')}
            </Button>
          </Link>
          {(isProfessorLevel || isLecturerLevel) && (
            <Link to="/students">
              <Button variant="outline" className="w-full justify-start" icon={UserGroupIcon}>
                {t('dashboard.instructor.quickActions.viewStudents')}
              </Button>
            </Link>
          )}
          {isProfessorLevel && (
            <Link to="/reports">
              <Button variant="outline" className="w-full justify-start" icon={ChartBarIcon}>
                {t('dashboard.instructor.quickActions.reports')}
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Today's Schedule */}
      <Card
        title={t('dashboard.instructor.today.title')}
        subtitle={t('dashboard.instructor.today.subtitle', { day: getDayLabel(today) })}
        actions={
          <Link to="/schedules">
            <Button variant="outline" size="sm">
              {t('dashboard.instructor.today.viewFullSchedule')}
            </Button>
          </Link>
        }
      >
        {todaySchedules.length > 0 ? (
          <div className="space-y-4">
            {todaySchedules
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <ClockIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {schedule.course?.courseName || t('common.notAvailable')}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {schedule.course?.courseCode}
                      </p>
                    </div>
                  </div>
                  <div className={isRtl ? 'text-left' : 'text-right'}>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                    {schedule.room && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('dashboard.instructor.today.room', { room: schedule.room })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            title={t('dashboard.instructor.today.emptyTitle')}
            description={t('dashboard.instructor.today.emptyDescription')}
          />
        )}
      </Card>

      {/* Weekly Overview */}
      <Card title={t('dashboard.instructor.weekly.title')} subtitle={t('dashboard.instructor.weekly.subtitle')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((day) => { // Monday to Friday
            const daySchedules = schedulesByDay[day] || [];
            return (
              <div
                key={day}
                className={`p-4 rounded-lg border ${
                  day === today
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <h4 className={`font-semibold mb-2 ${
                  day === today
                    ? 'text-primary-700 dark:text-primary-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {getDayLabel(day)}
                </h4>
                {daySchedules.length > 0 ? (
                  <div className="space-y-2">
                    {daySchedules
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((schedule) => (
                        <div
                          key={schedule.id}
                          className="text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded"
                        >
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {schedule.course?.courseCode}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {t('dashboard.instructor.weekly.noClasses')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
