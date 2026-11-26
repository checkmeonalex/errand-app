import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type SettingsRowProps = {
  icon: IconName;
  label: string;
  // Small grey text on the right, e.g. "Coming soon" or "1.0.0".
  value?: string;
  onPress?: () => void;
  // Red-orange, for destructive rows like "Delete account".
  danger?: boolean;
};

// One line in a settings list: icon, label, optional value and a chevron
// when it opens something.
export function SettingsRow({ icon, label, value, onPress, danger }: SettingsRowProps) {
  const color = danger ? colors.warning : colors.textPrimary;
  const content = (
    <>
      <Icon name={icon} color={danger ? colors.warning : colors.accentText} />
      <Text style={[styles.label, { color }]}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {onPress ? <Icon name="chevron-forward" color={colors.textMuted} /> : null}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <PressableScale accessibilityRole="button" haptic={false} style={styles.row} onPress={onPress}>
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
  },
  label: { ...typography.body, flex: 1 },
  value: { ...typography.hint, color: colors.textMuted },
});
