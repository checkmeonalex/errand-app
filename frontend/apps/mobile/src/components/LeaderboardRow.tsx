import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { LeaderboardEntry } from '@errand/types';
import { Badge } from './Badge';
import { Avatar } from './Avatar';
import { Icon } from './Icon';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
  // The signed-in user's own row: highlighted, labelled "You".
  isMe?: boolean;
};

// One place on a board: rank, photo, display name, badges, completed
// tasks and rating. Rank 0 means not ranked yet (shown as "–").
export function LeaderboardRow({ entry, isMe }: LeaderboardRowProps) {
  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <Text style={[styles.rank, entry.rank > 0 && entry.rank <= 3 && styles.rankTop]}>
        {entry.rank > 0 ? entry.rank : '–'}
      </Text>
      <Avatar uri={entry.avatar_url} name={entry.display_name} size={40} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {isMe ? `You · ${entry.display_name}` : entry.display_name}
        </Text>
        {entry.badges.length > 0 ? (
          <View style={styles.badges}>
            {entry.badges.map((id) => (
              <Badge key={id} id={id} />
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.stats}>
        <Text style={styles.count}>{entry.completed_count}</Text>
        <Text style={styles.countLabel}>done</Text>
        {entry.rating !== null ? (
          <View style={styles.ratingRow}>
            <Icon name="star" size={iconSizes.sm} color={colors.navy} />
            <Text style={styles.rating}>{entry.rating.toFixed(1)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.background,
  },
  rowMe: { backgroundColor: colors.accentLight },
  rank: { ...typography.cardTitle, color: colors.textMuted, width: 24, textAlign: 'center' },
  rankTop: { color: colors.navy },
  text: { flex: 1, gap: 4 },
  name: { ...typography.cardTitle, color: colors.textPrimary },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  stats: { alignItems: 'flex-end' },
  count: { ...typography.heading, color: colors.navy },
  countLabel: { ...typography.hint, color: colors.textMuted },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  rating: { ...typography.hint, color: colors.textMuted },
});
