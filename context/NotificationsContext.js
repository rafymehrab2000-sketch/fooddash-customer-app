import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'fd-notifications';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => { if (raw) setNotifications(JSON.parse(raw)); })
      .catch(() => {});
  }, []);

  const persist = useCallback((list) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list)).catch(() => {});
  }, []);

  const addNotification = useCallback((id, title, body) => {
    setNotifications(prev => {
      if (prev.some(n => n.id === id)) return prev;
      const item = {
        id,
        title: title ?? 'Notification',
        body: body ?? '',
        time: new Date().toISOString(),
        read: false,
      };
      const next = [item, ...prev];
      persist(next);
      return next;
    });
  }, [persist]);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      persist(next);
      return next;
    });
  }, [persist]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      persist(next);
      return next;
    });
  }, [persist]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = useMemo(() => ({
    notifications, addNotification, markAsRead, markAllAsRead, unreadCount,
  }), [notifications, addNotification, markAsRead, markAllAsRead, unreadCount]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
