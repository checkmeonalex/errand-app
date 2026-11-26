import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { Task } from '@errand/types';
import { Avatar } from '../../components/Avatar';
import { BottomActionBar } from '../../components/BottomActionBar';
import { BringNote } from '../../components/BringNote';
import { ChipRow } from '../../components/ChipRow';
import { StatusTimeline } from '../../components/StatusTimeline';
import { TaskAnswers } from '../../components/TaskAnswers';
import { TextLink } from '../../components/TextLink';
import { formatNaira } from '../../constants/priceSuggestions';
import { ON_MY_WAY, progressLabel, progressUpdatesFor } from '../../constants/progressUpdates';
import { DROPS_BEFORE_REVIEW, FREE_DROP_MINUTES } from '../../constants/runnerRules';
import { dropCounts, useRunnerJobs } from '../../context/RunnerJobsContext';
import { useTasks } from '../../context/TasksContext';
import { formatTime } from '../../utils/formatTime';
import { payoutFor } from '../../utils/runnerPayout';
import { hasLeft, runnerTimeline } from '../../utils/runnerTimeline';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// One job the runner accepted. A single big next-step button walks them
// through it (On my way → Start task → Enter handover code), with one-tap
// updates the poster sees, chat, and Drop before starting. Route params: { taskId }.
export function RunnerJobScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks, isLoading } = useTasks();
  const { postUpdate, startTask, dropTask, countedDrops } = useRunnerJobs();
  const task = tasks.find((t) => t.id === route.params?.taskId);
  const [busy, setBusy] = useState(false);
  const [confirmingDrop, setConfirmingDrop] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  if (!task || !task.runner) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>This task isn't yours any more. Go back to your jobs.</Text>
      </View>
    );
  }

  const posterName = task.poster?.first_name ?? 'the poster';
  const active = task.status === 'accepted' || task.status === 'in-progress';
  const latest = task.updates?.at(-1);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    await action();
    setBusy(false);
  }

  async function drop() {
    await dropTask(task!.id);
    navigation.goBack();
  }

  const openChat = () => navigation.navigate('ChatThread', { taskId: task.id, viewer: 'runner' });
  const next = nextStep(task);

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.earn}>You earn {formatNaira(payoutFor(task))}</Text>

        <View style={styles.card}>
          <StatusTimeline
            steps={runnerTimeline(task)}
            currentNote={latest ? `${progressLabel(latest.kind)} · ${formatTime(latest.created_at)}` : undefined}
          />
          <Text style={styles.statusMessage}>{statusMessage(task, posterName)}</Text>
        </View>

        {active ? (
          <>
            <Text style={styles.sectionLabel}>Quick update for {posterName}</Text>
            <ChipRow
              options={progressUpdatesFor(task.category, task.subcategory).map((update) => update.label)}
              isSelected={(label) => (latest ? progressLabel(latest.kind) === label : false)}
              onToggle={(label) => {
                const update = progressUpdatesFor(task.category, task.subcategory).find((u) => u.label === label);
                if (update) postUpdate(task.id, update.id);
              }}
            />
          </>
        ) : null}

        <View style={styles.posterRow}>
          <Avatar uri={task.poster?.avatar_url} name={posterName} size={40} />
          <View style={styles.posterText}>
            <Text style={styles.posterLabel}>Posted by</Text>
            <Text style={styles.posterName}>{posterName}</Text>
          </View>
          <TextLink label="Chat" onPress={openChat} />
        </View>

        <BringNote task={task} />

        <Text style={styles.sectionLabel}>Task details</Text>
        <TaskAnswers task={task} />

        {task.status === 'accepted' ? (
          <View style={styles.drop}>
            <TextLink
              label={
                confirmingDrop
                  ? dropCounts(task)
                    ? `Tap again to drop. This counts against you (${countedDrops + 1} of ${DROPS_BEFORE_REVIEW}).`
                    : `Tap again to drop. It's free within ${FREE_DROP_MINUTES} minutes of accepting.`
                  : "Can't do it any more? Drop this task"
              }
              onPress={() => (confirmingDrop ? drop() : setConfirmingDrop(true))}
            />
            {confirmingDrop ? null : (
              <Text style={styles.dropHint}>Free in the first {FREE_DROP_MINUTES} minutes after accepting.</Text>
            )}
          </View>
        ) : null}
      </ScrollView>

      <BottomActionBar
        primary={
          next
            ? {
                label: next.label,
                loading: busy,
                onPress: () =>
                  next.kind === 'code'
                    ? navigation.navigate('HandoverCodeEntry', { taskId: task.id })
                    : run(() => (next.kind === 'leave' ? postUpdate(task.id, ON_MY_WAY.id) : startTask(task.id))),
              }
            : undefined
        }
        secondary={active ? { label: `Chat with ${posterName}`, onPress: openChat } : undefined}
      />
    </View>
  );
}

// The runner's one main action for where the job is; null when there's none.
function nextStep(task: Task): { kind: 'leave' | 'start' | 'code'; label: string } | null {
  if (task.status === 'accepted') return hasLeft(task) ? { kind: 'start', label: 'Start task' } : { kind: 'leave', label: "I'm on my way" };
  if (task.status === 'in-progress') return { kind: 'code', label: 'Enter handover code' };
  return null;
}

function statusMessage(task: Task, posterName: string): string {
  switch (task.status) {
    case 'accepted':
      return hasLeft(task)
        ? `Tap Start task when you begin. ${posterName} then gets the handover code.`
        : `Say hello to ${posterName} in the chat and agree where to meet.`;
    case 'in-progress':
      return `At handover, ask ${posterName} for their code and enter it to get paid.`;
    case 'completed':
      return `Done. ${formatNaira(payoutFor(task))} is on its way to your bank.`;
    case 'disputed':
      return "This task is under review. Your pay is held until it's sorted; we'll reply in the chat within 24 hours.";
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.background },
  centeredText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  title: { ...typography.title, color: colors.textPrimary },
  earn: { ...typography.heading, color: colors.success, marginTop: 6 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 16, marginTop: 18 },
  statusMessage: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  sectionLabel: { ...typography.sectionLabel, color: colors.textSecondary, marginTop: 24, marginBottom: 10 },
  posterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
  posterText: { flex: 1 },
  posterLabel: { ...typography.cardSubtitle, color: colors.textMuted },
  posterName: { ...typography.cardTitle, color: colors.textPrimary },
  drop: { alignItems: 'center', marginTop: 28, gap: 4 },
  dropHint: { ...typography.hint, color: colors.textMuted },
});
