import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LevelProgress as LevelInfo } from '../utils/getLevel';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type LevelProgressProps = {
  level: LevelInfo;
};

// "Regular" + a bar + "3 more completed tasks to reach Valued".
export function LevelProgress({ level }: LevelProgressProps) {
  return (
    <View>
      <View style={styles.titleRow}>
        <Text style={styles.label}>Level</Text>
        <Text style={styles.title}>{level.title}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(level.progress * 100)}%` }]} />
      </View>
      <Text style={styles.next}>
        {level.next
          ? `${level.next.remaining} more completed ${level.next.remaining === 1 ? 'task' : 'tasks'} to reach ${level.next.title}`
          : 'Top level reached'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { ...typography.sectionLabel, color: colors.textSecondary },
  title: { ...typography.cardTitle, color: colors.navy },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentLight,
    overflow: 'hidden',
    marginTop: 8,
  },
  fill: { height: '100%', borderRadius: 4, backgroundColor: colors.navy },
  next: { ...typography.hint, color: colors.textMuted, marginTop: 6 },
});
