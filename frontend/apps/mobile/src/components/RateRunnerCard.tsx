import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Review, TaskRunner } from '@errand/types';
import { Avatar } from './Avatar';
import { PrimaryButton } from './PrimaryButton';
import { StarRating } from './StarRating';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

type RateRunnerCardProps = {
  runner: TaskRunner;
  // The poster's rating, once given.
  review?: Review;
  onRate: () => void;
};

// On a done task's detail: "Rate {runner}" until rated, then the rating given.
export function RateRunnerCard({ runner, review, onRate }: RateRunnerCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Avatar uri={runner.avatar_url} name={runner.first_name} size={40} />
        <View style={styles.text}>
          <Text style={styles.title}>{review ? `You rated ${runner.first_name}` : `How was ${runner.first_name}?`}</Text>
          {review ? (
            <StarRating value={review.stars} size={iconSizes.sm} />
          ) : (
            <Text style={styles.hint}>Your rating helps other students choose.</Text>
          )}
        </View>
      </View>
      {review ? null : <PrimaryButton label={`Rate ${runner.first_name}`} onPress={onRate} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { flex: 1, gap: 4 },
  title: { ...typography.cardTitle, color: colors.textPrimary },
  hint: { ...typography.cardSubtitle, color: colors.textMuted },
});
