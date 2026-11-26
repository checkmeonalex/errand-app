import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Task } from '@errand/types';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { getCategory } from '../constants/categories';
import { formatNaira } from '../constants/priceSuggestions';
import { formatDate } from '../utils/formatDate';
import { PAYMENT_STATE_LABEL, type PaymentState } from '../utils/paymentStatus';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type PaymentHistoryRowProps = {
  task: Pick<Task, 'title' | 'category' | 'price'>;
  state: PaymentState;
  paidAt: string;
  // Opens the receipt.
  onPress: () => void;
};

// One payment: task, when it was paid, the amount and what happened to it.
// Tapping opens its receipt.
export function PaymentHistoryRow({ task, state, paidAt, onPress }: PaymentHistoryRowProps) {
  const category = getCategory(task.category);
  const refunded = state === 'refunded';

  return (
    <PressableScale accessibilityRole="button" style={styles.row} onPress={onPress}>
      <View style={styles.iconBadge}>
        <Icon name={category?.icon ?? 'receipt-outline'} color={colors.accentText} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={styles.meta}>{formatDate(paidAt)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, refunded && styles.amountRefunded]}>
          {refunded ? '+' : ''}
          {formatNaira(task.price)}
        </Text>
        <Text style={[styles.state, refunded && styles.stateRefunded]}>{PAYMENT_STATE_LABEL[state]}</Text>
      </View>
      <Icon name="chevron-forward" color={colors.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { ...typography.cardTitle, color: colors.textPrimary },
  meta: { ...typography.cardSubtitle, color: colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { ...typography.cardTitle, color: colors.textPrimary },
  amountRefunded: { color: colors.success },
  state: { ...typography.hint, color: colors.textMuted, marginTop: 2 },
  stateRefunded: { color: colors.success },
});
