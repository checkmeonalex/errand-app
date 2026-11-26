import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { BadgeId } from '@errand/types';
import { Badge } from './Badge';
import { BADGES, type BadgeInfo } from '../constants/badges';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type BadgeShelfProps = {
  // Badges the user has earned (from their profile).
  earned: BadgeId[];
  side: BadgeInfo['side'];
};

// Every badge for one side: earned ones in colour, the rest greyed out with
// how to earn them, so there's always something to aim for.
export function BadgeShelf({ earned, side }: BadgeShelfProps) {
  const badges = BADGES.filter((badge) => badge.side === side);

  return (
    <View style={styles.list}>
      {badges.map((badge) => {
        const isEarned = earned.includes(badge.id);
        return (
          <View key={badge.id} style={styles.row}>
            <Badge id={badge.id} locked={!isEarned} />
            <Text style={styles.how}>{isEarned ? 'Earned' : badge.howToEarn}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  row: { gap: 4 },
  how: { ...typography.hint, color: colors.textMuted },
});
