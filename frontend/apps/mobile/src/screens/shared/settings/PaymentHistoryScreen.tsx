import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '../../../components/Icon';
import { PaymentHistoryRow } from '../../../components/PaymentHistoryRow';
import { SettingsPage } from '../../../components/SettingsPage';
import { SettingsSection } from '../../../components/SettingsSection';
import { StatTile } from '../../../components/StatTile';
import { formatNaira } from '../../../constants/priceSuggestions';
import { useTasks } from '../../../context/TasksContext';
import { getPaymentState, paidAt } from '../../../utils/paymentStatus';
import { totalSpent } from '../../../utils/taskStats';
import { colors } from '../../../theme/colors';
import { iconSizes, typography } from '../../../theme/typography';

// Settings → Payment history: every task the user paid for, newest first,
// with what happened to the money. Built from their real tasks.
// Tapping a payment opens its receipt.
export function PaymentHistoryScreen() {
  const navigation = useNavigation<any>();
  const { tasks, isLoading } = useTasks();

  const payments = tasks
    .flatMap((task) => {
      const state = getPaymentState(task);
      return state ? [{ task, state, paidAt: paidAt(task) }] : [];
    })
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));

  const refunded = payments
    .filter((payment) => payment.state === 'refunded')
    .reduce((sum, payment) => sum + payment.task.price, 0);

  return (
    <SettingsPage title="Payment history">
      {isLoading ? (
        <ActivityIndicator color={colors.navy} style={styles.loading} />
      ) : payments.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="receipt-outline" size={iconSizes.lg} color={colors.accentText} />
          <Text style={styles.emptyText}>Payments for your tasks will show here.</Text>
        </View>
      ) : (
        <>
          <View style={styles.stats}>
            <StatTile value={formatNaira(totalSpent(tasks))} label="Paid to runners" />
            <StatTile value={formatNaira(refunded)} label="Refunded" />
          </View>
          <SettingsSection>
            {payments.map((payment) => (
              <PaymentHistoryRow
                key={payment.task.id}
                task={payment.task}
                state={payment.state}
                paidAt={payment.paidAt}
                onPress={() => navigation.navigate('Receipt', { taskId: payment.task.id })}
              />
            ))}
          </SettingsSection>
        </>
      )}
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 32 },
  empty: { alignItems: 'center', marginTop: 48, gap: 10 },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: 10, marginTop: 20 },
});
