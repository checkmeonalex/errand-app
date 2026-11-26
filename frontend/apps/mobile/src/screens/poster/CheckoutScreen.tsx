import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BottomActionBar } from '../../components/BottomActionBar';
import { CheckoutSummary } from '../../components/CheckoutSummary';
import { DevPaystackSheet, type MockPaymentResult } from '../../components/DevPaystackSheet';
import { Icon } from '../../components/Icon';
import { PaymentStatus } from '../../components/PaymentStatus';
import { formatNaira } from '../../constants/priceSuggestions';
import { useTasks } from '../../context/TasksContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Step after "Continue to payment": the poster pays the full price BEFORE the
// task goes live, so every task a runner sees is already paid for (overview
// §5). Taskly only shows what's being paid for and the Pay button; Paystack's
// own secure page (card, bank transfer or USSD) takes the payment, so card
// details never touch the app. Route params: { taskId }.
//
// TODO (backend): on Pay, call @errand/api payments.initialize(taskId,
// paymentReturnUrl()) → openPaystackCheckout(checkoutUrl) (both ready in
// src/utils/openPaystackCheckout.ts) → show "Checking…" while polling
// payments.status(taskId) → paid / transfer pending / failed. The backend
// marks the task live after Paystack's webhook confirms.
// Until then, dev builds open DevPaystackSheet to fake the outcome.
export function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks, payForTask } = useTasks();
  const task = tasks.find((t) => t.id === route.params?.taskId);

  const [sheetOpen, setSheetOpen] = useState(false);
  // After Paystack closes: confirming, or a bank transfer still on its way.
  const [phase, setPhase] = useState<'form' | 'checking' | 'awaiting-transfer'>('form');
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null);

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>
          We couldn't find this task. Go back and check your Tasks tab.
        </Text>
      </View>
    );
  }

  const goHome = () => navigation.popToTop();

  if (task.status !== 'pending-payment') {
    return (
      <PaymentStatus
        kind="paid"
        title={task.title}
        acceptBy={task.status === 'posted' ? task.accept_by : undefined}
        onDone={goHome}
      />
    );
  }

  async function confirmPayment() {
    setPhase('checking');
    try {
      await payForTask(task!.id);
    } catch {
      setPhase('form');
      setNotice({ text: "We couldn't confirm your payment. Check your Tasks tab before paying again.", isError: true });
    }
  }

  if (phase === 'checking') return <PaymentStatus kind="checking" />;
  if (phase === 'awaiting-transfer') {
    return <PaymentStatus kind="awaiting-transfer" onDone={goHome} devArrive={confirmPayment} />;
  }

  async function handleResult(result: MockPaymentResult) {
    setSheetOpen(false);
    if (result === 'cancelled') {
      setNotice({ text: 'Payment cancelled. Your task is saved under Awaiting payment.', isError: false });
      return;
    }
    if (result === 'failed') {
      setNotice({ text: "Payment didn't go through. You haven't been charged. Try again.", isError: true });
      return;
    }
    if (result === 'transfer-pending') {
      setPhase('awaiting-transfer');
      return;
    }
    await confirmPayment();
  }

  function handlePay() {
    setNotice(null);
    if (__DEV__) {
      setSheetOpen(true);
    } else {
      // TODO (backend): real Paystack flow (see top of file).
      confirmPayment();
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Checkout</Text>
        <View style={styles.section}>
          <CheckoutSummary task={task} />
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatNaira(task.price)}</Text>
        </View>

        <View style={styles.safety}>
          <Icon name="shield-checkmark-outline" color={colors.accentText} />
          <Text style={styles.safetyText}>
            Your money is held safely and only released when you give your handover code. Full
            refund if nobody accepts in time.
          </Text>
        </View>

        {notice ? (
          <Text style={[styles.notice, notice.isError && styles.noticeError]}>{notice.text}</Text>
        ) : null}
      </ScrollView>

      <BottomActionBar
        primary={{ label: `Pay ${formatNaira(task.price)}`, onPress: handlePay }}
        footnote="Card, bank transfer or USSD · Secured by Paystack"
      />

      <DevPaystackSheet visible={sheetOpen} amount={task.price} onResult={handleResult} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 24 },
  title: { ...typography.title, color: colors.textPrimary },
  section: { marginTop: 16 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { ...typography.sectionLabel, color: colors.textSecondary },
  totalAmount: { ...typography.title, color: colors.navy },

  safety: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },
  safetyText: { ...typography.body, color: colors.accentText, flex: 1 },
  notice: { ...typography.hint, color: colors.textSecondary, marginTop: 16 },
  noticeError: { color: colors.warning },

  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  centeredText: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
});
