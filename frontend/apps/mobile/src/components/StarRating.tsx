import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';

const STARS = [1, 2, 3, 4, 5] as const;
export type Stars = (typeof STARS)[number];

type StarRatingProps = {
  value: number;
  // Leave out for a read-only display (e.g. on a review).
  onChange?: (stars: Stars) => void;
  size: number;
};

// Five stars: tap to rate, or just show a rating.
export function StarRating({ value, onChange, size }: StarRatingProps) {
  return (
    <View style={styles.row} accessibilityRole={onChange ? 'adjustable' : undefined} accessibilityLabel={`${value} out of 5 stars`}>
      {STARS.map((star) => {
        const icon = (
          <Icon name={star <= value ? 'star' : 'star-outline'} size={size} color={star <= value ? colors.navy : colors.border} />
        );
        return onChange ? (
          <PressableScale key={star} accessibilityLabel={`${star} stars`} onPress={() => onChange(star)} hitSlop={6}>
            {icon}
          </PressableScale>
        ) : (
          <View key={star}>{icon}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
});
