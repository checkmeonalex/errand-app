import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors } from '../theme/colors';
import { iconSizes, typography } from '../theme/typography';

// Shown at the top of every chat. Phone numbers are allowed (calls help at
// handover), so this is the guard against the two ways people get scammed.
export function ChatSafetyBanner() {
  return (
    <View style={styles.banner}>
      <Icon name="shield-checkmark-outline" size={iconSizes.sm} color={colors.accentText} />
      <Text style={styles.text}>
        Keep payment in Taskly. Don't give your handover code until your task is completed.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  text: { ...typography.hint, color: colors.accentText, flex: 1 },
});
