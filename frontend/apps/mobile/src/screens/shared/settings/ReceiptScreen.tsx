import React from 'react';
import { View, Text, Share, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { Task } from '@errand/types';
import { BottomActionBar } from '../../../components/BottomActionBar';
import { SettingsPage } from '../../../components/SettingsPage';
import { getCategory, getSubcategory } from '../../../constants/categories';
import { formatNaira } from '../../../constants/priceSuggestions';
import { useTasks } from '../../../context/TasksContext';
import { formatDate } from '../../../utils/formatDate';
import { getPaymentState, paidAt, PAYMENT_STATE_LABEL, type PaymentState } from '../../../utils/paymentStatus';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

// Payment history → one payment. Shows only what the poster paid (never how
// Taskly earns) and what happened to the money. Route params: { taskId }.
// TODO: payments.receipt(taskId) from @errand/api for the Paystack reference
// and method; until then the task id stands in as the reference.
export function ReceiptScreen() {
  const route = useRoute<any>();
  const { tasks } = useTasks();
  const task = tasks.find((t) => t.id === route.params?.taskId);
  const state = task ? getPaymentState(task) : null;

  if (!task || !state) {
    return (
      <SettingsPage title="Receipt not found" subtitle="Go back and pick a payment from your history.">
        {null}
      </SettingsPage>
    );
  }

  const category = getCategory(task.category);
  const subcategory = getSubcategory(task.category, task.subcategory);
  const lines: [string, string][] = [
    ['Task', task.title],
    ['Category', [category?.label ?? 'Task', subcategory?.label].filter(Boolean).join(' · ')],
    ['Paid on', formatDate(paidAt(task))],
    ['Status', outcome(task, state)],
    ['Reference', task.id],
  ];

  const share = () =>
    Share.share({
      message: [`Taskly receipt: ${formatNaira(task.price)}`, ...lines.map(([label, value]) => `${label}: ${value}`)].join('\n'),
    }).catch(() => {}); // Closing the share sheet (or no share support on web) isn't an error.

  return (
    <SettingsPage
      title="Receipt"
      footer={<BottomActionBar primary={{ label: 'Share receipt', onPress: share }} />}
    >
      <View style={styles.amountBox}>
        <Text style={styles.amount}>{formatNaira(task.price)}</Text>
        <Text style={[styles.state, state === 'refunded' && styles.stateRefunded]}>{PAYMENT_STATE_LABEL[state]}</Text>
      </View>

      <View style={styles.card}>
        {lines.map(([label, value], index) => (
          <View key={label} style={[styles.line, index > 0 && styles.lineDivider]}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value} selectable>
              {value}
            </Text>
          </View>
        ))}
      </View>
    </SettingsPage>
  );
}

// One sentence on where the money is now.
function outcome(task: Task, state: PaymentState): string {
  switch (state) {
    case 'held':
      return 'Held safely until the task is done';
    case 'paid-out':
      return `Paid to ${task.runner?.first_name ?? 'your runner'} when the task was done`;
    case 'refunded':
      return 'Refunded in full to how you paid';
    case 'under-review':
      return 'Held while we look into the problem you reported';
  }
}

const styles = StyleSheet.create({
  amountBox: { alignItems: 'center', marginTop: 24, marginBottom: 20 },
  amount: { ...typography.title, color: colors.textPrimary },
  state: { ...typography.cardSubtitle, color: colors.textMuted, marginTop: 4 },
  stateRefunded: { color: colors.success },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14 },
  line: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  lineDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  label: { ...typography.body, color: colors.textMuted, width: 90 },
  value: { ...typography.body, color: colors.textPrimary, flex: 1, textAlign: 'right' },
});
