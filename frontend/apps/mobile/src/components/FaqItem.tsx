import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type FaqItemProps = {
  question: string;
  answer: string;
};

// A question that opens to show its answer when tapped.
export function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      haptic={false}
      style={styles.item}
      onPress={() => setOpen((current) => !current)}
    >
      <Text style={styles.question}>{question}</Text>
      <Icon name={open ? 'chevron-up' : 'chevron-down'} color={colors.textMuted} />
      {open ? <Text style={styles.answer}>{answer}</Text> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
  },
  question: { ...typography.cardTitle, color: colors.textPrimary, flex: 1 },
  answer: { ...typography.body, color: colors.textMuted, marginTop: 8, width: '100%' },
});
