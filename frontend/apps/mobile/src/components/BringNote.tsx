import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Task } from '@errand/types';
import { Icon } from './Icon';
import { whatToBring } from '../utils/whatToBring';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

// "Bring: detergent" on runner screens. Renders nothing when there's nothing to bring.
export function BringNote({ task }: { task: Pick<Task, 'category' | 'extra_fields'> }) {
  const bring = whatToBring(task);
  if (!bring) return null;
  return (
    <View style={styles.note}>
      <Icon name="bag-handle-outline" size={iconSizes.sm} color={colors.accentText} />
      <Text style={styles.text}>Bring: {bring}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 18,
  },
  text: { ...typography.cardSubtitle, color: colors.accentText, flex: 1 },
});
