import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BadgeShelf } from '../../components/BadgeShelf';
import { LevelProgress } from '../../components/LevelProgress';
import { PressableScale } from '../../components/PressableScale';
import { ProfilePhotoButton } from '../../components/ProfilePhotoButton';
import { SettingsRow } from '../../components/SettingsRow';
import { SettingsSection } from '../../components/SettingsSection';
import { StatTile } from '../../components/StatTile';
import { TextLink } from '../../components/TextLink';
import { POSTER_LEVELS, RUNNER_LEVELS } from '../../constants/levels';
import { formatNaira } from '../../constants/priceSuggestions';
import { useAuth } from '../../context/AuthContext';
import { useMode } from '../../context/ModeContext';
import { useRunnerJobs } from '../../context/RunnerJobsContext';
import { useTasks } from '../../context/TasksContext';
import { getLevel } from '../../utils/getLevel';
import { inviteFriends } from '../../utils/inviteFriends';
import { completedCount, paidTaskCount, totalSpent } from '../../utils/taskStats';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const AVATAR_SIZE = 64;

// The user's profile: who they are, their stats and level for the current
// mode, badges, settings (each opens its own screen in ProfileStack), mode
// switch, log out and delete account. Every
// number comes from real data (their saved tasks now, the backend later).
export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { activeMode, hasRunnerAccess, switchMode } = useMode();
  const navigation = useNavigation<any>();
  const open = (screen: string) => navigation.navigate(screen);
  const { user, signOut } = useAuth();
  const { tasks } = useTasks();
  const { jobs } = useRunnerJobs();

  const isPoster = activeMode === 'poster';
  const otherMode = isPoster ? 'runner' : 'poster';
  const completed = completedCount(tasks);
  const jobsDone = completedCount(jobs);
  const level = getLevel(isPoster ? POSTER_LEVELS : RUNNER_LEVELS, isPoster ? completed : jobsDone);

  function handleSwitchPress() {
    if (otherMode === 'runner' && !hasRunnerAccess) {
      // Runners are added by the Taskly team; everyone else joins the waitlist.
      navigation.navigate('RunnerSignup');
      return;
    }
    switchMode(otherMode);
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.header}>
        <ProfilePhotoButton size={AVATAR_SIZE} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{user?.full_name || 'Your profile'}</Text>
          <Text style={styles.mode}>{isPoster ? 'Posting tasks' : 'Running tasks'}</Text>
        </View>
      </View>

      {isPoster ? (
        <View style={styles.stats}>
          <StatTile value={String(paidTaskCount(tasks))} label="Tasks posted" />
          <StatTile value={String(completed)} label="Completed" />
          <StatTile value={formatNaira(totalSpent(tasks))} label="Total spent" />
        </View>
      ) : (
        // Earnings live on runner home, so they aren't repeated here.
        <View style={styles.stats}>
          <StatTile value={String(jobsDone)} label="Tasks done" />
          <StatTile value={String(jobs.filter((job) => job.status === 'accepted' || job.status === 'in-progress').length)} label="On now" />
        </View>
      )}

      <View style={styles.card}>
        <LevelProgress level={level} />
      </View>

      <Text style={styles.sectionLabel}>Badges</Text>
      <BadgeShelf earned={user?.badges ?? []} side={isPoster ? 'poster' : 'runner'} />

      <SettingsSection title="Account">
        <SettingsRow icon="person-outline" label="Edit profile" onPress={() => open('EditProfile')} />
        <SettingsRow icon="lock-closed-outline" label="Change password" onPress={() => open('ChangePassword')} />
      </SettingsSection>

      {isPoster ? (
        <SettingsSection title="Payments">
          <SettingsRow icon="receipt-outline" label="Payment history" onPress={() => open('PaymentHistory')} />
        </SettingsSection>
      ) : null}

      <SettingsSection title="Settings">
        <SettingsRow icon="notifications-outline" label="Notifications" onPress={() => open('Notifications')} />
        <SettingsRow icon="shield-checkmark-outline" label="Privacy & safety" onPress={() => open('PrivacySafety')} />
        <SettingsRow icon="options-outline" label="Preferences" onPress={() => open('Preferences')} />
      </SettingsSection>

      <SettingsSection title="More">
        <SettingsRow icon="gift-outline" label="Invite friends" onPress={inviteFriends} />
        <SettingsRow icon="help-circle-outline" label="Help & support" onPress={() => open('HelpSupport')} />
        <SettingsRow icon="information-circle-outline" label="About" onPress={() => open('About')} />
      </SettingsSection>

      <PressableScale style={styles.switchButton} onPress={handleSwitchPress}>
        <Text style={styles.switchButtonText}>
          {otherMode === 'runner' && !hasRunnerAccess ? 'Become a runner' : `Switch to ${otherMode} mode`}
        </Text>
      </PressableScale>

      <View style={styles.logOut}>
        <TextLink label="Log out" onPress={signOut} />
      </View>

      <SettingsSection>
        <SettingsRow icon="trash-outline" label="Delete account" danger onPress={() => open('DeleteAccount')} />
      </SettingsSection>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerText: { flex: 1 },
  name: { ...typography.heading, color: colors.textPrimary },
  mode: { ...typography.body, color: colors.textMuted, marginTop: 2 },

  stats: { flexDirection: 'row', gap: 10, marginTop: 20 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  },
  sectionLabel: { ...typography.sectionLabel, color: colors.textSecondary, marginTop: 24, marginBottom: 10 },

  switchButton: {
    borderWidth: 1,
    borderColor: colors.navy,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  switchButtonText: { ...typography.button, color: colors.navy },
  logOut: { alignItems: 'center', marginTop: 24 },
});
