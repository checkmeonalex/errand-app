import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TaskStatus } from '@errand/types';
import { Icon } from '../../components/Icon';
import { RunnerTaskCard } from '../../components/RunnerTaskCard';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { useRunnerJobs } from '../../context/RunnerJobsContext';
import { useTasks } from '../../context/TasksContext';
import { isActiveTask } from '../../utils/taskGroups';
import { colors } from '../../theme/colors';
import { iconSizes, typography } from '../../theme/typography';

type Tab = 'active' | 'completed';

const TABS: { value: Tab; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

// Where each job stands, in the runner's words.
const STATUS_LABEL: Partial<Record<TaskStatus, string>> = {
  accepted: 'Accepted',
  'in-progress': 'In progress',
  completed: 'Paid',
  disputed: 'Under review',
};

// The runner's jobs: Active (accepted, in progress, under review) and
// Completed (paid). Tap one to open it.
export function MyJobsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { isLoading } = useTasks();
  const { jobs } = useRunnerJobs();
  const [tab, setTab] = useState<Tab>('active');

  const shown = jobs.filter((job) => (tab === 'active' ? isActiveTask(job) : job.status === 'completed'));

  return (
    <ScrollView style={styles.root} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>My jobs</Text>
      <View style={styles.tabs}>
        <SegmentedTabs tabs={TABS} value={tab} onChange={setTab} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.navy} style={styles.loading} />
      ) : shown.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="briefcase-outline" size={iconSizes.lg} color={colors.accentText} />
          <Text style={styles.emptyText}>
            {tab === 'active' ? 'Tasks you accept show here.' : 'Tasks you finish show here.'}
          </Text>
        </View>
      ) : (
        shown.map((job) => (
          <RunnerTaskCard
            key={job.id}
            task={job}
            statusLabel={STATUS_LABEL[job.status]}
            onPress={() => navigation.navigate('RunnerJob', { taskId: job.id })}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { ...typography.title, color: colors.textPrimary },
  tabs: { marginTop: 16, marginBottom: 16 },
  loading: { marginTop: 32 },
  empty: { alignItems: 'center', marginTop: 48, gap: 10 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
