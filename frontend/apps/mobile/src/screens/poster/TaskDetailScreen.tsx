import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { Task } from '@errand/types';
import { BoostTaskCard } from '../../components/BoostTaskCard';
import { BottomActionBar } from '../../components/BottomActionBar';
import { DevTaskSimulator } from '../../components/DevTaskSimulator';
import { HandoverCode } from '../../components/HandoverCode';
import { Icon } from '../../components/Icon';
import { RateRunnerCard } from '../../components/RateRunnerCard';
import { RunnerCard } from '../../components/RunnerCard';
import { TextLink } from '../../components/TextLink';
import { StatusTimeline } from '../../components/StatusTimeline';
import { TaskAnswers } from '../../components/TaskAnswers';
import { getCategory, getSubcategory } from '../../constants/categories';
import { formatNaira } from '../../constants/priceSuggestions';
import { progressLabel } from '../../constants/progressUpdates';
import { useTasks } from '../../context/TasksContext';
import { useFeedback } from '../../context/FeedbackContext';
import { canRate, reportKind } from '../../utils/feedbackRules';
import { formatTime } from '../../utils/formatTime';
import { getTimeline, wasPaid } from '../../utils/taskTimeline';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// One of the poster's tasks: where it is (timeline), who's doing it, the
// handover code once work has started, what was asked, and the action that
// fits its status in a pinned bar. Route params: { taskId }.
// TODO: load from @errand/api tasks.get(taskId) instead of the local store.
export function TaskDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks, isLoading, cancelTask, releaseRunner, extendAcceptWindow } = useTasks();
  const task = tasks.find((t) => t.id === route.params?.taskId);

  // Cancel and Release ask for a second tap instead of a pop-up (works the
  // same on phones and web).
  const [confirming, setConfirming] = useState<'cancel' | 'release' | null>(null);
  const [busy, setBusy] = useState(false);
  const { reviewFor, reportFor } = useFeedback();

  // Open "Rate your runner" once, right as the task becomes done.
  const previousStatus = useRef(task?.status);
  useEffect(() => {
    const justCompleted = previousStatus.current !== 'completed' && task?.status === 'completed';
    previousStatus.current = task?.status;
    if (task && justCompleted && canRate(task) && !reviewFor(task.id)) {
      navigation.navigate('RateRunner', { taskId: task.id });
    }
  }, [task?.status]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>
          We couldn't find this task. Go back and check your Tasks tab.
        </Text>
      </View>
    );
  }

  const category = getCategory(task.category);
  const subcategory = getSubcategory(task.category, task.subcategory);
  const runnerName = task.runner?.first_name ?? 'The runner';

  async function run(action: (taskId: string) => Promise<void>) {
    setBusy(true);
    await action(task!.id);
    setBusy(false);
    setConfirming(null);
  }

  const postAgain = () =>
    navigation.navigate('Home', {
      screen: 'PostTask',
      params: { categoryId: task.category, subcategoryId: task.subcategory },
    });

  // Pinned actions for each status.
  const actions: Record<Task['status'], React.ComponentProps<typeof BottomActionBar>> = {
    'pending-payment': {
      primary: { label: `Pay ${formatNaira(task.price)}`, onPress: () => navigation.navigate('Checkout', { taskId: task.id }) },
      secondary: {
        label: confirming === 'cancel' ? 'Tap again to cancel this task' : 'Cancel task',
        onPress: () => (confirming === 'cancel' ? run(cancelTask) : setConfirming('cancel')),
      },
    },
    posted: {
      secondary: {
        label: confirming === 'cancel' ? 'Tap again to cancel and get a full refund' : 'Cancel and refund',
        onPress: () => (confirming === 'cancel' ? run(cancelTask) : setConfirming('cancel')),
      },
    },
    accepted: {
      primary: { label: `Chat with ${runnerName}`, onPress: () => navigation.navigate('ChatThread', { taskId: task.id }) },
      secondary: {
        label:
          confirming === 'release'
            ? `Tap again to release ${runnerName}`
            : `${runnerName} not replying? Release them`,
        onPress: () => (confirming === 'release' ? run(releaseRunner) : setConfirming('release')),
      },
    },
    'in-progress': {
      primary: { label: `Chat with ${runnerName}`, onPress: () => navigation.navigate('ChatThread', { taskId: task.id }) },
    },
    completed: { primary: { label: 'Post again', onPress: postAgain } },
    closed: { primary: { label: 'Post again', onPress: postAgain } },
    disputed: {},
  };
  const bar = actions[task.status];
  if (busy && bar.primary) bar.primary.loading = true;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <Icon name={subcategory?.icon ?? category?.icon ?? 'clipboard-outline'} color={colors.accentText} />
          </View>
          <Text style={styles.categoryText}>
            {category?.label ?? 'Task'}
            {subcategory ? ` · ${subcategory.label}` : ''}
          </Text>
        </View>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.price}>{formatNaira(task.price)}</Text>

        <View style={styles.card}>
          <StatusTimeline steps={getTimeline(task)} currentNote={currentNote(task)} />
          <Text style={styles.statusMessage}>{statusMessage(task)}</Text>
        </View>

        {task.status === 'posted' ? (
          <View style={styles.section}>
            <BoostTaskCard
              task={task}
              onRaisePrice={() => navigation.navigate('RaisePrice', { taskId: task.id })}
              onExtend={(minutes) => extendAcceptWindow(task.id, minutes)}
            />
          </View>
        ) : null}

        {task.runner && (task.status === 'accepted' || task.status === 'in-progress') ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Your runner</Text>
            <RunnerCard
              runner={task.runner}
              onPress={() => navigation.navigate('RunnerProfile', { taskId: task.id })}
            />
          </View>
        ) : null}

        {task.status === 'in-progress' && task.otp ? (
          <View style={styles.section}>
            <HandoverCode code={task.otp} />
          </View>
        ) : null}

        {task.runner && (canRate(task) || reviewFor(task.id)) ? (
          <View style={styles.section}>
            <RateRunnerCard
              runner={task.runner}
              review={reviewFor(task.id)}
              onRate={() => navigation.navigate('RateRunner', { taskId: task.id })}
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Task details</Text>
          <TaskAnswers task={task} />
        </View>

        {reportKind(task) && !reportFor(task.id) ? (
          <View style={styles.reportLink}>
            <TextLink
              label="Report a problem"
              onPress={() => navigation.navigate('ReportProblem', { taskId: task.id })}
            />
          </View>
        ) : null}

        <DevTaskSimulator task={task} />
      </ScrollView>

      <BottomActionBar {...bar} />
    </View>
  );
}

// Small line under the current timeline step: the runner's latest one-tap
// update ("On my way · 2:40 PM") when there is one.
function currentNote(task: Task): string | undefined {
  const latest = task.updates?.at(-1);
  if (latest && (task.status === 'accepted' || task.status === 'in-progress')) {
    return `${progressLabel(latest.kind)} · ${formatTime(latest.created_at)}`;
  }
  if (task.status === 'posted' && task.accept_by) return `Waiting for a runner until ${formatTime(task.accept_by)}`;
  if (task.status === 'accepted') return `${task.runner?.first_name ?? 'A runner'} accepted`;
  if (task.status === 'in-progress') return `${task.runner?.first_name ?? 'The runner'} is on it`;
  return undefined;
}

// One plain sentence on what's happening and what comes next.
function statusMessage(task: Task): string {
  const name = task.runner?.first_name ?? 'the runner';
  switch (task.status) {
    case 'pending-payment':
      return "Not live yet. Runners can't see this task until it's paid for.";
    case 'posted':
      return task.accept_by
        ? `Live for verified runners. If nobody accepts by ${formatTime(task.accept_by)}, it comes down and you get a full refund.`
        : 'Live for verified runners.';
    case 'accepted':
      return `Your handover code appears when ${name} starts the task. Chat to agree the details.`;
    case 'in-progress':
      return `${name} is working on it. Don't give them your code until your task is completed.`;
    case 'completed':
      return `Done. ${name} was paid when they entered your code.`;
    case 'closed':
      return wasPaid(task)
        ? 'This task came down before anyone did it, and your payment was refunded.'
        : 'You cancelled this task before paying, so nothing was charged.';
    case 'disputed':
      return "Our team is looking into this task. We'll message you in chat.";
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 32 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: { ...typography.cardSubtitle, color: colors.textMuted },
  title: { ...typography.title, color: colors.textPrimary, marginTop: 14 },
  price: { ...typography.title, color: colors.navy, marginTop: 4 },

  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  statusMessage: { ...typography.body, color: colors.textSecondary, marginTop: 4 },

  section: { marginTop: 24 },
  reportLink: { alignItems: 'center', marginTop: 24 },
  sectionLabel: { ...typography.sectionLabel, color: colors.textSecondary, marginBottom: 10 },

  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  centeredText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
