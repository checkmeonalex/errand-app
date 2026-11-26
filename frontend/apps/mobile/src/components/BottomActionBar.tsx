import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { TextLink } from './TextLink';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type Action = { label: string; onPress: () => void; loading?: boolean; disabled?: boolean; danger?: boolean };

type BottomActionBarProps = {
  primary?: Action;
  // A quieter action shown as a link above the main button, e.g. "Cancel".
  secondary?: Action;
  // Small reassurance line under the main button, e.g. "Secured by Paystack".
  footnote?: string;
};

// Actions pinned to the bottom of the screen so they're always reachable.
// Renders nothing when there are no actions.
export function BottomActionBar({ primary, secondary, footnote }: BottomActionBarProps) {
  const insets = useSafeAreaInsets();
  if (!primary && !secondary) return null;

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
      {secondary ? (
        <View style={[styles.secondary, !primary && styles.secondaryOnly]}>
          <TextLink label={secondary.label} onPress={secondary.onPress} />
        </View>
      ) : null}
      {primary ? (
        <PrimaryButton
          label={primary.label}
          onPress={primary.onPress}
          loading={primary.loading}
          disabled={primary.disabled}
          danger={primary.danger}
          flush
        />
      ) : null}
      {footnote ? (
        <View style={styles.footnote}>
          <Icon name="lock-closed" size={iconSizes.sm} color={colors.textMuted} />
          <Text style={styles.footnoteText}>{footnote}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  secondary: { alignItems: 'center', marginBottom: 12 },
  secondaryOnly: { marginBottom: 0 },
  footnote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 },
  footnoteText: { ...typography.hint, color: colors.textMuted },
});
