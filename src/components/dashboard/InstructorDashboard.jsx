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
import { getDayOfWeekLabel, getInstructorDegreeLabel } from '../../utils/constants';

const InstructorDashboard = ({
  instructor,
  schedules = [],
  isLoading,
  user,
  timeline,
}) => {
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
    const labels = {
      0: 'Teaching Assistant',
      1: 'Assistant Lecturer',
      2: 'Lecturer',
      3: 'Assistant Professor',
      4: 'Associate Professor',
      5: 'Professor',
      'TeachingAssistant': 'Teaching Assistant',
      'AssistantLecturer': 'Assistant Lecturer',
      'Lecturer': 'Lecturer',
      'AssistantProfessor': 'Assistant Professor',
      'AssociateProfessor': 'Associate Professor',
      'Professor': 'Professor',
    };
    return labels[degree] || 'Instructor';
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`bg-gradient-to-r ${getGradientColor()} rounded-xl p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {instructor?.user?.firstName || user?.firstName || 'Instructor'}!
            </h1>
            <p className="mt-2 text-white/80">
              {instructor?.department && `Department: ${instructor.department}`}
            </p>
          </div>
          <div className="text-right">
            <Badge className="bg-white/20 text-white border-white/30">
              <AcademicCapIcon className="w-4 h-4 mr-1 inline" />
              {getDegreeLabel()}
            </Badge>
          </div>
        </div>
        <p className="mt-2 text-white/70">
          {isProfessorLevel ? 'Manage your courses, supervise students, and review research.' : 
           isLecturerLevel ? 'Manage your lectures and student progress.' :
           'Assist with sections, labs, and student support.'}
        </p>
      </div>

      {/* Registration Timeline (read-only) */}
      <Card title="Registration Timeline" subtitle="Read-only timeline visibility">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
            <Badge variant={phase === 'Open' ? 'success' : phase === 'Withdraw period' ? 'warning' : 'default'}>
              {phase}
            </Badge>
            {countdownText && (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {phase === 'Open'
                  ? `• closes in ${countdownText}`
                  : phase === 'Withdraw period'
                    ? `• ends in ${countdownText}`
                    : `• next change in ${countdownText}`}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <div>Registration: {timeline?.registrationStartDate || '—'} → {timeline?.registrationEndDate || '—'} (UTC)</div>
            <div>Withdraw: {timeline?.withdrawStartDate || '—'} → {timeline?.withdrawEndDate || '—'} (UTC)</div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Courses Teaching"
          value={uniqueCourses.length}
          icon={BookOpenIcon}
          iconClassName="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Weekly Classes"
          value={schedules.length}
          icon={CalendarDaysIcon}
          iconClassName="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="Today's Classes"
          value={todaySchedules.length}
          icon={ClockIcon}
          iconClassName="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
        <StatsCard
          title="Teaching Days"
          value={Object.keys(schedulesByDay).length}
          icon={UserGroupIcon}
          iconClassName="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Quick Actions based on role */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/schedules">
            <Button variant="outline" className="w-full justify-start" icon={CalendarDaysIcon}>
              My Schedule
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="outline" className="w-full justify-start" icon={BookOpenIcon}>
              My Courses
            </Button>
          </Link>
          {(isProfessorLevel || isLecturerLevel) && (
            <Link to="/students">
              <Button variant="outline" className="w-full justify-start" icon={UserGroupIcon}>
                View Students
              </Button>
            </Link>
          )}
          {isProfessorLevel && (
            <Link to="/reports">
              <Button variant="outline" className="w-full justify-start" icon={ChartBarIcon}>
                Reports
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Today's Schedule */}
      <Card
        title="Today's Schedule"
        subtitle={`${getDayOfWeekLabel(today)}'s classes`}
        actions={
          <Link to="/schedules">
            <Button variant="outline" size="sm">
              View Full Schedule
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
                        {schedule.course?.courseName || 'Unknown Course'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {schedule.course?.courseCode}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                    {schedule.room && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Room: {schedule.room}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            title="No classes today"
            description="You don't have any scheduled classes for today."
          />
        )}
      </Card>

      {/* Weekly Overview */}
      <Card title="Weekly Overview" subtitle="Your teaching schedule this week">
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
                  {getDayOfWeekLabel(day)}
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
                    No classes
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
