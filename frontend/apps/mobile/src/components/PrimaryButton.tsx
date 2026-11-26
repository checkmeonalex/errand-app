import React from 'react';
import { Text, ActivityIndicator, StyleSheet } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  // Shows a spinner and blocks taps while a request is running.
  loading?: boolean;
  // Drops the default top margin, e.g. inside BottomActionBar.
  flush?: boolean;
  // Warning colour for destructive actions, e.g. "Delete my account".
  danger?: boolean;
};

// The main navy call-to-action button used on forms.
export function PrimaryButton({ label, onPress, disabled, loading, flush, danger }: PrimaryButtonProps) {
  const inactive = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={[styles.button, danger && styles.danger, flush && styles.flush, inactive && styles.inactive]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 24,
  },
  danger: { backgroundColor: colors.warning },
  flush: { marginTop: 0 },
  inactive: { opacity: 0.45 },
  label: { ...typography.button, color: colors.white },
});
