import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppNotification, NotificationKind } from '@errand/types';
import { usePersistentList } from '../hooks/usePersistentList';
import { loadJSON, removeKey, saveJSON, STORAGE_KEYS } from '../storage/storage';

type NotificationsContextValue = {
  // Newest first.
  notifications: AppNotification[];
  unreadCount: number;
  // Records something that happened to a task (called by the task and chat
  // stores when the event happens).
  notify: (kind: NotificationKind, taskId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  isUnread: (notification: AppNotification) => boolean;
  clearAll: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

// The in-app notifications list. Built from real events on this device until
// the backend exists.
// TODO: notifications.list / markRead via @errand/api (the backend creates
// them, and sends pushes the user's settings allow).
export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const list = usePersistentList<AppNotification>(STORAGE_KEYS.notifications);
  const [lastReadAt, setLastReadAt] = useState('');

  useEffect(() => {
    loadJSON<string>(STORAGE_KEYS.notificationsReadAt).then((saved) => setLastReadAt(saved ?? ''));
  }, []);

  const isUnread = (notification: AppNotification) => notification.created_at > lastReadAt;

  const value: NotificationsContextValue = {
    notifications: list.items,
    unreadCount: list.items.filter(isUnread).length,
    notify: (kind, taskId) =>
      list.add({
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        kind,
        task_id: taskId,
        created_at: new Date().toISOString(),
      }),
    markAllRead: async () => {
      const now = new Date().toISOString();
      setLastReadAt(now);
      await saveJSON(STORAGE_KEYS.notificationsReadAt, now);
    },
    isUnread,
    clearAll: async () => {
      await list.clearAll();
      setLastReadAt('');
      await removeKey(STORAGE_KEYS.notificationsReadAt);
    },
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
