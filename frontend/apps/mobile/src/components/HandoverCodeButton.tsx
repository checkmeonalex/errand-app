import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type HandoverCodeButtonProps = {
  code: string;
};

// Compact version of HandoverCode for the chat, where the poster usually is
// at handover. One tap shows the code, another hides it.
export function HandoverCodeButton({ code }: HandoverCodeButtonProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={revealed ? 'Hide handover code' : 'Show handover code'}
      style={styles.button}
      onPress={() => setRevealed((current) => !current)}
    >
      <Icon name="key-outline" size={iconSizes.sm} color={colors.accentText} />
      {revealed ? (
        <View style={styles.revealed}>
          <Text style={styles.code}>{code.split('').join(' ')}</Text>
          <Text style={styles.hint}>Only give it once your task is completed · Tap to hide</Text>
        </View>
      ) : (
        <Text style={styles.label}>Show handover code</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  label: { ...typography.button, color: colors.accentText },
  revealed: { flex: 1 },
  code: { ...typography.heading, color: colors.navy, letterSpacing: 3 },
  hint: { ...typography.hint, color: colors.accentText, marginTop: 2 },
});
