import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type CategoryCardProps = {
  label: string;
  icon: IconName;
  // Short price line, e.g. "From ₦500".
  priceTag?: string;
  onPress: () => void;
  // Faded with a "Coming soon" pill. Still tappable so the screen can count
  // taps as a demand signal.
  comingSoon?: boolean;
};

// A tappable category tile in the home screen's two-column grid.
export function CategoryCard({ label, icon, priceTag, onPress, comingSoon }: CategoryCardProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      style={[styles.card, comingSoon && styles.cardComingSoon]}
      onPress={onPress}
    >
      <View style={styles.iconBadge}>
        <Icon name={icon} color={colors.accentText} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {comingSoon ? (
        <Text style={styles.comingSoon}>Coming soon</Text>
      ) : priceTag ? (
        <Text style={styles.priceTag}>{priceTag}</Text>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: colors.background,
  },
  cardComingSoon: { opacity: 0.5, borderStyle: 'dashed' },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { ...typography.cardTitle, color: colors.textPrimary, marginTop: 12 },
  priceTag: { ...typography.cardSubtitle, color: colors.textMuted, marginTop: 2 },
  comingSoon: { ...typography.cardSubtitle, color: colors.accentText, marginTop: 2 },
});
