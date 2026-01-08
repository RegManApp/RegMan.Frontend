import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { notificationApi } from '../api/notificationApi';
import {
  startNotificationsConnection,
  stopNotificationsConnection,
  onNotificationReceived,
  offNotificationReceived,
} from '../api/notificationSignalrClient';
import { FiBell, FiCheck, FiTrash2, FiX } from 'react-icons/fi';

const NotificationBell = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const handler = () => {
      // Keep it simple + reliable: refresh unread count, and refresh list if open
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    };

    startNotificationsConnection()
      .then(() => onNotificationReceived(handler))
      .catch((e) => console.error(e));

    return () => {
      try {
        offNotificationReceived(handler);
        stopNotificationsConnection();
      } catch (e) {}
    };
  }, [user, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      setLoadError(false);
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setLoadError(true);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const list = await notificationApi.getNotifications();
      const arr = Array.isArray(list) ? list : [];
      const deduped = Array.from(
        new Map(arr.map((n) => [n.notificationId, n])).values()
      );
      setNotifications(deduped);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(notificationId);
      const deleted = notifications.find((n) => n.notificationId === notificationId);
      setNotifications(notifications.filter((n) => n.notificationId !== notificationId));
      if (!deleted?.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationApi.clearReadNotifications();
      setNotifications(notifications.filter((n) => !n.isRead));
    } catch (error) {
      console.error('Error clearing read notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'OfficeHourBooked':
        return '📅';
      case 'OfficeHourCancelled':
        return '❌';
      case 'OfficeHourConfirmed':
        return '✅';
      case 'OfficeHourReminder':
        return '⏰';
      case 'EnrollmentApproved':
        return '🎉';
      case 'EnrollmentDeclined':
        return '😔';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return t('notifications.time.justNow');
    if (diffInSeconds < 3600) {
      return t('notifications.time.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
    }
    if (diffInSeconds < 86400) {
      return t('notifications.time.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
    }
    if (diffInSeconds < 604800) {
      return t('notifications.time.daysAgo', { count: Math.floor(diffInSeconds / 86400) });
    }
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label={t('notifications.a11y.openNotifications')}
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">{t('nav.notifications')}</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {t('notifications.actions.markAllRead')}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={t('common.close')}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : loadError ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <p>{t('notifications.errors.fetchFailed')}</p>
                <button
                  onClick={fetchNotifications}
                  className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {t('common.retry')}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <FiBell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('notifications.empty')}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    !notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-medium ${
                          notification.isRead 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.notificationId, e)}
                              className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                              title="Mark as read"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(notification.notificationId, e)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.some((n) => n.isRead) && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleClearRead}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Clear read
                </button>
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  View all
                </Link>
              </div>
            </div>
          )}

          {notifications.every((n) => !n.isRead) && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-right">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                View all
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
