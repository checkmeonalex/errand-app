import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChipRow } from '../../components/ChipRow';
import { EarningsCard } from '../../components/EarningsCard';
import { Icon } from '../../components/Icon';
import { ProfilePhotoButton } from '../../components/ProfilePhotoButton';
import { RunnerTaskCard } from '../../components/RunnerTaskCard';
import { getCategory } from '../../constants/categories';
import { MAX_ACTIVE_JOBS } from '../../constants/runnerRules';
import { useAuth } from '../../context/AuthContext';
import { useRunnerJobs } from '../../context/RunnerJobsContext';
import { useTasks } from '../../context/TasksContext';
import { useGreeting } from '../../hooks/useGreeting';
import { getFirstName } from '../../utils/getFirstName';
import { runnerEarnings } from '../../utils/runnerEarnings';
import { colors } from '../../theme/colors';
import { iconSizes, typography } from '../../theme/typography';

const ALL = 'All';
const HEADER_AVATAR_SIZE = 44;

// Runner home: greeting + earnings in the navy header, then the live tasks
// they can take, filtered by category. Tap a task to see it and accept.
export function RunnerHomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const greeting = useGreeting();
  const { user } = useAuth();
  const { isLoading } = useTasks();
  const { feed, jobs, activeJobs, canAcceptMore, categories } = useRunnerJobs();
  const [filter, setFilter] = useState(ALL);

  const earnings = runnerEarnings(jobs);
  const filterLabels = [ALL, ...categories.map((id) => getCategory(id)?.label ?? id)];
  const shown = filter === ALL ? feed : feed.filter((task) => getCategory(task.category)?.label === filter);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.identity}>
          <ProfilePhotoButton size={HEADER_AVATAR_SIZE} onViewProfile={() => navigation.navigate('Profile')} />
          <View style={styles.greetingText}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.greetingName} numberOfLines={1}>
              Hi {getFirstName(user?.full_name) ?? 'there'}
            </Text>
          </View>
        </View>
        <EarningsCard {...earnings} onPress={() => navigation.navigate('Earnings')} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Find tasks</Text>
          <Text style={styles.jobCount}>
            {activeJobs.length} of {MAX_ACTIVE_JOBS} tasks
          </Text>
        </View>

        {canAcceptMore ? null : (
          <View style={styles.limitBanner}>
            <Icon name="information-circle-outline" size={iconSizes.sm} color={colors.accentText} />
            <Text style={styles.limitText}>
              You have {MAX_ACTIVE_JOBS} tasks on. Finish one to take another.
            </Text>
          </View>
        )}

        <ChipRow options={filterLabels} isSelected={(label) => label === filter} onToggle={setFilter} />

        <View style={styles.list}>
          {isLoading ? (
            <ActivityIndicator color={colors.navy} style={styles.loading} />
          ) : shown.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="search-outline" size={iconSizes.lg} color={colors.accentText} />
              <Text style={styles.emptyTitle}>No tasks right now</Text>
              <Text style={styles.emptyText}>New tasks in your categories show up here.</Text>
            </View>
          ) : (
            shown.map((task) => (
              <RunnerTaskCard
                key={task.id}
                task={task}
                onPress={() => navigation.navigate('RunnerTaskPreview', { taskId: task.id })}
              />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 32 },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greetingText: { flex: 1 },
  greeting: { ...typography.greeting, color: colors.navyMuted },
  greetingName: { ...typography.title, color: colors.white, marginTop: 2 },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { ...typography.heading, color: colors.textPrimary },
  jobCount: { ...typography.cardSubtitle, color: colors.textMuted },
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  limitText: { ...typography.cardSubtitle, color: colors.accentText, flex: 1 },
  list: { marginTop: 14 },
  loading: { marginTop: 32 },
  empty: { alignItems: 'center', marginTop: 40, gap: 6 },
  emptyTitle: { ...typography.cardTitle, color: colors.textPrimary },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
