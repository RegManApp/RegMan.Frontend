import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { announcementsApi } from '../api/announcementsApi';
import { useAuth } from './AuthContext';
import {
  startNotificationsConnection,
  stopNotificationsConnection,
  onAnnouncementRead,
  offAnnouncementRead,
  onAnnouncementSent,
  offAnnouncementSent,
} from '../api/notificationSignalrClient';

const AnnouncementsUnreadContext = createContext(null);

export function AnnouncementsUnreadProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await announcementsApi.getUnreadCount();
      setUnreadCount(res.data?.count ?? 0);
    } catch {
      // keep previous count
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [user, refresh]);

  useEffect(() => {
    if (!user) return;

    const handler = () => {
      refresh();
    };

    startNotificationsConnection()
      .then(() => {
        onAnnouncementSent(handler);
        onAnnouncementRead(handler);
      })
      .catch(() => {
        // ignore; badge just won't live-update
      });

    return () => {
      try {
        offAnnouncementSent(handler);
        offAnnouncementRead(handler);
        stopNotificationsConnection();
      } catch {
        // ignore
      }
    };
  }, [user, refresh]);

  const value = useMemo(
    () => ({
      unreadCount,
      refresh,
    }),
    [unreadCount, refresh]
  );

  return (
    <AnnouncementsUnreadContext.Provider value={value}>
      {children}
    </AnnouncementsUnreadContext.Provider>
  );
}

export function useAnnouncementsUnread() {
  const ctx = useContext(AnnouncementsUnreadContext);
  return (
    ctx || {
      unreadCount: 0,
      refresh: async () => {},
    }
  );
}
