import { useMemo } from 'react';
import { Card, Badge } from '../common';
import { getDayOfWeekLabel, DAYS_OF_WEEK } from '../../utils/constants';

const Timetable = ({ schedules = [], onScheduleClick }) => {
  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const grouped = {};
    DAYS_OF_WEEK.forEach((day) => {
      grouped[day.value] = schedules
        .filter((s) => s.dayOfWeek === day.value)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [schedules]);

  // Get unique time slots
  const timeSlots = useMemo(() => {
    const slots = new Set();
    schedules.forEach((s) => {
      slots.add(s.startTime);
    });
    return Array.from(slots).sort();
  }, [schedules]);

  const getDayColor = (day) => {
    const colors = {
      0: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800',
      1: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800',
      2: 'bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-800',
      3: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
      4: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
      5: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800',
      6: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800',
    };
    return colors[day] || 'bg-gray-50 border-gray-200';
  };

  if (schedules.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No schedules to display</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Weekly Timetable">
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-2 min-w-[800px]">
          {/* Day Headers */}
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day.value}
              className={`p-3 text-center font-semibold rounded-t-lg ${getDayColor(day.value)}`}
            >
              <span className="text-gray-900 dark:text-white">{day.label}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                {schedulesByDay[day.value]?.length || 0} classes
              </span>
            </div>
          ))}

          {/* Schedule Items */}
          {DAYS_OF_WEEK.map((day) => (
            <div key={`content-${day.value}`} className="space-y-2 min-h-[200px]">
              {schedulesByDay[day.value]?.length > 0 ? (
                schedulesByDay[day.value].map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={() => onScheduleClick?.(schedule)}
                    className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getDayColor(day.value)}`}
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {schedule.courseName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {schedule.courseCode}
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Room: {schedule.roomNumber}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {schedule.instructorName}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-gray-400 dark:text-gray-500">
                  No classes
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default Timetable;
