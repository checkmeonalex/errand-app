import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BottomActionBar } from '../../components/BottomActionBar';
import { ChipRow } from '../../components/ChipRow';
import { DevPaystackSheet, type MockPaymentResult } from '../../components/DevPaystackSheet';
import { DoneMessage } from '../../components/DoneMessage';
import { SettingsPage } from '../../components/SettingsPage';
import { formatNaira, PRICE_RAISE_STEPS as RAISE_STEPS } from '../../constants/priceSuggestions';
import { useTasks } from '../../context/TasksContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const stepLabel = (step: number) => `+${formatNaira(step)}`;

// "Raise price" on a live task nobody has accepted. The poster pays only the
// difference (held in escrow like the rest); runners see the new price.
// Route params: { taskId }.
// TODO: payments.initialize(taskId, { topUp: difference }) → Paystack → then
// tasks.raisePrice once the top-up clears. Dev builds use DevPaystackSheet.
export function RaisePriceScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tasks, raisePrice } = useTasks();
  const task = tasks.find((t) => t.id === route.params?.taskId);

  const [newPrice, setNewPrice] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (done && task) {
    return (
      <DoneMessage
        icon="trending-up-outline"
        title={`Price raised to ${formatNaira(task.price)}`}
        text="Runners see the new price now."
        buttonLabel="Back to task"
        onDone={() => navigation.goBack()}
      />
    );
  }

  if (!task || task.status !== 'posted') {
    return (
      <SettingsPage title="Can't change the price" subtitle="Prices can only be raised while a task is live and nobody has accepted it.">
        {null}
      </SettingsPage>
    );
  }

  const target = Number(newPrice) || 0;
  const difference = target - task.price;
  const isValid = difference > 0;

  async function handleResult(result: MockPaymentResult) {
    setSheetOpen(false);
    if (result === 'success') {
      await raisePrice(task!.id, target);
      setDone(true);
    } else if (result === 'failed') {
      setNotice("Payment didn't go through. You haven't been charged.");
    } else if (result === 'transfer-pending') {
      setNotice("We'll raise the price once your transfer arrives.");
    }
  }

  return (
    <SettingsPage
      title="Raise price"
      subtitle={`Now ${formatNaira(task.price)}. You only pay the difference.`}
      footer={
        <BottomActionBar
          primary={{
            label: isValid ? `Pay ${formatNaira(difference)}` : 'Pay the difference',
            // TODO (backend): real Paystack top-up in release builds (see top of file).
            onPress: () => (__DEV__ ? setSheetOpen(true) : handleResult('success')),
            disabled: !isValid,
          }}
          footnote="Card, bank transfer or USSD · Secured by Paystack"
        />
      }
    >
      <Text style={styles.label}>Quick raise</Text>
      <ChipRow
        options={RAISE_STEPS.map(stepLabel)}
        isSelected={(option) => option === stepLabel(difference)}
        onToggle={(option) => {
          const step = RAISE_STEPS.find((s) => stepLabel(s) === option) ?? 0;
          setNewPrice(String(task.price + step));
        }}
      />

      <Text style={styles.label}>New price</Text>
      <View style={[styles.priceRow, newPrice && !isValid ? styles.priceRowError : null]}>
        <Text style={styles.naira}>₦</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder={String(task.price + RAISE_STEPS[0])}
          placeholderTextColor={colors.textMuted}
          value={newPrice}
          onChangeText={(text) => setNewPrice(text.replace(/[^0-9]/g, ''))}
        />
      </View>
      <Text style={[styles.hint, newPrice && !isValid ? styles.hintError : null]}>
        {newPrice && !isValid ? `Must be more than ${formatNaira(task.price)}` : isValid ? `You'll pay ${formatNaira(difference)} more` : ' '}
      </Text>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <DevPaystackSheet visible={sheetOpen} amount={Math.max(difference, 0)} onResult={handleResult} />
    </SettingsPage>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.sectionLabel, color: colors.textSecondary, marginTop: 24, marginBottom: 10 },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  priceRowError: { borderColor: colors.warning },
  naira: { ...typography.heading, color: colors.textPrimary, marginRight: 6 },
  input: { flex: 1, paddingVertical: 12, ...typography.heading, color: colors.textPrimary },
  hint: { ...typography.hint, color: colors.textMuted, marginTop: 6 },
  hintError: { color: colors.warning },
  notice: { ...typography.hint, color: colors.textSecondary, marginTop: 16 },
});
