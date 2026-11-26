import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ActionSheet } from './ActionSheet';
import { formatNaira } from '../constants/priceSuggestions';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

// What can come back from Paystack's page: paid, a bank transfer that's still
// on its way, failed, or closed without paying.
export type MockPaymentResult = 'success' | 'transfer-pending' | 'failed' | 'cancelled';

type DevPaystackSheetProps = {
  visible: boolean;
  amount: number;
  onResult: (result: MockPaymentResult) => void;
};

// DEV ONLY stand-in for Paystack's secure page (where the real app lets the
// user pay by card, bank transfer or USSD), so every outcome can be tested
// before the backend exists.
export function DevPaystackSheet({ visible, amount, onResult }: DevPaystackSheetProps) {
  if (!__DEV__) return null;

  return (
    <ActionSheet
      visible={visible}
      onClose={() => onResult('cancelled')}
      header={
        <>
          <Text style={styles.devTag}>Developer tools · mock Paystack page</Text>
          <Text style={styles.amount}>{formatNaira(amount)}</Text>
          <Text style={styles.hint}>The real page offers card, bank transfer and USSD.</Text>
        </>
      }
      options={[
        { label: 'Simulate: payment succeeds', tone: 'good', onPress: () => onResult('success') },
        { label: 'Simulate: bank transfer still on its way', tone: 'normal', onPress: () => onResult('transfer-pending') },
        { label: 'Simulate: payment fails', tone: 'warning', onPress: () => onResult('failed') },
        { label: 'Close without paying', tone: 'muted', onPress: () => onResult('cancelled') },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  devTag: { ...typography.hint, color: colors.warning },
  amount: { ...typography.title, color: colors.textPrimary, marginTop: 10 },
  hint: { ...typography.body, color: colors.textMuted, marginTop: 2, marginBottom: 2 },
});
