import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hasError?: boolean;
};

// A tappable row with a checkbox, e.g. "I'll provide the cleaning supplies".
export function CheckboxRow({ label, checked, onChange, hasError }: CheckboxRowProps) {
  return (
    <PressableScale
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[styles.row, checked && styles.rowChecked, hasError && styles.rowError]}
      onPress={() => onChange(!checked)}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Icon name="checkmark" size={iconSizes.sm} color={colors.white} /> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.background,
  },
  rowChecked: { borderColor: colors.navy, backgroundColor: colors.accentLight },
  rowError: { borderColor: colors.warning },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: { backgroundColor: colors.navy },
  label: { ...typography.body, color: colors.textPrimary, flex: 1 },
});
