import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type HeaderIconButtonProps = {
  icon: IconName;
  // Screen-reader name, e.g. "Messages".
  label: string;
  // Orange badge with the count; hidden at 0.
  badgeCount: number;
  onPress: () => void;
};

// A round icon button for the navy home header (chat, notifications) with an
// unread badge.
export function HeaderIconButton({ icon, label, badgeCount, onPress }: HeaderIconButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={badgeCount > 0 ? `${label}, ${badgeCount} unread` : label}
      style={styles.button}
      onPress={onPress}
    >
      <Icon name={icon} color={colors.white} />
      {badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.headerButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: colors.warning,
    borderWidth: 2,
    borderColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { ...typography.badge, color: colors.white },
});
