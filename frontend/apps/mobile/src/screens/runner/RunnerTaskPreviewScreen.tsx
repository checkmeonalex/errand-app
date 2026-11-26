import React, { useState } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AcceptRulesSheet } from '../../components/AcceptRulesSheet';
import { BottomActionBar } from '../../components/BottomActionBar';
import { BringNote } from '../../components/BringNote';
import { DoneMessage } from '../../components/DoneMessage';
import { Icon } from '../../components/Icon';
import { TaskAnswers } from '../../components/TaskAnswers';
import { getCategory, getSubcategory } from '../../constants/categories';
import { formatNaira } from '../../constants/priceSuggestions';
import { LOCAL_USER_ID } from '../../constants/localUser';
import { MAX_ACTIVE_JOBS } from '../../constants/runnerRules';
import { useRunnerJobs } from '../../context/RunnerJobsContext';
import { useTasks } from '../../context/TasksContext';
import { feeFor, payoutFor } from '../../utils/runnerPayout';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// A live task before accepting: what you'd earn (and Taskly's fee, shown to
// runners only), what to bring, the poster's answers, and Accept. The first
// accept ever shows the rules; after that it's one tap. Route params: { taskId }.
export function RunnerTaskPreviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks } = useTasks();
  const { acceptTask, canAcceptMore, rulesSeen, markRulesSeen } = useRunnerJobs();
  const task = tasks.find((t) => t.id === route.params?.taskId);

  const [rulesOpen, setRulesOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [taken, setTaken] = useState(false);

  // Just accepted by this runner: the job screen is replacing this one.
  if (!taken && task?.runner_id === LOCAL_USER_ID) return null;

  // Gone from the feed (accepted by someone else, cancelled or expired).
  if (taken || !task || task.status !== 'posted') {
    return (
      <DoneMessage
        icon="close-circle-outline"
        title="This task is taken"
        text="It's no longer available. Find another one in your feed."
        buttonLabel="Back to tasks"
        onDone={() => navigation.goBack()}
      />
    );
  }

  const category = getCategory(task.category);
  const subcategory = getSubcategory(task.category, task.subcategory);

  async function accept() {
    setRulesOpen(false);
    setBusy(true);
    if (!rulesSeen) await markRulesSeen();
    const result = await acceptTask(task!.id);
    setBusy(false);
    if (result === 'taken') setTaken(true);
    // Swap the preview for the job, so Back goes to the feed.
    if (result === 'accepted') navigation.replace('RunnerJob', { taskId: task!.id });
  }

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
        <Text style={styles.earn}>You earn {formatNaira(payoutFor(task))}</Text>
        <Text style={styles.fee}>
          Task {formatNaira(task.price)} · Taskly fee {formatNaira(feeFor(task.price))}
        </Text>

        <BringNote task={task} />

        <Text style={styles.sectionLabel}>Task details</Text>
        <TaskAnswers task={task} />
      </ScrollView>

      <BottomActionBar
        primary={{
          label: 'Accept task',
          loading: busy,
          disabled: !canAcceptMore,
          onPress: () => (rulesSeen ? accept() : setRulesOpen(true)),
        }}
        footnote={canAcceptMore ? undefined : `You have ${MAX_ACTIVE_JOBS} tasks on. Finish one to take another.`}
      />

      <AcceptRulesSheet visible={rulesOpen} onAccept={accept} onClose={() => setRulesOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: { ...typography.cardSubtitle, color: colors.accentText },
  title: { ...typography.title, color: colors.textPrimary, marginTop: 14 },
  earn: { ...typography.heading, color: colors.success, marginTop: 8 },
  fee: { ...typography.hint, color: colors.textMuted, marginTop: 2 },
  sectionLabel: { ...typography.sectionLabel, color: colors.textSecondary, marginTop: 24, marginBottom: 4 },
});
