import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Review } from '@errand/types';
import { StarRating } from './StarRating';
import { formatTime } from '../utils/formatTime';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type ReviewItemProps = {
  review: Pick<Review, 'stars' | 'tags' | 'comment' | 'created_at'>;
  // Who wrote it, e.g. "You" or "Ada".
  author: string;
};

// One review on a runner's profile: stars, tags, comment, who and when.
export function ReviewItem({ review, author }: ReviewItemProps) {
  return (
    <View style={styles.item}>
      <View style={styles.top}>
        <StarRating value={review.stars} size={iconSizes.sm} />
        {review.tags.length ? <Text style={styles.tags}>{review.tags.join(' · ')}</Text> : null}
      </View>
      {review.comment ? <Text style={styles.comment}>“{review.comment}”</Text> : null}
      <Text style={styles.meta}>
        {author} · {formatTime(review.created_at)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { padding: 14, gap: 6 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  tags: { ...typography.cardSubtitle, color: colors.textSecondary },
  comment: { ...typography.body, color: colors.textPrimary },
  meta: { ...typography.hint, color: colors.textMuted },
});
