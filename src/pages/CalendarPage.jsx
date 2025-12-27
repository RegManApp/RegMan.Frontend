import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { calendarApi } from '../api/calendarApi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiBook,
  FiUsers,
} from 'react-icons/fi';

const CalendarPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const locale = i18n.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en-US';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'list'

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchEvents();
  }, [year, month]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
      const data = await calendarApi.getCalendarEvents({ startDate, endDate });
      setEvents(data);
    } catch (error) {
      console.error(error);
      toast.error(t('calendar.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeKey = (value) => {
    const v = String(value || '');
    if (v === 'OfficeHour') return 'officeHour';
    if (v === 'Booking') return 'booking';
    if (v === 'Class') return 'class';
    if (v === 'Teaching') return 'teaching';
    if (v === 'registration') return 'registration';
    if (v === 'withdraw') return 'withdraw';
    return null;
  };

  const renderEventType = (value) => {
    const key = getEventTypeKey(value);
    if (!key) return String(value ?? t('common.notAvailable'));
    return t(`calendar.eventType.${key}`);
  };

  const renderEventTitle = (event) => {
    if (!event) return '';
    if (event.titleKey) return t(event.titleKey);
    if (event.title) return event.title;
    return renderEventType(event.type);
  };

  const daysInMonth = useMemo(() => {
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Add days from previous month to fill the first week
    const startDayOfWeek = firstDay.getDay();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter((event) => event.date === dateStr);
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'OfficeHour':
        return 'bg-green-500';
      case 'Booking':
        return 'bg-blue-500';
      case 'Class':
        return 'bg-purple-500';
      case 'Teaching':
        return 'bg-orange-500';
      case 'registration':
        return 'bg-red-500';
      case 'withdraw':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventTypeBgColor = (type) => {
    switch (type) {
      case 'OfficeHour':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'Booking':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'Class':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'Teaching':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'registration':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'withdraw':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'OfficeHour':
        return <FiClock className="w-4 h-4" />;
      case 'Booking':
        return <FiCalendar className="w-4 h-4" />;
      case 'Class':
        return <FiBook className="w-4 h-4" />;
      case 'Teaching':
        return <FiUsers className="w-4 h-4" />;
      case 'registration':
        return <FiUser className="w-4 h-4" />;
      case 'withdraw':
        return <FiUser className="w-4 h-4" />;
      default:
        return <FiCalendar className="w-4 h-4" />;
    }
  };

  const formatMonthYear = () => {
    return currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return events
      .filter((e) => e.date >= today)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
  }, [events]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('nav.calendar')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('calendar.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t('calendar.view.month')}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {t('calendar.view.list')}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{t('calendar.legend.officeHours')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{t('calendar.legend.bookings')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{t('calendar.legend.classes')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{t('calendar.legend.teaching')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{t('calendar.legend.registrationEnds')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{t('calendar.legend.withdrawPeriod')}</span>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{formatMonthYear()}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                >
                  {t('calendar.actions.today')}
                </button>
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const d = new Date(2024, 0, 7 + dayIndex);
                const label = d.toLocaleDateString(locale, { weekday: 'short' });
                return (
                <div
                  key={dayIndex}
                  className="py-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  {label}
                </div>
              );
              })}
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {daysInMonth.map(({ date, isCurrentMonth }, index) => {
                  const dayEvents = getEventsForDate(date);
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`min-h-[80px] p-2 border-b border-r border-gray-100 dark:border-gray-700 text-left transition-colors ${
                        !isCurrentMonth
                          ? 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600'
                          : isSelected(date)
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${
                          isToday(date)
                            ? 'bg-primary-600 text-white'
                            : isCurrentMonth
                            ? 'text-gray-900 dark:text-white'
                            : ''
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 2).map((event, i) => (
                          <div
                            key={i}
                            className={`text-xs truncate px-1 py-0.5 rounded ${getEventTypeBgColor(event.type)}`}
                          >
                            {renderEventTitle(event)}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                            {t('calendar.more', { count: dayEvents.length - 2 })}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Date Events */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedDate
                    ? selectedDate.toLocaleDateString(locale, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })
                    : t('calendar.selectDate')}
                </h3>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {selectedDate ? (
                  selectedDateEvents.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {selectedDateEvents.map((event, index) => (
                        <div key={index} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getEventTypeBgColor(event.type)}`}>
                              {getEventIcon(event.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white">{renderEventTitle(event)}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {event.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {event.startTime && event.endTime && (
                                  <span className="flex items-center gap-1">
                                    <FiClock className="w-3 h-3" />
                                    {event.startTime} - {event.endTime}
                                  </span>
                                )}
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <FiMapPin className="w-3 h-3" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                              {event.instructorName && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                  <FiUser className="w-3 h-3" />
                                  {event.instructorName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      {t('calendar.empty.noEventsOnDay')}
                    </div>
                  )
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    {t('calendar.empty.selectDateHint')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('calendar.upcoming.title')}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{formatMonthYear()}</span>
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {t('calendar.upcoming.empty')}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {new Date(event.date).getDate()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.date).toLocaleDateString(locale, { weekday: 'short' })}
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg ${getEventTypeBgColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white">{renderEventTitle(event)}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {event.startTime && event.endTime && (
                          <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {event.startTime} - {event.endTime}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <FiMapPin className="w-4 h-4" />
                            {event.location}
                          </span>
                        )}
                        {event.instructorName && (
                          <span className="flex items-center gap-1">
                            <FiUser className="w-4 h-4" />
                            {event.instructorName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 text-xs font-medium rounded ${getEventTypeBgColor(event.type)}`}>
                      {renderEventType(event.type)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
