import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TaskRunner } from '@errand/types';
import { Icon } from './Icon';
import { Avatar } from './Avatar';
import { PressableScale } from './PressableScale';
import { formatRating } from '../utils/formatRating';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type RunnerCardProps = {
  runner: TaskRunner;
  // Opens the runner's profile when given.
  onPress?: () => void;
};

// Who accepted the task: photo, first name, rating and tasks done, so the
// poster knows who they're dealing with.
export function RunnerCard({ runner, onPress }: RunnerCardProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${runner.first_name}'s profile`}
      haptic={false}
      disabled={!onPress}
      onPress={onPress}
      style={styles.card}
    >
      <Avatar uri={runner.avatar_url} name={runner.first_name} size={44} />
      <View style={styles.text}>
        <Text style={styles.name}>{runner.first_name}</Text>
        <View style={styles.statsRow}>
          <Icon name="star" size={iconSizes.sm} color={colors.navy} />
          <Text style={styles.stats}>
            {formatRating(runner.rating)} · {runner.completed_count} tasks done
          </Text>
        </View>
      </View>
      <View style={styles.badge}>
        <Icon name="shield-checkmark" size={iconSizes.sm} color={colors.accentText} />
        <Text style={styles.badgeText}>Verified</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  text: { flex: 1 },
  name: { ...typography.cardTitle, color: colors.textPrimary },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  stats: { ...typography.cardSubtitle, color: colors.textMuted },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentLight,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: { ...typography.pill, color: colors.accentText },
});
