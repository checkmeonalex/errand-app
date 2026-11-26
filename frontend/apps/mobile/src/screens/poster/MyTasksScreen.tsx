import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { TaskCard } from '../../components/TaskCard';
import { useTasks } from '../../context/TasksContext';
import { openTask } from '../../navigation/openTask';
import { isActiveTask } from '../../utils/taskGroups';
import { colors } from '../../theme/colors';
import { iconSizes, typography } from '../../theme/typography';

type TaskListView = 'active' | 'completed';

const TABS: { value: TaskListView; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

// The "Tasks" tab: the poster's tasks split into Active (awaiting payment,
// live, accepted, in progress, disputed) and Completed (done, or closed and
// refunded), newest
// first. Tapping one opens it (or its payment, if unpaid) without leaving the tab.
export function MyTasksScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { tasks, isLoading } = useTasks();
  const [view, setView] = useState<TaskListView>('active');

  const shown = tasks.filter((task) => isActiveTask(task) === (view === 'active'));

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>My tasks</Text>
      <View style={styles.tabs}>
        <SegmentedTabs tabs={TABS} value={view} onChange={setView} />
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.navy} style={styles.loading} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(task) => task.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TaskCard task={item} onPress={() => openTask(navigation, item)} />
          )}
          ListEmptyComponent={
            view === 'active' ? (
              <EmptyState
                icon="checkbox-outline"
                title="No active tasks"
                text="Tasks you post show up here so you can track them."
                action={{ label: 'Post a task', onPress: () => navigation.navigate('Home') }}
              />
            ) : (
              <EmptyState
                icon="time-outline"
                title="Nothing here yet"
                text="Finished and refunded tasks move here, so you can check them or post them again."
              />
            )
          }
        />
      )}
    </View>
  );
}

function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  text: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={iconSizes.lg} color={colors.accentText} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      {action ? <PrimaryButton label={action.label} onPress={action.onPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  title: { ...typography.title, color: colors.textPrimary },
  tabs: { marginTop: 14 },
  loading: { marginTop: 32 },
  list: { paddingTop: 16, paddingBottom: 32, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...typography.heading, color: colors.textPrimary, marginTop: 14 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
});
