import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BottomActionBar } from '../../../components/BottomActionBar';
import { FormField } from '../../../components/FormField';
import { Icon } from '../../../components/Icon';
import { SettingsPage } from '../../../components/SettingsPage';
import { useAuth } from '../../../context/AuthContext';
import { useChat } from '../../../context/ChatContext';
import { useFeedback } from '../../../context/FeedbackContext';
import { useNotifications } from '../../../context/NotificationsContext';
import { useRunnerJobs } from '../../../context/RunnerJobsContext';
import { useSettings } from '../../../context/SettingsContext';
import { useTasks } from '../../../context/TasksContext';
import { isActiveTask } from '../../../utils/taskGroups';
import { wasPaid } from '../../../utils/taskTimeline';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

const CONFIRM_WORD = 'DELETE';

const WHAT_GETS_DELETED = [
  'Your profile, photo and settings',
  'Your chats, ratings, reports and notifications',
  'Your tasks and their details',
];

// Settings → Delete account. Required by the app stores and the Nigeria Data
// Protection Act. Blocked while money is still held for an active task.
export function DeleteAccountScreen() {
  const { deleteAccount } = useAuth();
  const { tasks, clearAll: clearTasks } = useTasks();
  const { clearAll: clearChats } = useChat();
  const { clearAll: clearSettings } = useSettings();
  const { clearAll: clearFeedback } = useFeedback();
  const { clearAll: clearNotifications } = useNotifications();
  const { clearAll: clearRunnerData } = useRunnerJobs();

  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Paid tasks still in play: the money must be released or refunded first.
  const blocking = tasks.filter((task) => isActiveTask(task) && wasPaid(task)).length;
  const canDelete = blocking === 0 && typed.trim().toUpperCase() === CONFIRM_WORD;

  async function remove() {
    setDeleting(true);
    await clearTasks();
    await clearChats();
    await clearSettings();
    await clearFeedback();
    await clearNotifications();
    await clearRunnerData();
    await deleteAccount(); // signs out → back to the start
  }

  return (
    <SettingsPage
      title="Delete account"
      subtitle="This can't be undone."
      footer={
        <BottomActionBar
          primary={{ label: 'Delete my account', onPress: remove, loading: deleting, disabled: !canDelete, danger: true }}
        />
      }
    >
      <Text style={styles.label}>What gets deleted</Text>
      {WHAT_GETS_DELETED.map((item) => (
        <View key={item} style={styles.bullet}>
          <Icon name="close-circle-outline" color={colors.warning} />
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
      <Text style={styles.note}>
        Payment records are kept for the period the law requires, without your name on them.
      </Text>

      {blocking > 0 ? (
        <View style={styles.blocked}>
          <Text style={styles.blockedText}>
            You have {blocking} paid {blocking === 1 ? 'task' : 'tasks'} still in progress. Finish or cancel{' '}
            {blocking === 1 ? 'it' : 'them'} first, so your money is released or refunded.
          </Text>
        </View>
      ) : (
        <FormField
          label={`Type ${CONFIRM_WORD} to confirm`}
          autoCapitalize="characters"
          value={typed}
          onChangeText={setTyped}
        />
      )}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.sectionLabel, color: colors.textSecondary, marginTop: 24, marginBottom: 6 },
  bullet: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  bulletText: { ...typography.body, color: colors.textPrimary },
  note: { ...typography.hint, color: colors.textMuted, marginTop: 12 },
  blocked: { borderWidth: 1, borderColor: colors.warning, borderRadius: 12, padding: 14, marginTop: 20 },
  blockedText: { ...typography.body, color: colors.warning },
});
