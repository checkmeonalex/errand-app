import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { TextLink } from './TextLink';
import { formatTime } from '../utils/formatTime';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type PaymentStatusProps =
  // Back from Paystack; the backend is confirming the payment.
  | { kind: 'checking' }
  // Paid by bank transfer, but the money hasn't landed yet.
  | { kind: 'awaiting-transfer'; onDone: () => void; devArrive?: () => void }
  // Confirmed: the task is live (acceptBy set) or had already moved on.
  | { kind: 'paid'; title: string; acceptBy?: string; onDone: () => void };

// The full-screen states Checkout shows after the Paystack page closes.
export function PaymentStatus(props: PaymentStatusProps) {
  if (props.kind === 'checking') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.navy} size="large" />
        <Text style={styles.title}>Checking your payment…</Text>
        <Text style={styles.text}>This only takes a moment. Please don't close the app.</Text>
      </View>
    );
  }

  if (props.kind === 'awaiting-transfer') {
    return (
      <View style={styles.centered}>
        <View style={[styles.badge, styles.badgeWaiting]}>
          <Icon name="hourglass-outline" size={iconSizes.lg} color={colors.accentText} />
        </View>
        <Text style={styles.title}>Waiting for your transfer</Text>
        <Text style={styles.text}>
          Bank transfers can take a few minutes to arrive. We'll notify you as soon as your task is
          live. You can leave this screen; it's saved under Awaiting payment.
        </Text>
        <View style={styles.fullWidth}>
          <PrimaryButton label="Back to home" onPress={props.onDone} />
        </View>
        {__DEV__ && props.devArrive ? (
          <View style={styles.devLink}>
            <TextLink label="DEV: simulate the transfer arriving" onPress={props.devArrive} />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <View style={[styles.badge, styles.badgePaid]}>
        <Icon name="checkmark" size={iconSizes.lg} color={colors.white} />
      </View>
      <Text style={styles.title}>{props.acceptBy ? 'Paid and live' : 'Already paid'}</Text>
      <Text style={styles.text}>
        “{props.title}” is paid for.
        {props.acceptBy
          ? ` The first verified runner to accept it will message you in chat. If nobody accepts by ${formatTime(props.acceptBy)}, it comes down and you get a full refund.`
          : ''}
      </Text>
      <View style={styles.fullWidth}>
        <PrimaryButton label="Back to home" onPress={props.onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  badge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  badgePaid: { backgroundColor: colors.success },
  badgeWaiting: { backgroundColor: colors.accentLight },
  title: { ...typography.title, color: colors.textPrimary, marginTop: 16, textAlign: 'center' },
  text: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
  fullWidth: { alignSelf: 'stretch' },
  devLink: { marginTop: 16 },
});
