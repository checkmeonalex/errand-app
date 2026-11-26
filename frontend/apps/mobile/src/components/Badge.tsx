import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BadgeId } from '@errand/types';
import { Icon } from './Icon';
import { getBadge } from '../constants/badges';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type BadgeProps = {
  id: BadgeId;
  // Greyed out: not earned yet (shown on the profile's badge shelf).
  locked?: boolean;
};

// A small pill for one badge, e.g. "🏳 Pioneer". Used on the profile and
// leaderboard rows (and later on task and runner cards).
export function Badge({ id, locked }: BadgeProps) {
  const badge = getBadge(id);
  if (!badge) return null;

  return (
    <View style={[styles.pill, locked && styles.pillLocked]}>
      <Icon
        name={locked ? 'lock-closed' : badge.icon}
        size={iconSizes.sm}
        color={locked ? colors.textMuted : colors.accentText}
      />
      <Text style={[styles.label, locked && styles.labelLocked]}>{badge.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillLocked: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  label: { ...typography.pill, color: colors.accentText },
  labelLocked: { color: colors.textMuted },
});
