import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { NOTIFICATION_TYPES, type NotificationKey } from '../constants/notificationTypes';
import { loadJSON, removeKey, saveJSON, STORAGE_KEYS } from '../storage/storage';
import { setHapticsEnabled } from '../utils/haptics';

export type Settings = {
  notifications: Record<NotificationKey, boolean>;
  // Pre-fills "Where?" on new tasks; empty = no default.
  defaultMeetingSpot: string;
  hapticsEnabled: boolean;
};

const DEFAULTS: Settings = {
  notifications: Object.fromEntries(NOTIFICATION_TYPES.map((type) => [type.key, true])) as Record<
    NotificationKey,
    boolean
  >,
  defaultMeetingSpot: '',
  hapticsEnabled: true,
};

type SettingsContextValue = {
  settings: Settings;
  isLoading: boolean;
  setNotification: (key: NotificationKey, on: boolean) => Promise<void>;
  setDefaultMeetingSpot: (spot: string) => Promise<void>;
  setHaptics: (on: boolean) => Promise<void>;
  // Back to defaults (used by Delete account).
  clearAll: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

// The user's app preferences, saved on this device.
// TODO: also save notification preferences via @errand/api profile.update so
// the backend only sends pushes the user wants.
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);
  const settingsRef = useRef<Settings>(DEFAULTS);

  useEffect(() => {
    loadJSON<Partial<Settings>>(STORAGE_KEYS.settings).then((saved) => {
      // Merge so settings added in later versions get their defaults.
      const merged: Settings = {
        ...DEFAULTS,
        ...saved,
        notifications: { ...DEFAULTS.notifications, ...saved?.notifications },
      };
      settingsRef.current = merged;
      setSettings(merged);
      setHapticsEnabled(merged.hapticsEnabled);
      setIsLoading(false);
    });
  }, []);

  async function commit(change: (current: Settings) => Settings) {
    settingsRef.current = change(settingsRef.current);
    setSettings(settingsRef.current);
    setHapticsEnabled(settingsRef.current.hapticsEnabled);
    await saveJSON(STORAGE_KEYS.settings, settingsRef.current);
  }

  const value: SettingsContextValue = {
    settings,
    isLoading,
    setNotification: (key, on) =>
      commit((current) => ({ ...current, notifications: { ...current.notifications, [key]: on } })),
    setDefaultMeetingSpot: (spot) => commit((current) => ({ ...current, defaultMeetingSpot: spot.trim() })),
    setHaptics: (on) => commit((current) => ({ ...current, hapticsEnabled: on })),
    clearAll: async () => {
      settingsRef.current = DEFAULTS;
      setSettings(DEFAULTS);
      setHapticsEnabled(true);
      await removeKey(STORAGE_KEYS.settings);
    },
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
