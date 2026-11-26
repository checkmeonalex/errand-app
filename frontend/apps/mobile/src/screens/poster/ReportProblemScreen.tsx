import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { Report, ReportReason } from '@errand/types';
import { BottomActionBar } from '../../components/BottomActionBar';
import { ChipRow } from '../../components/ChipRow';
import { DoneMessage } from '../../components/DoneMessage';
import { PhotoStrip } from '../../components/PhotoStrip';
import { SettingsPage } from '../../components/SettingsPage';
import { SettingsSection } from '../../components/SettingsSection';
import { SettingsRow } from '../../components/SettingsRow';
import { MAX_REPORT_PHOTOS, REPORT_REASONS, REPORT_WANTS } from '../../constants/reportReasons';
import { useFeedback } from '../../context/FeedbackContext';
import { useTasks } from '../../context/TasksContext';
import { reportKind } from '../../utils/feedbackRules';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// "Report a problem" for a task with a runner, in two steps (what happened →
// details). While money is held it opens a dispute and pauses the payment;
// after a task is done (within 48h) it's a report for Taskly to review.
// Route params: { taskId }.
export function ReportProblemScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks, openDispute } = useTasks();
  const { addReport, reportFor } = useFeedback();
  const task = tasks.find((t) => t.id === route.params?.taskId);

  const [reason, setReason] = useState<ReportReason | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [details, setDetails] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [wants, setWants] = useState<Report['wants']>();
  const [sending, setSending] = useState(false);
  // Set once sent: whether it opened a dispute (the task changes after).
  const [sentAs, setSentAs] = useState<'dispute' | 'report' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const kind = task ? reportKind(task) : null;

  if (sentAs) {
    return (
      <DoneMessage
        icon="checkmark"
        title="Report sent"
        text={
          sentAs === 'dispute'
            ? "Your payment is on hold. We'll reply in your task chat within 24 hours."
            : "Thanks for telling us. We'll look into it and reply in your task chat."
        }
        buttonLabel="Back to task"
        onDone={() => navigation.goBack()}
      />
    );
  }

  if (!task || !kind || reportFor(task.id)) {
    return (
      <SettingsPage
        title="Can't report this task"
        subtitle={
          task && reportFor(task.id)
            ? "You've already reported this task. We'll reply in your task chat."
            : 'Problems can be reported while a runner is on the task, or up to 48 hours after it\'s done.'
        }
      >
        {null}
      </SettingsPage>
    );
  }

  const isDispute = kind === 'dispute';
  const canSend = details.trim().length > 0 && (!isDispute || Boolean(wants));

  async function send() {
    if (!reason) return;
    setSending(true);
    setError(null);
    try {
      await addReport({
        task_id: task!.id,
        reason,
        details: details.trim(),
        photos,
        wants: isDispute ? wants : undefined,
        is_dispute: isDispute,
      });
      if (isDispute) await openDispute(task!.id);
      setSentAs(kind);
    } catch {
      setError("Couldn't send your report. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (step === 1) {
    return (
      <SettingsPage
        title="What happened?"
        subtitle="Step 1 of 2"
        footer={
          <BottomActionBar primary={{ label: 'Continue', onPress: () => setStep(2), disabled: !reason }} />
        }
      >
        <SettingsSection>
          {REPORT_REASONS.map((option) => (
            <SettingsRow
              key={option.id}
              icon={reason === option.id ? 'radio-button-on' : 'radio-button-off'}
              label={option.label}
              onPress={() => setReason(option.id)}
            />
          ))}
        </SettingsSection>
        {reason === 'rude-or-unsafe' ? (
          <View style={styles.safety}>
            <Text style={styles.safetyText}>
              If you're in danger right now, go somewhere busy and contact campus security or call 112.
            </Text>
          </View>
        ) : null}
      </SettingsPage>
    );
  }

  return (
    <SettingsPage
      title="Tell us more"
      subtitle={
        isDispute
          ? 'Step 2 of 2 · Your payment stays on hold while we look into it.'
          : 'Step 2 of 2 · We review every report.'
      }
      footer={
        <BottomActionBar
          primary={{ label: 'Send report', onPress: send, loading: sending, disabled: !canSend }}
          secondary={{ label: 'Back', onPress: () => setStep(1) }}
        />
      }
    >
      <Text style={styles.label}>What happened? (required)</Text>
      <TextInput
        style={styles.details}
        multiline
        placeholder="Describe what went wrong"
        placeholderTextColor={colors.textMuted}
        value={details}
        onChangeText={setDetails}
      />

      <Text style={styles.label}>Photos (optional, up to {MAX_REPORT_PHOTOS})</Text>
      <PhotoStrip photos={photos} onChange={setPhotos} max={MAX_REPORT_PHOTOS} />

      {isDispute ? (
        <>
          <Text style={styles.label}>What would you like?</Text>
          <ChipRow
            options={REPORT_WANTS.map((option) => option.label)}
            isSelected={(label) => REPORT_WANTS.find((option) => option.id === wants)?.label === label}
            onToggle={(label) => setWants(REPORT_WANTS.find((option) => option.label === label)?.id)}
          />
        </>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.sectionLabel, color: colors.textSecondary, marginTop: 24, marginBottom: 10 },
  details: {
    ...typography.input,
    color: colors.textPrimary,
    minHeight: 110,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  safety: { borderWidth: 1, borderColor: colors.warning, borderRadius: 12, padding: 14, marginTop: 16 },
  safetyText: { ...typography.body, color: colors.warning },
  error: { ...typography.hint, color: colors.warning, marginTop: 16 },
});
