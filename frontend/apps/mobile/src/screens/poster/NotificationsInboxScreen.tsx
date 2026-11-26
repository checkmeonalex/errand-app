import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../../components/Icon';
import { NotificationRow } from '../../components/NotificationRow';
import { SettingsPage } from '../../components/SettingsPage';
import { SettingsSection } from '../../components/SettingsSection';
import { useNotifications } from '../../context/NotificationsContext';
import { useTasks } from '../../context/TasksContext';
import { notificationText } from '../../utils/notificationText';
import { colors } from '../../theme/colors';
import { iconSizes, typography } from '../../theme/typography';

// The bell on home: everything that happened to the user's tasks, newest
// first. Opening it marks them read; unread ones stay highlighted until you
// leave, so you can see what's new.
export function NotificationsInboxScreen() {
  const navigation = useNavigation<any>();
  const { notifications, isUnread, markAllRead } = useNotifications();
  const { tasks } = useTasks();
  // Which were unread when the screen opened (kept highlighted while here).
  const [unreadOnOpen] = useState(() => new Set(notifications.filter(isUnread).map((n) => n.id)));

  useEffect(() => {
    markAllRead();
  }, []);

  return (
    <SettingsPage title="Notifications">
      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="notifications-outline" size={iconSizes.lg} color={colors.accentText} />
          <Text style={styles.emptyText}>
            Updates about your tasks (accepted, started, done, refunds and messages) will show here.
          </Text>
        </View>
      ) : (
        <SettingsSection>
          {notifications.map((notification) => {
            const task = tasks.find((t) => t.id === notification.task_id);
            const text = notificationText(notification.kind, task);
            return (
              <NotificationRow
                key={notification.id}
                icon={text.icon}
                title={text.title}
                body={text.body}
                createdAt={notification.created_at}
                unread={unreadOnOpen.has(notification.id)}
                onPress={() =>
                  navigation.navigate(text.opens === 'chat' ? 'ChatThread' : 'TaskDetail', {
                    taskId: notification.task_id,
                  })
                }
              />
            );
          })}
        </SettingsSection>
      )}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', marginTop: 48, gap: 10, paddingHorizontal: 12 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
