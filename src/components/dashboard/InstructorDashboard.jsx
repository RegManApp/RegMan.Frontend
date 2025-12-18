import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Card, Button, Badge, EmptyState } from '../common';
import StatsCard from './StatsCard';
import { formatDate } from '../../utils/helpers';
import { getDayOfWeekLabel } from '../../utils/constants';

const InstructorDashboard = ({
  instructor,
  schedules = [],
  isLoading,
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {instructor?.user?.firstName || 'Instructor'}!
        </h1>
        <p className="mt-2 text-green-100">
          {instructor?.department && `Department: ${instructor.department}`}
        </p>
      </div>

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
