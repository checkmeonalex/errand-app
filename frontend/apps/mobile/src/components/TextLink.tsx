import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type TextLinkProps = {
  label: string;
  onPress: () => void;
};

// A tappable navy text link, e.g. "Log in" or "Forgot password?".
export function TextLink({ label, onPress }: TextLinkProps) {
  return (
    <PressableScale accessibilityRole="link" onPress={onPress} hitSlop={8} haptic={false}>
      <Text style={styles.label}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.button, color: colors.navy },
});
