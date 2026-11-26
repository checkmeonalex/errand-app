import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type ChoiceCardProps = {
  title: string;
  subtitle: string;
  icon?: IconName;
  onPress: () => void;
};

// A full-width card for picking one path, e.g. "I need something done" on
// RoleSelect or "Tutoring" on the subcategory screen.
export function ChoiceCard({ title, subtitle, icon, onPress }: ChoiceCardProps) {
  return (
    <PressableScale accessibilityRole="button" style={styles.card} onPress={onPress}>
      {icon ? (
        <View style={styles.iconBadge}>
          <Icon name={icon} color={colors.accentText} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-forward" color={colors.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    backgroundColor: colors.background,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { ...typography.cardTitle, color: colors.textPrimary },
  subtitle: { ...typography.cardSubtitle, color: colors.textMuted, marginTop: 3 },
});
