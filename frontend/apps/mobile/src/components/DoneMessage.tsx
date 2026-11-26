import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, type IconName } from './Icon';
import { PrimaryButton } from './PrimaryButton';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type DoneMessageProps = {
  icon: IconName;
  title: string;
  text: string;
  buttonLabel: string;
  onDone: () => void;
};

// A full-screen "it's done" message with one button, e.g. "Report sent".
export function DoneMessage({ icon, title, text, buttonLabel, onDone }: DoneMessageProps) {
  return (
    <View style={styles.centered}>
      <View style={styles.badge}>
        <Icon name={icon} size={iconSizes.lg} color={colors.white} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      <View style={styles.fullWidth}>
        <PrimaryButton label={buttonLabel} onPress={onDone} />
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
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.title, color: colors.textPrimary, marginTop: 16, textAlign: 'center' },
  text: { ...typography.body, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
  fullWidth: { alignSelf: 'stretch' },
});
