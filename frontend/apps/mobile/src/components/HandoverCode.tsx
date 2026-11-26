import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type HandoverCodeProps = {
  code: string;
};

// The poster's handover code, hidden until tapped so nobody nearby can read
// it off the screen. The runner types it in at handover to release payment.
export function HandoverCode({ code }: HandoverCodeProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="key-outline" color={colors.accentText} />
        <Text style={styles.title}>Handover code</Text>
      </View>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={revealed ? 'Hide handover code' : 'Show handover code'}
        style={styles.codeBox}
        onPress={() => setRevealed((current) => !current)}
      >
        <Text style={[styles.code, !revealed && styles.codeHidden]}>
          {revealed ? code.split('').join(' ') : '• • • •'}
        </Text>
        <Text style={styles.toggle}>{revealed ? 'Tap to hide' : 'Tap to show'}</Text>
      </PressableScale>

      <Text style={styles.warning}>
        Don't give this to the runner until your task is completed. It releases their payment.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { ...typography.cardTitle, color: colors.textPrimary },
  codeBox: {
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
  },
  code: { ...typography.title, color: colors.navy, letterSpacing: 4 },
  codeHidden: { color: colors.accentText },
  toggle: { ...typography.hint, color: colors.accentText, marginTop: 4 },
  warning: { ...typography.hint, color: colors.textMuted, marginTop: 10 },
});
