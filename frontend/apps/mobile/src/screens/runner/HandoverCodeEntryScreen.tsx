import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BottomActionBar } from '../../components/BottomActionBar';
import { CodeInput } from '../../components/CodeInput';
import { DoneMessage } from '../../components/DoneMessage';
import { formatNaira } from '../../constants/priceSuggestions';
import { HANDOVER_CODE_LENGTH as CODE_LENGTH } from '../../constants/runnerRules';
import { useRunnerJobs } from '../../context/RunnerJobsContext';
import { useTasks } from '../../context/TasksContext';
import { payoutFor } from '../../utils/runnerPayout';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// At handover: the runner types the poster's code. Right → payment released.
// Too many wrong tries locks the task for review. Route params: { taskId }.
export function HandoverCodeEntryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks } = useTasks();
  const { enterCode } = useRunnerJobs();
  const task = tasks.find((t) => t.id === route.params?.taskId);

  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<'released' | 'locked' | null>(null);

  if (outcome === 'released' && task) {
    return (
      <DoneMessage
        icon="checkmark-circle-outline"
        title="Payment released"
        text={`${formatNaira(payoutFor(task))} is on its way to your bank. Nice work!`}
        buttonLabel="Back to my jobs"
        onDone={() => navigation.goBack()}
      />
    );
  }

  if (outcome === 'locked') {
    return (
      <DoneMessage
        icon="lock-closed-outline"
        title="Task locked for review"
        text="Too many wrong codes. Your pay is held while we look into it; we'll reply in the chat within 24 hours."
        buttonLabel="Back to my jobs"
        onDone={() => navigation.goBack()}
      />
    );
  }

  if (!task || task.status !== 'in-progress') {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>The code can only be entered while the task is in progress.</Text>
      </View>
    );
  }

  async function submit(value = code) {
    if (value.length !== CODE_LENGTH) return;
    setBusy(true);
    const { result, attemptsLeft } = await enterCode(task!.id, value);
    setBusy(false);
    if (result === 'wrong') {
      setCode('');
      setError(`That code isn't right. ${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'} left.`);
    } else {
      setOutcome(result);
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter the handover code</Text>
        <Text style={styles.subtitle}>
          Ask {task.poster?.first_name ?? 'the poster'} for their code once you've handed everything over.
        </Text>
        <View style={styles.code}>
          <CodeInput
            length={CODE_LENGTH}
            value={code}
            onChange={(value) => {
              setCode(value);
              setError(null);
            }}
            onComplete={submit}
            hasError={Boolean(error)}
          />
        </View>
        <Text style={error ? styles.error : styles.hint}>{error ?? 'Never accept the code before the handover.'}</Text>
        {__DEV__ && task.otp ? <Text style={styles.devHint}>DEV: the poster's code is {task.otp}</Text> : null}
      </View>
      <BottomActionBar
        primary={{ label: 'Release payment', loading: busy, disabled: code.length !== CODE_LENGTH, onPress: () => submit() }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 20 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.background },
  centeredText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: 6 },
  code: { marginTop: 32 },
  hint: { ...typography.hint, color: colors.textMuted, textAlign: 'center', marginTop: 14 },
  error: { ...typography.hint, color: colors.warning, textAlign: 'center', marginTop: 14 },
  devHint: { ...typography.hint, color: colors.warning, textAlign: 'center', marginTop: 24 },
});
