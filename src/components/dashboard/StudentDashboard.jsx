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
import { getEnrollmentStatusLabel } from '../../utils/constants';

const StudentDashboard = ({
  student,
  enrollments = [],
  availableCourses = [],
  isLoading,
  timeline,
}) => {
  // Status 0 = Enrolled, Status 1 = Completed
  const activeEnrollments = enrollments.filter((e) => e.status === 0);
  const completedEnrollments = enrollments.filter((e) => e.status === 1);
  const gpa = calculateGPA(enrollments);

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
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {student?.user?.firstName || 'Student'}!
        </h1>
        <p className="mt-2 text-primary-100">
          Here's an overview of your academic progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Enrolled Courses"
          value={activeEnrollments.length}
          icon={BookOpenIcon}
          iconClassName="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="Completed Courses"
          value={completedEnrollments.length}
          icon={ClipboardDocumentListIcon}
          iconClassName="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="Current GPA"
          value={gpa || 'N/A'}
          icon={AcademicCapIcon}
          iconClassName="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
        />
        <StatsCard
          title="Total Credits"
          value={enrollments.reduce((sum, e) => sum + (e.course?.creditHours || 0), 0)}
          icon={CalendarIcon}
          iconClassName="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Registration Timeline */}
      <Card title="Registration Timeline" subtitle="Registration and withdraw windows">
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
          {phase !== 'Open' && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Enrollment actions are blocked outside valid windows.
            </div>
          )}
        </div>
      </Card>

      {/* Current Enrollments */}
      <Card
        title="My Courses"
        subtitle={`${activeEnrollments.length} active enrollment(s)`}
        actions={
          <Link to="/courses">
            <Button variant="outline" size="sm">
              Browse Courses
            </Button>
          </Link>
        }
      >
        {activeEnrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeEnrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="primary" size="sm">
                    {enrollment.course?.courseCode}
                  </Badge>
                  <Badge className={getStatusColor(enrollment.status)} size="sm">
                    {getEnrollmentStatusLabel(enrollment.status)}
                  </Badge>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {enrollment.course?.courseName}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {enrollment.course?.creditHours} Credits • {enrollment.semester || 'Current'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Grade: {enrollment.grade || 'In Progress'}
                  </span>
                  <Link
                    to={`/courses/${enrollment.courseId}`}
                    className="text-primary-600 hover:text-primary-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active enrollments"
            description="You are not enrolled in any courses. Browse available courses to get started."
            action={
              <Link to="/courses">
                <Button>Browse Courses</Button>
              </Link>
            }
          />
        )}
      </Card>

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <Card
          title="Recommended Courses"
          subtitle="Available courses you might be interested in"
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
                  {course.creditHours} Credits
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {course.enrollmentCount || 0} enrolled
                  </span>
                  <Link
                    to={`/courses/${course.id}`}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Completed Courses */}
      {completedEnrollments.length > 0 && (
        <Card title="Completed Courses" subtitle="Your academic history">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Credits
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Grade
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                    Completed
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
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {enrollment.course?.creditHours}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {enrollment.grade || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
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
