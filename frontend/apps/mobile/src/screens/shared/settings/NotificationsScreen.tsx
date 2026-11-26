import React from 'react';
import { SettingsPage } from '../../../components/SettingsPage';
import { SettingsSection } from '../../../components/SettingsSection';
import { ToggleRow } from '../../../components/ToggleRow';
import { NOTIFICATION_TYPES } from '../../../constants/notificationTypes';
import { useSettings } from '../../../context/SettingsContext';

// Settings → Notifications: on/off for each kind of notification.
export function NotificationsScreen() {
  const { settings, setNotification } = useSettings();

  return (
    <SettingsPage
      title="Notifications"
      subtitle="Choose what Taskly tells you about. Your choices are saved for when notifications go live."
    >
      <SettingsSection>
        {NOTIFICATION_TYPES.map((type) => (
          <ToggleRow
            key={type.key}
            label={type.label}
            hint={type.description}
            value={settings.notifications[type.key]}
            onChange={(on) => setNotification(type.key, on)}
          />
        ))}
      </SettingsSection>
    </SettingsPage>
  );
}
