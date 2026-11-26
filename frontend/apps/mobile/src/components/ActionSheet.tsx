import React from 'react';
import { Modal, Pressable, View, Text, StyleSheet } from 'react-native';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export type ActionSheetOption = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  // Colour of the option: normal (navy), good (green), warning (orange), muted (grey).
  tone?: 'normal' | 'good' | 'warning' | 'muted';
};

type ActionSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  // Optional content above the options, e.g. an amount.
  header?: React.ReactNode;
  options: ActionSheetOption[];
};

// A sheet that slides up from the bottom with a few choices. Tapping outside
// or Back closes it. Works the same on phones and web.
export function ActionSheet({ visible, onClose, title, header, options }: ActionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close">
        {/* Inner Pressable stops taps on the sheet from closing it. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {header}
          {options.map((option) => {
            const color = TONE_COLORS[option.tone ?? 'normal'];
            return (
              <PressableScale
                key={option.label}
                accessibilityRole="button"
                style={[styles.option, { borderColor: color }]}
                onPress={option.onPress}
              >
                {option.icon ? <Icon name={option.icon} color={color} /> : null}
                <Text style={[styles.optionText, { color }]}>{option.label}</Text>
              </PressableScale>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const TONE_COLORS = {
  normal: colors.navy,
  good: colors.success,
  warning: colors.warning,
  muted: colors.textMuted,
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  title: { ...typography.heading, color: colors.textPrimary, marginBottom: 6 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 10,
  },
  optionText: { ...typography.button },
});
